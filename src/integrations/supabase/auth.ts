import { supabase } from "./client";
export * from "./auth-utils";

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
    // console.log("Admin Action:", {
    //   admin_code: adminCode,
    //   table_name: tableName,
    //   operation: operation,
    //   changed_data: changedData || {},
    //   timestamp: new Date().toISOString(),
    // });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};
