import { LoginCredentials, LoginResponse, UserRole } from "../types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Authenticates user credentials with Fastify Backend (/api/auth/login).
 * Maps backend role strings (OWNER, SUPERADMIN, ADMIN, EMPLOYEE) to frontend lowercase roles.
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const { email, password } = credentials;

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  // Map backend uppercase roles to frontend lowercase roles
  const mapRole = (backendRole: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
      OWNER: "owner",
      SUPERADMIN: "superadmin",
      ADMIN: "admin",
      EMPLOYEE: "employee",
    };
    return roleMap[backendRole?.toUpperCase()] || "employee";
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const role = mapRole(data.data?.role);
      const companyId = data.data?.companyId || null;
      const name = data.data?.firstName
        ? `${data.data.firstName} ${data.data.lastName || ""}`.trim()
        : email.split("@")[0];

      // Set cookies for authentication and middleware route protection
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400;`;
      document.cookie = `user_role=${role}; path=/; max-age=86400;`;
      if (companyId) {
        document.cookie = `company_id=${companyId}; path=/; max-age=86400;`;
      }

      // Set localStorage for client-side API calls & local debugging
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_role", role);
        localStorage.setItem("user_name", name);
        if (companyId) {
          localStorage.setItem("company_id", String(companyId));
        }
      }

      return {
        success: true,
        token: data.token,
        user: {
          id: String(data.data?.userId || "0"),
          email: data.data?.email || email,
          name: name,
          role: role,
          companyId: companyId,
        },
      };
    } else {
      return {
        success: false,
        error: data.message || "Invalid credentials. Please check your email and password.",
      };
    }
  } catch (error) {
    console.error("Backend connection error during login:", error);
    return {
      success: false,
      error: "Unable to connect to the server. Please verify backend server is running and try again.",
    };
  }
}
