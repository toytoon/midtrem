import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { sanitizeInput, validateGrade, logAdminAction } from "@/integrations/supabase/auth";

interface Grade {
  id: string;
  grade: number;
  students: { student_name: string; student_code: string };
  courses: { course_name: string };
  student_id: string;
  course_id: string;
}

interface Student {
  id: string;
  student_code: string;
  student_name: string;
}

interface Course {
  id: string;
  course_name: string;
}

export const GradesTab = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [newGrade, setNewGrade] = useState({ studentId: "", courseId: "", grade: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [gradesRes, studentsRes, coursesRes] = await Promise.all([
        supabase.from("grades").select(`
          *,
          students (student_name, student_code),
          courses (course_name)
        `).order("created_at", { ascending: false }),
        supabase.from("students").select("*").order("student_code"),
        supabase.from("courses").select("*").order("course_name")
      ]);

      if (gradesRes.error) throw gradesRes.error;
      if (studentsRes.error) throw studentsRes.error;
      if (coursesRes.error) throw coursesRes.error;

      setGrades(gradesRes.data || []);
      setStudents(studentsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchCode]);

  const handleAddGrade = async () => {
    if (!newGrade.studentId || !newGrade.courseId || !newGrade.grade) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const gradeNum = parseInt(sanitizeInput(newGrade.grade));
    if (!validateGrade(gradeNum)) {
      toast({
        title: "خطأ",
        description: "الدرجة يجب أن تكون رقماً صحيحاً بين 0 و 30",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("grades").insert([{
        student_id: newGrade.studentId,
        course_id: newGrade.courseId,
        grade: gradeNum
      }]);

      if (error) throw error;

      // Log action
      const adminCode = sessionStorage.getItem("adminName") || "unknown";
      await logAdminAction(adminCode, "grades", "insert", {
        student_id: newGrade.studentId,
        course_id: newGrade.courseId,
        grade: gradeNum,
      });

      toast({ title: "نجح", description: "تم إضافة الدرجة بنجاح" });
      setNewGrade({ studentId: "", courseId: "", grade: "" });
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      const errorObj = error as { message?: string };
      const isConflict = errorObj.message?.includes("duplicate");
      const description = isConflict ? "الدرجة موجودة مسبقاً لهذا الطالب في هذه المادة" : "فشل إضافة الدرجة";
      toast({
        title: "خطأ",
        description: description,
        variant: "destructive",
      });
    }
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade) return;

    const gradeNum = editingGrade.grade;
    if (!validateGrade(gradeNum)) {
      toast({
        title: "خطأ",
        description: "الدرجة يجب أن تكون رقماً صحيحاً بين 0 و 30",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("grades")
        .update({ grade: gradeNum })
        .eq("id", editingGrade.id);

      if (error) throw error;

      // Log action
      const adminCode = sessionStorage.getItem("adminName") || "unknown";
      await logAdminAction(adminCode, "grades", "update", {
        grade_id: editingGrade.id,
        new_grade: gradeNum,
      });

      toast({ title: "نجح", description: "تم تحديث الدرجة بنجاح" });
      setEditingGrade(null);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الدرجة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدرجة؟")) return;

    try {
      const { error } = await supabase.from("grades").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "نجح", description: "تم حذف الدرجة بنجاح" });
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف الدرجة",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="bg-card/95 backdrop-blur-sm border-border">
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Filter grades by student code
  const filteredGrades = grades.filter(grade =>
    grade.students.student_code.toLowerCase().includes(searchCode.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGrades = filteredGrades.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">إدارة الدرجات</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingGrade(null);
                setNewGrade({ studentId: "", courseId: "", grade: "" });
              }}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              إضافة درجة
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground text-right mt-4">
                {editingGrade ? "تعديل درجة" : "إضافة درجة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!editingGrade && (
                <>
                  <Select value={newGrade.studentId} onValueChange={(v) => setNewGrade({ ...newGrade, studentId: v })}>
                    <SelectTrigger className="text-right bg-secondary/50 border-border">
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.student_name} ({s.student_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newGrade.courseId} onValueChange={(v) => setNewGrade({ ...newGrade, courseId: v })}>
                    <SelectTrigger className="text-right bg-secondary/50 border-border">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              <Input
                type="number"
                min="0"
                max="30"
                placeholder="الدرجة (0-30)"
                value={editingGrade ? editingGrade.grade : newGrade.grade}
                onChange={(e) =>
                  editingGrade
                    ? setEditingGrade({ ...editingGrade, grade: parseInt(e.target.value) || 0 })
                    : setNewGrade({ ...newGrade, grade: e.target.value })
                }
                className="text-right bg-secondary/50 border-border"
              />
              <Button
                onClick={editingGrade ? handleUpdateGrade : handleAddGrade}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {editingGrade ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="ابحث برقم الطالب..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="flex-1 bg-secondary/50 border-border"
        />
        {searchCode && (
          <Button
            variant="outline"
            onClick={() => setSearchCode("")}
            className="border-border"
          >
            مسح
          </Button>
        )}
      </div>

      <Card className="bg-card/95 backdrop-blur-sm border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-right text-foreground">الطالب</TableHead>
              <TableHead className="text-right text-foreground">المادة</TableHead>
              <TableHead className="text-right text-foreground">الدرجة</TableHead>
              <TableHead className="text-right text-foreground">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGrades.length > 0 ? (
              paginatedGrades.map((grade) => (
                <TableRow 
                  key={grade.id} 
                  className={`border-border ${grade.grade < 15 ? 'bg-destructive/10' : ''}`}
                >
                  <TableCell className="text-foreground">
                    {grade.students.student_name} ({grade.students.student_code})
                  </TableCell>
                  <TableCell className="text-foreground">{grade.courses.course_name}</TableCell>
                  <TableCell className={`font-bold ${grade.grade < 15 ? 'text-destructive' : 'text-primary'}`}>
                    {grade.grade}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingGrade(grade);
                          setDialogOpen(true);
                        }}
                        className="gap-1 border-border"
                      >
                        <Pencil className="w-3 h-3" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteGrade(grade.id)}
                        className="gap-1 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-border">
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {searchCode ? "لم يتم العثور على درجات للطالب" : "لا توجد درجات"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-card/95 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground">
            الصفحة {currentPage} من {totalPages} ({filteredGrades.length} نتيجة)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
