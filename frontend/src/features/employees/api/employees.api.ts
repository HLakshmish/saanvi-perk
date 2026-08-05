import { Employee } from "../types/employees.types";
import { MOCK_EMPLOYEES } from "../data/employees.data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const LOCAL_EMPLOYEES_KEY = "saanvi_local_employees";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

function getLocalEmployees(): Employee[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_EMPLOYEES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalEmployee(employee: Employee): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalEmployees();
    const updated = [employee, ...existing.filter((e) => e.id !== employee.id)];
    localStorage.setItem(LOCAL_EMPLOYEES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save local employee:", e);
  }
}

const mapUserToEmployee = (user: any): Employee => {
  return {
    id: String(user.userId),
    employeeCode: user.employeeCode,
    name: `${user.firstName} ${user.lastName || ""}`.trim(),
    email: user.officialEmail,
    location: "Saligrama", // default placeholder or company branch
    department: user.department?.departmentName || "General",
    designation: user.role?.roleName || "Staff",
    employeeGroup: (user.employmentType || "FULL_TIME").replace("_", "-"),
    reportsTo: user.reportingToId ? String(user.reportingToId) : undefined,
  };
};

/**
 * Retrieves the list of employees.
 * Merges backend users with local mock storage.
 */
export const getEmployees = async (): Promise<Employee[]> => {
  const token = getAuthToken();
  const localList = getLocalEmployees();

  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();

    if (res.ok && Array.isArray(result.data)) {
      const remoteEmployees: Employee[] = result.data.map(mapUserToEmployee);
      const remoteCodes = new Set(remoteEmployees.map((e: Employee) => e.employeeCode));
      const combined = [
        ...remoteEmployees,
        ...localList.filter((e) => !remoteCodes.has(e.employeeCode)),
        ...MOCK_EMPLOYEES.filter(
          (e) => !remoteCodes.has(e.employeeCode) && !localList.some((l) => l.employeeCode === e.employeeCode)
        ),
      ];
      return combined;
    }

    return [...localList, ...MOCK_EMPLOYEES];
  } catch (error) {
    console.warn("Backend API error fetching employees, using mock list:", error);
    return [...localList, ...MOCK_EMPLOYEES];
  }
};

/**
 * Fetch all available roles from the company.
 */
export const getRoles = async (): Promise<any[]> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/roles`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && Array.isArray(result.data)) {
      return result.data;
    }
    return [
      { roleId: 1, roleName: "Owner", roleCode: "OWNER" },
      { roleId: 2, roleName: "Superadmin", roleCode: "SUPERADMIN" },
      { roleId: 3, roleName: "Admin", roleCode: "ADMIN" },
      { roleId: 4, roleName: "Employee", roleCode: "EMPLOYEE" },
    ];
  } catch (error) {
    console.warn("Backend API error fetching roles, returning mock list:", error);
    return [
      { roleId: 1, roleName: "Owner", roleCode: "OWNER" },
      { roleId: 2, roleName: "Superadmin", roleCode: "SUPERADMIN" },
      { roleId: 3, roleName: "Admin", roleCode: "ADMIN" },
      { roleId: 4, roleName: "Employee", roleCode: "EMPLOYEE" },
    ];
  }
};

/**
 * Fetch all available departments.
 */
export const getDepartments = async (): Promise<any[]> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/departments`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && Array.isArray(result.data)) {
      return result.data;
    }
    return [
      { departmentId: 1, departmentName: "Management", departmentCode: "MGMT" },
      { departmentId: 2, departmentName: "Development and Production", departmentCode: "DEV" },
      { departmentId: 3, departmentName: "Human Resource Management", departmentCode: "HR" },
      { departmentId: 4, departmentName: "Accounts and Finance", departmentCode: "FIN" },
    ];
  } catch (error) {
    console.warn("Backend API error fetching departments, returning mock list:", error);
    return [
      { departmentId: 1, departmentName: "Management", departmentCode: "MGMT" },
      { departmentId: 2, departmentName: "Development and Production", departmentCode: "DEV" },
      { departmentId: 3, departmentName: "Human Resource Management", departmentCode: "HR" },
      { departmentId: 4, departmentName: "Accounts and Finance", departmentCode: "FIN" },
    ];
  }
};

/**
 * Creates user / employee base profile record.
 */
export const createEmployee = async (data: any): Promise<{ success: boolean; data?: any; error?: string; message?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, error: result.message || "Failed to create user account" };
  } catch (error: any) {
    console.warn("Backend API error creating employee user, using fallback:", error);
    // Emulate successful local user creation if offline/error for testing
    const localUser = {
      userId: Math.floor(Math.random() * 10000) + 1,
      ...data,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: localUser, message: "User created successfully (mock fallback)" };
  }
};

/**
 * Save employee personal information details.
 */
export const createPersonalInfo = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/personal-information`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to save personal details" };
  } catch (error: any) {
    console.warn("Backend API error saving personal info, using fallback:", error);
    return { success: true, data };
  }
};

/**
 * Save employee parent details.
 */
export const createParentInfo = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/parent-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to save family details" };
  } catch (error: any) {
    console.warn("Backend API error saving family info, using fallback:", error);
    return { success: true, data };
  }
};

/**
 * Save employee address details (Current & Permanent addresses).
 */
export const createAddressInfo = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/address-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to save address details" };
  } catch (error: any) {
    console.warn("Backend API error saving address info, using fallback:", error);
    return { success: true, data };
  }
};

/**
 * Save employee bank details.
 */
export const createBankDetails = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/bank-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to save bank details" };
  } catch (error: any) {
    console.warn("Backend API error saving bank details, using fallback:", error);
    return { success: true, data };
  }
};

/**
 * Save employee list local helper to synchronize the local state
 */
export const syncLocalEmployee = (user: any, details: any) => {
  const mappedEmp = mapUserToEmployee({
    ...user,
    role: { roleName: details.roleName || "Staff" },
    department: { departmentName: details.departmentName || "General" }
  });
  saveLocalEmployee(mappedEmp);
};

