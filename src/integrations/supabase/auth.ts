import { supabase } from "./client";

// Generate a secure session token
export const generateSessionToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Store session securely (consider using httpOnly cookies in production)
export const setAdminSession = (adminId: string, adminName: string, token: string): void => {
  // Use localStorage to persist across tab closes, with short expiry
  localStorage.setItem("adminId", adminId);
  localStorage.setItem("adminName", adminName);
  localStorage.setItem("adminToken", token);
  // Set expiry to 5 minutes from now
  localStorage.setItem("adminTokenExpiry", new Date(Date.now() + 5 * 60 * 1000).toISOString());
};

// Retrieve session safely
export const getAdminSession = (): { adminId: string; adminName: string; token: string } | null => {
  const adminId = localStorage.getItem("adminId");
  const adminName = localStorage.getItem("adminName");
  const token = localStorage.getItem("adminToken");
  const expiry = localStorage.getItem("adminTokenExpiry");

  // Check if token is expired
  if (expiry && new Date(expiry) < new Date()) {
    clearAdminSession();
    return null;
  }

  if (adminId && adminName && token) {
    // Extend session expiry on activity (sliding window)
    localStorage.setItem("adminTokenExpiry", new Date(Date.now() + 5 * 60 * 1000).toISOString());
    return { adminId, adminName, token };
  }

  return null;
};

// Clear session completely
export const clearAdminSession = (): void => {
  localStorage.removeItem("adminId");
  localStorage.removeItem("adminName");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminTokenExpiry");
};

// Verify password using Supabase bcrypt function
export const verifyAdminPassword = async (
  adminCode: string,
  password: string
): Promise<{ success: boolean; adminId?: string; adminName?: string; error?: string }> => {
  try {
    // First, fetch the admin record
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id, admin_code, admin_name, password_hash")
      .eq("admin_code", adminCode)
      .single();

    if (adminError || !adminData) {
      console.log("Admin not found:", adminCode);
      return {
        success: false,
        error: "Admin code or password is incorrect",
      };
    }

    console.log("Admin found:", adminCode);

    // Use RPC function to verify password with bcrypt
    try {
      const { data: isValid, error: verifyError } = (await supabase.rpc("verify_password", {
        password: password,
        hash: adminData.password_hash,
      })) as { data: boolean | null; error: Error | null };

      if (verifyError) {
        console.error("RPC verification error:", verifyError);
        return {
          success: false,
          error: "Admin code or password is incorrect",
        };
      }

      if (isValid === true) {
        console.log("Password verified successfully via RPC");
        return {
          success: true,
          adminId: adminData.id,
          adminName: adminData.admin_name,
        };
      }

      // Password does not match
      console.log("Password verification failed - incorrect password");
      return {
        success: false,
        error: "Admin code or password is incorrect",
      };
    } catch (rpcError) {
      console.error("RPC call failed:", rpcError);
      return {
        success: false,
        error: "Authentication service error",
      };
    }
  } catch (error) {
    console.error("Password verification error:", error);
    return {
      success: false,
      error: "An error occurred during authentication",
    };
  }
};

// Log admin action for audit trail
export const logAdminAction = async (
  adminCode: string,
  tableName: string,
  operation: string,
  changedData?: Record<string, string | number | boolean | null | object>
): Promise<void> => {
  try {
    // Log to browser console for now
    // Full audit logging will be available after TypeScript types are regenerated
    console.log("Admin Action:", {
      admin_code: adminCode,
      table_name: tableName,
      operation: operation,
      changed_data: changedData || {},
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};

// Validate input to prevent injection attacks
export const sanitizeInput = (input: string, maxLength: number = 255): string => {
  return input
    .slice(0, maxLength)
    .trim()
    .replace(/[<>'`]/g, "") // Remove potentially dangerous characters
    .split("")
    .filter((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
    .join("");
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate student code format
export const validateStudentCode = (code: string): boolean => {
  // Allow alphanumeric with hyphens and underscores
  const codeRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return codeRegex.test(code);
};

// Validate grade value
export const validateGrade = (grade: number): boolean => {
  return Number.isInteger(grade) && grade >= 0 && grade <= 30;
};

// Validate course name
export const validateCourseName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100;
};
