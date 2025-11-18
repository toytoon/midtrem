import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { sanitizeInput, validateStudentCode, logAdminAction } from "@/integrations/supabase/auth";

interface Student {
  id: string;
  student_code: string;
  student_name: string;
}

export const StudentsTab = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({ code: "", name: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("student_code");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الطلاب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchCode]);

  const handleAddStudent = async () => {
    // Sanitize inputs
    const sanitizedCode = sanitizeInput(newStudent.code);
    const sanitizedName = sanitizeInput(newStudent.name);

    if (!sanitizedCode || !sanitizedName) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    // Validate student code format
    if (!validateStudentCode(sanitizedCode)) {
      toast({
        title: "خطأ",
        description: "كود الطالب غير صحيح (استخدم أحرف وأرقام و- أو _)",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("students")
        .insert([{ student_code: sanitizedCode, student_name: sanitizedName }]);

      if (error) throw error;

      // Log action
      const adminCode = sessionStorage.getItem("adminName") || "unknown";
      await logAdminAction(adminCode, "students", "insert", {
        student_code: sanitizedCode,
        student_name: sanitizedName,
      });

      toast({ title: "نجح", description: "تم إضافة الطالب بنجاح" });
      setNewStudent({ code: "", name: "" });
      setDialogOpen(false);
      fetchStudents();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة الطالب",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    try {
      const { error } = await supabase
        .from("students")
        .update({
          student_code: editingStudent.student_code,
          student_name: editingStudent.student_name,
        })
        .eq("id", editingStudent.id);

      if (error) throw error;

      toast({ title: "نجح", description: "تم تحديث الطالب بنجاح" });
      setEditingStudent(null);
      setDialogOpen(false);
      fetchStudents();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الطالب",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "نجح", description: "تم حذف الطالب بنجاح" });
      fetchStudents();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف الطالب",
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

  // Filter students by code or name
  const filteredStudents = students.filter(student =>
    student.student_code.toLowerCase().includes(searchCode.toLowerCase()) ||
    student.student_name.toLowerCase().includes(searchCode.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">إدارة الطلاب</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingStudent(null);
                setNewStudent({ code: "", name: "" });
              }}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              إضافة طالب
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground text-right mt-4">
                {editingStudent ? "تعديل طالب" : "إضافة طالب جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="كود الطالب"
                  value={editingStudent ? editingStudent.student_code : newStudent.code}
                  onChange={(e) =>
                    editingStudent
                      ? setEditingStudent({ ...editingStudent, student_code: e.target.value })
                      : setNewStudent({ ...newStudent, code: e.target.value })
                  }
                  className="text-right bg-secondary/50 border-border"
                  dir="ltr"
                />
              </div>
              <div>
                <Input
                  placeholder="اسم الطالب"
                  value={editingStudent ? editingStudent.student_name : newStudent.name}
                  onChange={(e) =>
                    editingStudent
                      ? setEditingStudent({ ...editingStudent, student_name: e.target.value })
                      : setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="text-right bg-secondary/50 border-border"
                />
              </div>
              <Button
                onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {editingStudent ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="ابحث برقم الطالب أو الاسم..."
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
              <TableHead className="text-right text-foreground">كود الطالب</TableHead>
              <TableHead className="text-right text-foreground">اسم الطالب</TableHead>
              <TableHead className="text-right text-foreground">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <TableRow key={student.id} className="border-border">
                  <TableCell className="text-foreground font-mono">{student.student_code}</TableCell>
                  <TableCell className="text-foreground">{student.student_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingStudent(student);
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
                        onClick={() => handleDeleteStudent(student.id)}
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
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  {searchCode ? "لم يتم العثور على طلاب" : "لا يوجد طلاب"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-card/95 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground">
            الصفحة {currentPage} من {totalPages} ({filteredStudents.length} نتيجة)
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
