import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

const scrollbarStyle = `
  .preview-scroll::-webkit-scrollbar {
    width: 8px;
  }
  .preview-scroll::-webkit-scrollbar-track {
    background: #f0f4ff;
    border-radius: 4px;
  }
  .preview-scroll::-webkit-scrollbar-thumb {
    background: #60a5fa;
    border-radius: 4px;
  }
  .preview-scroll::-webkit-scrollbar-thumb:hover {
    background: #3b82f6;
  }
`;

interface ExcelRow {
  student_code?: string | number;
  student_name?: string;
  course_name?: string;
  grade?: number;
}

const BulkUploadTab = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ student_code: string; student_name: string; grade?: number; isValid: boolean; error?: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; course_name: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const { toast } = useToast();

  // Load courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      const { data } = await supabase.from('courses').select('id, course_name');
      if (data) {
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      }
    };
    loadCourses();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      
      // Preview the data
      try {
        const data = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(data);
        console.log('Workbook sheets:', workbook.SheetNames);
        const sheetName = workbook.SheetNames[0];
        console.log('Using sheet:', sheetName);
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const dataRows = jsonData.slice(1) as (string | number)[][];
        
        const previewData: { student_code: string; student_name: string; grade?: number; isValid: boolean; error?: string }[] = [];
        const seenRecords = new Set<string>();
        
        for (let index = 0; index < Math.min(dataRows.length, 15); index++) { // Preview first 15 rows
          const row = dataRows[index];
          const rowNumber = index + 2;
          
          let isValid = true;
          let error = '';
          
          // Validation checks - 3 columns: student_code, student_name, grade
          if (!row[0] || !row[1]) {
            isValid = false;
            error = 'حقول ناقصة';
          } else if (row[2] === undefined || row[2] === null || row[2] === '') {
            isValid = false;
            error = 'درجة مفقودة';
          } else if (isNaN(Number(row[2]))) {
            isValid = false;
            error = 'درجة غير صحيحة';
          } else {
            const studentCode = String(row[0]).trim();
            if (seenRecords.has(studentCode)) {
              isValid = false;
              error = 'تكرار';
            }
            seenRecords.add(studentCode);
          }
          
          const gradeValue = row[2];
          const grade = (typeof gradeValue === 'number' || (typeof gradeValue === 'string' && !isNaN(Number(gradeValue)))) 
            ? Number(gradeValue) 
            : undefined;
          
          previewData.push({
            student_code: String(row[0] || '').trim(),
            student_name: String(row[1] || '').trim(),
            grade: grade,
            isValid: isValid,
            error: error
          });
        }
        setPreview(previewData);
      } catch (error) {
        console.error('Preview error:', error);
        setPreview([]);
      }
    } else {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار ملف Excel صحيح (.xlsx أو .xls)",
        variant: "destructive",
      });
      setFile(null);
      setPreview([]);
    }
  };

  const processExcel = async () => {
    if (!file) return;

    setLoading(true);
    try {
      console.log('Starting file processing...');
      const data = await file.arrayBuffer();
      console.log('File loaded, size:', data.byteLength);

      const workbook = XLSX.read(data);
      console.log('Workbook sheets:', workbook.SheetNames);
      const sheetName = workbook.SheetNames[0];
      console.log('Using sheet:', sheetName);
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('Raw data:', jsonData);

      // Skip header row and process data
      const dataRows = jsonData.slice(1) as (string | number)[][];
      console.log('Data rows:', dataRows);

      // Expected columns: 0: student_code, 1: student_name, 2: grade (mandatory)
      const processedData: { student_code: string; student_name: string; grade: number }[] = [];
      const invalidRows: string[] = [];
      const seenRecords = new Set<string>();

      for (let index = 0; index < dataRows.length; index++) {
        const row = dataRows[index];
        const rowNumber = index + 2; // +1 for header, +1 for human-readable (not 0-indexed)
        
        console.log(`Processing row ${rowNumber}:`, row);
        
        // Check if all first two columns exist (student_code, student_name)
        if (!row[0] || !row[1]) {
          invalidRows.push(`الصف ${rowNumber}: العموديات الأولى والثانية مطلوبة (رقم الطالب، اسم الطالب)`);
          continue;
        }
        
        // Check if grade is provided and valid (mandatory)
        const gradeValue = row[2];
        if (gradeValue === undefined || gradeValue === null || gradeValue === '') {
          invalidRows.push(`الصف ${rowNumber}: الدرجة مطلوبة - يجب إدخال درجة في العمود الثالث`);
          continue;
        }
        
        const gradeNumber = typeof gradeValue === 'number' ? gradeValue : Number(gradeValue);
        if (isNaN(gradeNumber)) {
          invalidRows.push(`الصف ${rowNumber}: الدرجة يجب أن تكون رقماً صحيحاً`);
          continue;
        }
        
        const studentCode = String(row[0]).trim();
        
        // Check for duplicates within the file
        if (seenRecords.has(studentCode)) {
          invalidRows.push(`الصف ${rowNumber}: تكرار - الطالب '${studentCode}' موجود بالفعل في الملف`);
          continue;
        }
        
        seenRecords.add(studentCode);
        
        processedData.push({
          student_code: studentCode,
          student_name: String(row[1]).trim(),
          grade: gradeNumber
        });
      }

      console.log('Processed data:', processedData);
      console.log('Invalid rows:', invalidRows);

      // If there are any errors, show them and prevent upload
      if (invalidRows.length > 0) {
        const errorMessage = invalidRows.slice(0, 5).join('\n');
        const totalErrors = invalidRows.length;
        const errorSuffix = totalErrors > 5 ? `\n... و ${totalErrors - 5} أخطاء أخرى` : '';
        throw new Error(`وجدت أخطاء في البيانات:\n${errorMessage}${errorSuffix}`);
      }

      if (processedData.length === 0) {
        throw new Error("لا توجد بيانات صحيحة في الملف - تأكد من وجود البيانات في الأعمدة الأربعة الأولى");
      }

      // Get existing students and courses
      const { data: existingStudents } = await supabase.from('students').select('student_code');
      const { data: existingCourses } = await supabase.from('courses').select('course_name');

      const studentCodes = new Set(existingStudents?.map(s => s.student_code) || []);
      const courseNames = new Set(existingCourses?.map(c => c.course_name) || []);

      // Insert new students (ignore duplicates by checking existing)
      const newStudents = processedData
        .filter(row => !studentCodes.has(row.student_code))
        .map(row => ({ student_code: row.student_code, student_name: row.student_name }));

      console.log('New students to insert:', newStudents);

      if (newStudents.length > 0) {
        const { error: studentError } = await supabase.from('students').insert(newStudents);
        if (studentError) {
          console.error('Student insert error:', studentError);
          throw studentError;
        }
        console.log('Students inserted successfully');
      }

      // Insert new courses (ignore duplicates by checking existing)
      console.log('Courses already managed in CoursesTab - no new courses created');

      // Validate that a course is selected
      if (!selectedCourseId) {
        throw new Error('يجب اختيار مادة أولاً');
      }

      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      if (!selectedCourse) {
        throw new Error('المادة المختارة غير متاحة');
      }

      console.log('Using course:', selectedCourse.course_name);

      // Insert grades (all have grades now, they're mandatory)
      const gradeInserts = [];
      for (const row of processedData) {
        console.log('Looking up student:', row.student_code);
        const { data: student, error: studentLookupError } = await supabase.from('students').select('id').eq('student_code', row.student_code).single();
        if (studentLookupError) {
          console.error('Student lookup error:', studentLookupError);
          continue;
        }

        if (student) {
          gradeInserts.push({
            student_id: student.id,
            course_id: selectedCourse.id,
            grade: row.grade
          });
        }
      }

      console.log('Grade inserts:', gradeInserts);

      if (gradeInserts.length > 0) {
        const { error: gradeError } = await supabase.from('grades').upsert(gradeInserts, { onConflict: 'student_id,course_id' });
        if (gradeError) {
          console.error('Grade insert error:', gradeError);
          throw gradeError;
        }
        console.log('Grades inserted successfully');
      }

      console.log('Summary:');
      console.log('- Processed rows:', processedData.length);
      console.log('- New students inserted:', newStudents.length);
      console.log('- Grades inserted/updated:', gradeInserts.length);

      toast({
        title: "نجح الرفع",
        description: `تم رفع ${processedData.length} سجل (${newStudents.length} طالب جديد, ${gradeInserts.length} درجة) للمادة: ${selectedCourse.course_name}`,
      });

      setFile(null);
      setPreview([]);
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : "حدث خطأ غير معروف أثناء رفع البيانات";
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllData = async () => {
    try {
      // Delete in order: grades first (due to foreign keys), then students, then courses
      const { error: gradeError } = await supabase.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      if (gradeError) throw gradeError;

      const { error: studentError } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (studentError) throw studentError;

      const { error: courseError } = await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (courseError) throw courseError;

      toast({
        title: "تم الحذف",
        description: "تم حذف جميع البيانات بنجاح",
      });
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const message = error instanceof Error ? error.message : "حدث خطأ غير معروف";
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-[var(--shadow-glow)]">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">رفع البيانات بالجملة</h2>
          <p className="text-muted-foreground">
            ارفع ملف Excel يحتوي على بيانات الطلاب والدرجات
          </p>
        </div>

        <div className="space-y-4 ">
          <div className="grid grid-cols-2 gap-4 ">
            <div>
              <Label htmlFor="course-select"  >اختر المادة</Label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="flex h-10 w-full cursor-pointer rounded-lg border border-input px-3 py-2 bg-secondary/40 transition-colors md:text-sm mt-2 "
              >
                <option value="" className=" bg-secondary">-- اختر مادة --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id} className=" bg-secondary" >
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="excel-file">اختر ملف Excel (.xlsx)</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mt-2 cursor-pointer"
              />
            </div>
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              الملف المختار: {file.name}
            </div>
          )}

          {preview.length > 0 && (
            <div className="bg-secondary/50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  معاينة البيانات (أول 15 صف)
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">{preview.length} صف</span>
                </h3>
              </div>
              <div className="preview-scroll max-h-96 overflow-y-auto bg-white">
                {/* Header Row */}
                <div className="sticky top-0 bg-gray-100 grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold text-gray-700 border-b border-gray-200">
                  <div className="col-span-2">رقم الطالب</div>
                  <div className="col-span-3">اسم الطالب</div>
                  <div className="col-span-2">الدرجة</div>
                  <div className="col-span-2">الخطاء</div>
                </div>

                {/* Data Rows */}
                {preview.map((row, index) => (
                  <div 
                    key={index} 
                    className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 text-sm transition-colors ${
                      row.isValid 
                        ? 'bg-green-50 hover:bg-green-100' 
                        : 'bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <div className="col-span-2 font-mono text-gray-700 truncate">{row.student_code || '—'}</div>
                    <div className="col-span-3 text-gray-700 truncate">{row.student_name || '—'}</div>
                    <div className="col-span-2 font-semibold text-gray-700">{row.grade ?? '—'}</div>
                    <div className="col-span-2 flex items-center gap-1">
                      {row.isValid ? (
                        <span className="flex items-center gap-1 text-green-700 text-xs font-semibold">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          صحيح
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-700 text-xs font-semibold">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {row.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">تنسيق الملف المطلوب:</h3>
            <p className="text-sm text-muted-foreground">
              العمود الأول: كود الطالب<br />
              العمود الثاني: اسم الطالب<br />
              العمود الثالث: الدرجة (رقم، <span className="font-semibold text-foreground">مطلوب</span>)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              * الصف الأول هو العناوين (سيتم تجاهله)<br />
              * جميع الحقول مطلوبة بما فيها الدرجة<br />
              * لا يمكن أن يكون هناك تكرار لنفس الطالب في الملف<br />
              * يجب إضافة المواد أولاً من تبويب "المواد" قبل الرفع
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={processExcel}
              disabled={!file || loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "جاري الرفع..." : "رفع البيانات"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  حذف جميع البيانات
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex flex-row justify-start">هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف جميع الطلاب والمواد والدرجات نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="mx-3" >إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BulkUploadTab;
