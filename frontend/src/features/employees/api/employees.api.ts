import { Employee, CreatePFDetailInput, CreateESIDetailInput, CreateInsuranceDetailInput, Designation, SuperAdminDetails } from "../types/employees.types";
import { getDepartments as getDepartmentsFromApi } from "../../settings/api/department.api";
import { snackbar as toast } from "@/components/ui/snackbar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

const pendingRequests = new Map<string, Promise<Response>>();
export function formatBackendError(errorMsg: string): string {
  if (!errorMsg) return "An unexpected error occurred.";
  const lowerMsg = errorMsg.toLowerCase();
  if (lowerMsg.includes("unique constraint failed")) {
    if (lowerMsg.includes("pan_number") || lowerMsg.includes("pannumber")) {
      return "The PAN Number entered is already registered to another employee. Please enter a unique PAN.";
    }
    if (lowerMsg.includes("aadhaar_number") || lowerMsg.includes("aadhaarnumber")) {
      return "The Aadhaar Number entered is already registered to another employee. Please enter a unique Aadhaar.";
    }
    if (lowerMsg.includes("official_email") || lowerMsg.includes("officialemail")) {
      return "The Official Email entered is already in use by another user. Please use a unique email.";
    }
    if (lowerMsg.includes("personal_email") || lowerMsg.includes("personalemail")) {
      return "The Personal Email entered is already registered. Please use a unique email.";
    }
    return "A record with these details already exists. Please check unique fields (PAN, Aadhaar, Email, etc.).";
  }
  return errorMsg;
}

function getErrorMsg(result: any, fallback: string): string {
  const msg = result?.message || result?.error || fallback;
  return formatBackendError(msg);
}


async function fetchDeduplicated(url: string, options?: RequestInit): Promise<Response> {
  const method = options?.method || "GET";
  if (method !== "GET") {
    return fetch(url, options);
  }

  const cacheKey = `${url}_${JSON.stringify(options?.headers || {})}`;
  if (pendingRequests.has(cacheKey)) {
    const cachedResponse = await pendingRequests.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse.clone();
    }
  }

  const promise = (async () => {
    try {
      const response = await fetch(url, options);
      return response;
    } finally {
      setTimeout(() => {
        pendingRequests.delete(cacheKey);
      }, 300);
    }
  })();

  pendingRequests.set(cacheKey, promise);
  const response = await promise;
  return response.clone();
}

const mapUserToEmployee = (user: any): Employee => {
  return {
    id: String(user.userId),
    employeeCode: user.employeeCode,
    name: `${user.firstName} ${user.lastName || ""}`.trim(),
    email: user.officialEmail,
    location: "Saligrama", // default placeholder or company branch
    department: user.department?.departmentName || "General",
    designation: user.roles?.[0]?.roleName || user.userRoles?.[0]?.role?.roleName || user.role?.roleName || "Staff",
    employeeGroup: (user.employmentType || "FULL_TIME").replace("_", "-"),
    reportsTo: user.reportingToId ? String(user.reportingToId) : undefined,
    designationId: user.designationId || undefined,
    status: user.status || "ACTIVE",
  };
};

/**
 * Fetch all available designations.
 */
export const getDesignations = async (): Promise<Designation[]> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/designations`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.warn("Backend API error fetching designations:", error);
    return [];
  }
};

/**
 * Retrieves the list of employees.
 * Merges backend users with local mock storage.
 */
export const getEmployees = async (): Promise<Employee[]> => {
  const token = getAuthToken();

  try {
    // 1. Fetch Company details dynamically to get the branch location (city/state)
    let companyLocation = "Headquarters";
    const companyId = getCompanyIdCookie();
    if (companyId) {
      try {
        const compRes = await fetchDeduplicated(`${API_BASE_URL}/api/companies/${companyId}`, {
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

    // 2. Fetch Users, Personal Info, and Designations concurrently
    const [res, personalRes, designations] = await Promise.all([
      fetchDeduplicated(`${API_BASE_URL}/api/users`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
      fetchDeduplicated(`${API_BASE_URL}/api/personal-information`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
      getDesignations(),
    ]);

    const result = await res.json();
    const personalResult = await personalRes.json();
    const personalMap = new Map<number, string>();

    if (personalRes.ok && personalResult.success && Array.isArray(personalResult.data)) {
      personalResult.data.forEach((pi: any) => {
        if (pi.userId && pi.profilePhoto) {
          personalMap.set(pi.userId, pi.profilePhoto);
        }
      });
    }

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
        const matchingDesignation = designations.find((d) => d.designationId === user.designationId);
        const userRoleName = user.roles?.[0]?.roleName || user.userRoles?.[0]?.role?.roleName || user.role?.roleName || "";
        const personalPhoto = personalMap.get(user.userId);
        return {
          id: String(user.userId),
          employeeCode: user.employeeCode,
          name: `${user.firstName} ${user.lastName || ""}`.trim(),
          email: user.officialEmail,
          location: user.location?.locationName || user.location?.city || companyLocation,
          department: user.department?.departmentName || "General",
          designation: matchingDesignation?.designationName || userRoleName || "Staff",
          employeeGroup: (user.employmentType || "FULL_TIME").replace("_", "-"),
          reportsTo: mgrCode,
          reportingToId: user.reportingToId || undefined,
          roleName: userRoleName,
          profilePic: user.profilePic || personalPhoto || undefined,
          designationId: user.designationId || undefined,
          status: user.status || "ACTIVE",
        };
      });

      return remoteEmployees;
    }

    return [];
  } catch (error) {
    console.warn("Backend API error fetching employees:", error);
    return [];
  }
};

/**
 * Fetch all available roles from the company.
 */
export const getRoles = async (): Promise<any[]> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/roles`, {
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
    const { roleId, roleIds, dateOfBirth, ...rest } = data;
    const resolvedRoleIds = Array.isArray(roleIds)
      ? roleIds.map(Number)
      : roleId !== undefined && roleId !== null && roleId !== ""
        ? [Number(roleId)]
        : [];

    let formattedDateOfBirth = dateOfBirth;
    if (formattedDateOfBirth) {
      if (typeof formattedDateOfBirth === "string" && formattedDateOfBirth.includes("T")) {
        formattedDateOfBirth = formattedDateOfBirth.split("T")[0];
      } else if (formattedDateOfBirth instanceof Date) {
        formattedDateOfBirth = formattedDateOfBirth.toISOString().split("T")[0];
      }
    }

    const payload = {
      ...rest,
      dateOfBirth: formattedDateOfBirth,
      roleIds: resolvedRoleIds,
    };
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, error: getErrorMsg(result, "Failed to create user account") };
  } catch (error: any) {
    console.error("Backend API error creating employee user:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to create user account") };
  }
};

/**
 * Save employee personal information details.
 */
export const createPersonalInfo = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/personal-information`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to save personal details") };
  } catch (error: any) {
    console.error("Backend API error saving personal info:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to save personal details") };
  }
};

/**
 * Save employee parent details.
 */
export const createParentInfo = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/parent-info`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to save family details") };
  } catch (error: any) {
    console.error("Backend API error saving family info:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to save family details") };
  }
};

/**
 * Save employee address details (Current & Permanent addresses).
 */
export const createAddressInfo = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/address-info`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to save address details") };
  } catch (error: any) {
    console.error("Backend API error saving address info:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to save address details") };
  }
};

/**
 * Save employee bank details.
 */
export const createBankDetails = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/bank-details`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to save bank details") };
  } catch (error: any) {
    console.error("Backend API error saving bank details:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to save bank details") };
  }
};



export const createPFDetail = async (data: CreatePFDetailInput): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/pf-details`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to save PF details") };
  } catch (error: any) {
    console.error("API error saving PF details:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to save PF details") };
  }
};

export const createESIDetail = async (data: CreateESIDetailInput): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/esi-details`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to save ESI details") };
  } catch (error: any) {
    console.error("API error saving ESI details:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to save ESI details") };
  }
};

export const createInsuranceDetail = async (data: CreateInsuranceDetailInput): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/insurance-details`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to save insurance details") };
  } catch (error: any) {
    console.error("API error saving insurance details:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to save insurance details") };
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

    const res = await fetchDeduplicated(`${API_BASE_URL}/api/employee-documents`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to upload document") };
  } catch (error: any) {
    console.error("API error uploading document:", error);
    return { success: false, error: formatBackendError(error.message || "Failed to upload document") };
  }
};

export const getUserById = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/users/${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch user profile") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updateUser = async (userId: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const { roleId, ...rest } = data;
    const payload: any = {
      ...rest,
    };
    if (roleId !== undefined && roleId !== null) {
      payload.roleIds = [Number(roleId)];
    }
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to update user profile") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const deleteUser = async (userId: number): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: getErrorMsg(result, "Failed to delete user profile") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getPersonalInfoByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/personal-information?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch personal info") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updatePersonalInfo = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/personal-information/${id}`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to update personal info") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getParentInfoByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/parent-info/user/${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch parent info") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updateParentInfo = async (userId: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/parent-info/user/${userId}`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to update parent info") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getAddressInfoByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/address-info/user/${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch address info") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updateAddressInfo = async (userId: number, addressType: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/address-info/user/${userId}/${addressType}`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to update address details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getBankDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/bank-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch bank details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updateBankDetails = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/bank-details/${id}`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to update bank details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getPFDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/pf-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch PF details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updatePFDetail = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/pf-details/${id}`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to update PF details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getESIDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/esi-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch ESI details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updateESIDetail = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/esi-details/${id}`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to update ESI details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getInsuranceDetailsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/insurance-details?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch insurance details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const updateInsuranceDetail = async (id: number, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/insurance-details/${id}`, {
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
    return { success: false, error: getErrorMsg(result, "Failed to update insurance details") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getEmployeeDocumentsByUserId = async (userId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/employee-documents?userId=${userId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: getErrorMsg(result, "Failed to fetch employee documents") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const deleteEmployeeDocument = async (id: number): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/employee-documents/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: getErrorMsg(result, "Failed to delete document") };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const downloadEmployeeDocument = async (id: number): Promise<void> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/employee-documents/${id}/download`, {
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
    toast.error("Failed to download document file.");
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
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/companies/${companyId}`, {
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
    return { success: false, error: formatBackendError(error.message) };
  }
};

export const getOfficeLocations = async (): Promise<any[]> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  try {
    const url = companyId
      ? `${API_BASE_URL}/api/locations?companyId=${companyId}`
      : `${API_BASE_URL}/api/locations`;

    const res = await fetchDeduplicated(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch locations");
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("API error fetching locations:", error);
    return [];
  }
};
export const getSuperAdminDetails = async (): Promise<{ success: boolean; data?: SuperAdminDetails; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetchDeduplicated(`${API_BASE_URL}/api/super-admin`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Super admin details not found" };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

/**
 * Fetch birthday and work anniversary events for a specific date.
 * GET /api/users/events?date=YYYY-MM-DDTHH:mm:ss.sssZ
 */
export const getEvents = async (date?: string): Promise<{ success: boolean; data?: { birthdays: any[]; anniversaries: any[] }; error?: string }> => {
  const token = getAuthToken();
  try {
    const queryDate = date || new Date().toISOString();
    const res = await fetch(`${API_BASE_URL}/api/users/events?date=${encodeURIComponent(queryDate)}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch events" };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

/**
 * Fetch events for upcoming N days (today + next N-1 days).
 * Aggregates results from multiple single-day calls.
 */
export const getUpcomingEvents = async (days: number = 7): Promise<{ success: boolean; data?: { birthdays: any[]; anniversaries: any[] }; error?: string }> => {
  try {
    const allBirthdays: any[] = [];
    const allAnniversaries: any[] = [];
    const seenBirthdayIds = new Set<number>();
    const seenAnniversaryIds = new Set<number>();

    const promises = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      promises.push(getEvents(d.toISOString()).then(res => ({ res, dateOffset: i, date: d })));
    }

    const results = await Promise.all(promises);
    for (const { res, dateOffset, date } of results) {
      if (res.success && res.data) {
        for (const b of res.data.birthdays) {
          if (!seenBirthdayIds.has(b.userId)) {
            seenBirthdayIds.add(b.userId);
            allBirthdays.push({ ...b, isToday: dateOffset === 0, eventDate: date.toISOString() });
          }
        }
        for (const a of res.data.anniversaries) {
          if (!seenAnniversaryIds.has(a.userId)) {
            seenAnniversaryIds.add(a.userId);
            allAnniversaries.push({ ...a, isToday: dateOffset === 0, eventDate: date.toISOString() });
          }
        }
      }
    }

    return { success: true, data: { birthdays: allBirthdays, anniversaries: allAnniversaries } };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

// Fetch users report data
export const getUsersReportView = async (params: { companyId?: number }) => {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params.companyId) query.append("companyId", String(params.companyId));

  const url = `${API_BASE_URL}/api/users/report/view?${query.toString()}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

// Download users CSV report
export const downloadUsersReport = async (params: { companyId?: number }) => {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params.companyId) query.append("companyId", String(params.companyId));

  const url = `${API_BASE_URL}/api/users/report/download?${query.toString()}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) throw new Error("Failed to download users CSV report");

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "users_report.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: formatBackendError(error.message) };
  }
};

