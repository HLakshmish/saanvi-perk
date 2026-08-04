export type UserRole = "owner" | "superadmin" | "admin" | "employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: number | null;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}
