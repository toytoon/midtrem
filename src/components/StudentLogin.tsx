import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export const StudentLogin = () => {
  const [studentCode, setStudentCode] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentCode.trim() || !nationalId.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الكود الاكاديمي والرقم القومي",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Dynamically import supabase client
      const { supabase } = await import("@/integrations/supabase/client");

      // Verify student code and national ID exist
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_code", studentCode.trim())
        .eq("national_id", nationalId.trim())
        .single();

      if (error || !student) {
        toast({
          title: "خطأ",
          description: "الكود الاكاديمي أو الرقم القومي غير صحيح",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Store student info in sessionStorage
      sessionStorage.setItem("studentId", student.id);
      sessionStorage.setItem("studentName", student.student_name);
      sessionStorage.setItem("studentCode", student.student_code);
      
      toast({
        title: "  نتائجك الدراسية",
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
          <img
            src="/logo.png" 
            alt="Institute Logo"
            width={144}
            height={144}
            fetchPriority="high"
            loading="eager"
            className="w-36 h-36 object-contain rounded-full shadow-[var(--shadow-glow)]"
          />
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              نتيجة درجات - الميد ترم
            </h1>
            <p className="text-muted-foreground">
              الرجاء إدخال الكود الاكاديمي والرقم القومي
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="الكود الاكاديمي"
                value={studentCode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 6) {
                    setStudentCode(value);
                  }
                }}
                className="text-center bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground font-bold"
                dir="ltr"
              />
              
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={14}
                placeholder="الرقم القومي"
                value={nationalId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 14) {
                    setNationalId(value);
                  }
                }}
                className="text-center bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground font-bold"
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
