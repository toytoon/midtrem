import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

interface CourseGrade {
  courseName: string;
  grade: number;
}

interface GradeItem {
  courses: { course_name: string };
  grade: number;
}

export const StudentGradesDisplay = () => {
  const [studentName, setStudentName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchGrades = useCallback(async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from("grades")
        .select(`
          grade,
          courses (
            course_name
          )
        `)
        .eq("student_id", studentId);

      if (error) throw error;

      const formattedGrades: CourseGrade[] = data.map((item: GradeItem) => ({
        courseName: item.courses.course_name,
        grade: item.grade,
      }));

      setGrades(formattedGrades);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل الدرجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const studentId = sessionStorage.getItem("studentId");
    const name = sessionStorage.getItem("studentName");
    const code = sessionStorage.getItem("studentCode");

    if (!studentId) {
      navigate("/");
      return;
    }

    setStudentName(name || "");
    setStudentCode(code || "");
    fetchGrades(studentId);
  }, [navigate, fetchGrades]);

  const handleLogout = () => {
    sessionStorage.removeItem("studentId");
    sessionStorage.removeItem("studentName");
    navigate("/student/login");
  };

  const totalGrades = grades.reduce((sum, item) => sum + item.grade, 0);
  const maxTotal = grades.length * 30;

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: 'var(--gradient-primary)' }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center gap-4 w-full">
          <img 
            src="/logo.png" 
            alt="institute Logo"
            width={128}
            height={128}
            className="w-32 h-32 object-contain rounded-full shadow-[var(--shadow-glow)]"
          />
          <h1 className="text-4xl font-bold text-foreground text-center">
            درجات الطالب - الطالبة
          </h1>
          <div className="text-center space-y-2">
            <p className="text-xl text-foreground font-semibold">
              {studentName}
            </p>
            <p className="text-lg text-muted-foreground">  الكود الأكاديمي : {studentCode}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 border-border bg-secondary/50 hover:bg-secondary text-foreground"
          >
            <LogOut className="w-4 h-4" />
            الرجوع
          </Button>
        </div>

        {loading ? (
          <Card className="w-full bg-card/95 backdrop-blur-sm border-border shadow-[var(--shadow-glow)]">
            <div className="p-6 space-y-6">
              <div className="flex justify-between border-b pb-4">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between py-4 border-b last:border-0">
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </Card>
        ) : grades.length === 0 ? (
          <Card className="w-full bg-card/95 backdrop-blur-sm border-border shadow-[var(--shadow-glow)] p-8">
            <p className="text-center text-foreground">لا توجد درجات مسجلة</p>
          </Card>
        ) : (
          <>
            <Card className="w-full bg-card/95 backdrop-blur-sm border-border shadow-[var(--shadow-glow)]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-right text-foreground font-semibold">#</TableHead>
                      <TableHead className="text-right text-foreground font-semibold">اسم المادة</TableHead>
                      <TableHead className="text-right text-foreground font-semibold">الدرجة (من 30)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((item, index) => (
                      <TableRow 
                        key={index}
                        className={`border-border ${
                          item.grade < 15 
                            ? 'bg-destructive/10 hover:bg-destructive/20' 
                            : 'hover:bg-secondary/50'
                        }`}
                      >
                        <TableCell className="text-foreground">{index + 1}</TableCell>
                        <TableCell className="text-foreground font-medium">{item.courseName}</TableCell>
                        <TableCell 
                          className={`text-lg font-bold ${
                            item.grade < 15 
                              ? 'text-destructive' 
                              : 'text-primary'
                          }`}
                        >
                          {item.grade}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="w-full bg-card/95 backdrop-blur-sm border-border shadow-[var(--shadow-glow)] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-muted-foreground text-sm">المجموع الكلي</p>
                  <p className="text-2xl font-bold text-primary">{totalGrades} / {maxTotal}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">عدد المواد</p>
                  <p className="text-2xl font-bold text-primary">{grades.length}</p>
                </div>
              </div>
            </Card>
          </>
        )}

        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>الدرجات التي تقل عن 15 يتم تمييزها باللون الأحمر</p>
        </div>
      </div>
    </div>
  );
};
