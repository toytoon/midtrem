import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, BookOpen, GraduationCap, Upload } from "lucide-react";
import { StudentsTab } from "@/components/admin/StudentsTab";
import { CoursesTab } from "@/components/admin/CoursesTab";
import { GradesTab } from "@/components/admin/GradesTab";
import BulkUploadTab from "@/components/admin/BulkUploadTab";
import { getAdminSession, clearAdminSession } from "@/integrations/supabase/auth";

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = searchParams.get("tab") || "students";

  useEffect(() => {
    const session = getAdminSession();

    if (!session) {
      navigate("/admin/login");
      return;
    }

    setAdminName(session.adminName);
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/");
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{ background: 'var(--gradient-primary)' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-card/95 backdrop-blur-sm border-border shadow-[var(--shadow-glow)] p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Institute Logo" 
              className="w-16 h-16 object-contain rounded-full shadow-[var(--shadow-glow)]"
            />
            <div>
              <h1 className="text-3xl font-bold text-foreground">لوحة الإدارة</h1>
              <p className="text-muted-foreground">{adminName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 border-border bg-secondary/50 hover:bg-secondary text-foreground"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>

        <Tabs value={currentTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 bg-card/95 backdrop-blur-sm border-border">
            <TabsTrigger value="students" className="gap-2">
              <Users className="w-4 h-4" />
              الطلاب
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              المواد
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              الدرجات
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              رفع البيانات
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="mt-6 data-[state=inactive]:hidden" forceMount={true}>
            <StudentsTab />
          </TabsContent>
          
          <TabsContent value="courses" className="mt-6 data-[state=inactive]:hidden" forceMount={true}>
            <CoursesTab />
          </TabsContent>
          
          <TabsContent value="grades" className="mt-6 data-[state=inactive]:hidden" forceMount={true}>
            <GradesTab />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-6 data-[state=inactive]:hidden" forceMount={true}>
            <BulkUploadTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
