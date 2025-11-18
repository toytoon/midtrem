import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { ArrowRight } from "lucide-react";

export const StudentLogin = () => {
  const [studentCode, setStudentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentCode.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال كود الطالب",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verify student code exists
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_code", studentCode.trim())
        .single();

      if (error || !student) {
        toast({
          title: "خطأ",
          description: "كود الطالب او الطالبة  غير صحيح",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Store student info in sessionStorage
      sessionStorage.setItem("studentId", student.id);
      sessionStorage.setItem("studentName", student.student_name);
      
      toast({
        title: "نجح تسجيل الدخول",
        description: `مرحباً ${student.student_name}`,
      });

      navigate("/grades");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: 'var(--gradient-primary)' }}
    >
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border shadow-[var(--shadow-glow)] p-8">
        <div className="flex flex-col items-center gap-6">
          {/* <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="self-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="w-4 h-4" />
            الرجوع
          </Button> */}

          <img
            src={logo} 
            alt="Institute Logo" 
            className="w-36 h-36 object-contain rounded-full shadow-[var(--shadow-glow)]"
          />
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              نتيجة درجات - الميد ترم
            </h1>
            <p className="text-muted-foreground">
              الرجاء إدخال كود االطالب او الطالبة
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <Input
                type="text"
                placeholder="كود الطالب"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="text-right bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground  font-bold pr-5"
                dir="ltr"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              {loading ? "جاري التحميل..." : "الاستعلام عن النتيجة"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
