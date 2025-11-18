import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Course {
  id: string;
  course_name: string;
}

export const CoursesTab = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCourses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("course_name");

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المواد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المادة",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate course names
    const trimmedName = newCourseName.trim();
    const existingCourse = courses.find(course => 
      course.course_name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingCourse) {
      toast({
        title: "خطأ",
        description: "اسم المادة موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("courses")
        .insert([{ course_name: trimmedName }]);

      if (error) throw error;

      toast({ title: "نجح", description: "تم إضافة المادة بنجاح" });
      setNewCourseName("");
      setDialogOpen(false);
      fetchCourses();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة المادة",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    const trimmedName = editingCourse.course_name.trim();
    if (!trimmedName) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المادة",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate course names (excluding the current course being edited)
    const existingCourse = courses.find(course => 
      course.id !== editingCourse.id && 
      course.course_name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingCourse) {
      toast({
        title: "خطأ",
        description: "اسم المادة موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("courses")
        .update({ course_name: trimmedName })
        .eq("id", editingCourse.id);

      if (error) throw error;

      toast({ title: "نجح", description: "تم تحديث المادة بنجاح" });
      setEditingCourse(null);
      setDialogOpen(false);
      fetchCourses();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث المادة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "نجح", description: "تم حذف المادة بنجاح" });
      fetchCourses();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف المادة",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">إدارة المواد</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCourse(null);
                setNewCourseName("");
              }}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              إضافة مادة
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground text-right mt-4">
                {editingCourse ? "تعديل مادة" : "إضافة مادة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="اسم المادة"
                  value={editingCourse ? editingCourse.course_name : newCourseName}
                  onChange={(e) =>
                    editingCourse
                      ? setEditingCourse({ ...editingCourse, course_name: e.target.value })
                      : setNewCourseName(e.target.value)
                  }
                  className="text-right bg-secondary/50 border-border"
                />
              </div>
              <Button
                onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {editingCourse ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/95 backdrop-blur-sm border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-right text-foreground">اسم المادة</TableHead>
              <TableHead className="text-right text-foreground">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} className="border-border">
                <TableCell className="text-foreground">{course.course_name}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCourse(course);
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
                      onClick={() => handleDeleteCourse(course.id)}
                      className="gap-1 border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3" />
                      حذف
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
