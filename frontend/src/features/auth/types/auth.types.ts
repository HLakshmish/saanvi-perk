export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "employee" | "manager";
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
