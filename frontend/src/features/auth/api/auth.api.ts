import { LoginCredentials, LoginResponse } from "../types/auth.types";

/**
 * Mock API call to authenticate user credentials.
 * In a real application, replace this with a fetch/axios request to your server.
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  // Simulate network latency (1.2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const { email, password } = credentials;

  // Basic verification for testing purposes
  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  // Simple hardcoded mock test credential validation
  if (email === "demo@saanvi.com" && password === "password123") {
    return {
      success: true,
      user: {
        id: "usr_01",
        email: "demo@saanvi.com",
        name: "Saanvi User",
        role: "employee",
      },
      token: "mock-jwt-token-string-xyz-123",
    };
  }

  if (email === "admin@saanvi.com" && password === "admin123") {
    return {
      success: true,
      user: {
        id: "usr_00",
        email: "admin@saanvi.com",
        name: "Admin User",
        role: "admin",
      },
      token: "mock-jwt-token-string-abc-000",
    };
  }

  // Fallback failure case
  return {
    success: false,
    error: "Invalid email or password. Please try demo@saanvi.com / password123",
  };
}
