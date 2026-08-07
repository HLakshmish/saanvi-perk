import { Employee, CreatePFDetailInput, CreateESIDetailInput, CreateInsuranceDetailInput } from "../types/employees.types";
import { MOCK_EMPLOYEES } from "../data/employees.data";
import { getDepartments as getDepartmentsFromApi } from "../../settings/api/department.api";

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
    // 1. Fetch Company details dynamically to get the branch location (city/state)
    let companyLocation = "Headquarters";
    const companyId = getCompanyIdCookie();
    if (companyId) {
      try {
        const compRes = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const compResult = await compRes.json();
        if (compRes.ok && compResult.success && compResult.data) {
          const comp = compResult.data;
          if (comp.city) {
            companyLocation = comp.state ? `${comp.city}, ${comp.state}` : comp.city;
          }
        }
      } catch (err) {
        console.warn("Could not load company location, using fallback:", err);
      }
    }

    const res = await fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();

    if (res.ok && Array.isArray(result.data)) {
      // Create a map of userId -> employeeCode
      const userIdToCodeMap = new Map<number, string>();
      result.data.forEach((user: any) => {
        if (user.userId && user.employeeCode) {
          userIdToCodeMap.set(user.userId, user.employeeCode);
        }
      });

      const remoteEmployees: Employee[] = result.data.map((user: any) => {
        const mgrCode = user.reportingToId ? userIdToCodeMap.get(user.reportingToId) : undefined;
        return {
          id: String(user.userId),
          employeeCode: user.employeeCode,
          name: `${user.firstName} ${user.lastName || ""}`.trim(),
          email: user.officialEmail,
          location: companyLocation,
          department: user.department?.departmentName || "General",
          designation: user.role?.roleName || "Staff",
          employeeGroup: (user.employmentType || "FULL_TIME").replace("_", "-"),
          reportsTo: mgrCode,
        };
      });

      const remoteCodes = new Set(remoteEmployees.map((e: Employee) => e.employeeCode));
      const combined = [
        ...remoteEmployees,
        ...localList.filter((e) => !remoteCodes.has(e.employeeCode)),
      ];
      return combined;
    }

    return [...localList];
  } catch (error) {
    console.warn("Backend API error fetching employees:", error);
    return [...localList];
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
  try {
    return await getDepartmentsFromApi();
  } catch (error) {
    console.warn("Backend API error fetching departments in employee API, returning empty list:", error);
    return [];
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
    console.error("Backend API error creating employee user:", error);
    return { success: false, error: error.message || "Failed to create user account" };
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
    console.error("Backend API error saving personal info:", error);
    return { success: false, error: error.message || "Failed to save personal details" };
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
    console.error("Backend API error saving family info:", error);
    return { success: false, error: error.message || "Failed to save family details" };
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
    console.error("Backend API error saving address info:", error);
    return { success: false, error: error.message || "Failed to save address details" };
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
    console.error("Backend API error saving bank details:", error);
    return { success: false, error: error.message || "Failed to save bank details" };
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

export const createPFDetail = async (data: CreatePFDetailInput): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/pf-details`, {
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
    return { success: false, error: result.message || "Failed to save PF details" };
  } catch (error: any) {
    console.error("API error saving PF details:", error);
    return { success: false, error: error.message || "Failed to save PF details" };
  }
};

export const createESIDetail = async (data: CreateESIDetailInput): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/esi-details`, {
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
    return { success: false, error: result.message || "Failed to save ESI details" };
  } catch (error: any) {
    console.error("API error saving ESI details:", error);
    return { success: false, error: error.message || "Failed to save ESI details" };
  }
};

export const createInsuranceDetail = async (data: CreateInsuranceDetailInput): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/insurance-details`, {
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
    return { success: false, error: result.message || "Failed to save insurance details" };
  } catch (error: any) {
    console.error("API error saving insurance details:", error);
    return { success: false, error: error.message || "Failed to save insurance details" };
  }
};

export const uploadEmployeeDocument = async (
  userId: number,
  documentType: string,
  file: File
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const formData = new FormData();
    formData.append("userId", String(userId));
    formData.append("documentType", documentType);
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/api/employee-documents`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to upload document" };
  } catch (error: any) {
    console.error("API error uploading document:", error);
    return { success: false, error: error.message || "Failed to upload document" };
  }
};

export const getUserById = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch user profile" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUser = async (userId: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update user profile" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (userId: number): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to delete user profile" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getPersonalInfoByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/personal-information?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch personal info" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updatePersonalInfo = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/personal-information/${id}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update personal info" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getParentInfoByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/parent-info/user/${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch parent info" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateParentInfo = async (userId: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/parent-info/user/${userId}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update parent info" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAddressInfoByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/address-info/user/${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch address info" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateAddressInfo = async (userId: number, addressType: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/address-info/user/${userId}/${addressType}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update address details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getBankDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/bank-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch bank details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateBankDetails = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/bank-details/${id}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update bank details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getPFDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/pf-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch PF details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updatePFDetail = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/pf-details/${id}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update PF details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getESIDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/esi-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch ESI details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateESIDetail = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/esi-details/${id}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update ESI details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getInsuranceDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/insurance-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch insurance details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateInsuranceDetail = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/insurance-details/${id}`, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update insurance details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getEmployeeDocumentsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/employee-documents?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch employee documents" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteEmployeeDocument = async (id: number): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/employee-documents/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to delete document" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const downloadEmployeeDocument = async (id: number): Promise<void> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/employee-documents/${id}/download`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to download document");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document_${id}.bin`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download document file.");
  }
};

function getCompanyIdCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )company_id=([^;]*)/);
  return match ? Number(match[1]) : null;
}

export const getCompanySuperAdmin = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  if (!companyId) return { success: false, error: "No company ID cookie found" };

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: "Company details not found" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};



