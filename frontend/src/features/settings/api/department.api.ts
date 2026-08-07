import { Department, CreateDepartmentInput, UpdateDepartmentInput } from "../types/department.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

function getCompanyIdCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )company_id=([^;]*)/);
  return match ? Number(match[1]) : null;
}

/**
 * Fetch all departments from the company.
 */
export const getDepartments = async (): Promise<Department[]> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const url = companyId
      ? `${API_BASE_URL}/api/departments?companyId=${companyId}`
      : `${API_BASE_URL}/api/departments`;

    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch departments");
    }

    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("API error fetching departments:", error);
    throw error;
  }
};

/**
 * Create a new department.
 */
export const createDepartment = async (
  data: CreateDepartmentInput
): Promise<{ success: boolean; data?: Department; error?: string; message?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const bodyData = {
      ...data,
      ...(companyId ? { companyId } : {}),
    };

    const res = await fetch(`${API_BASE_URL}/api/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(bodyData),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, error: result.message || "Failed to create department" };
  } catch (error: any) {
    console.error("API error creating department:", error);
    return { success: false, error: error.message || "Failed to create department" };
  }
};

/**
 * Update an existing department.
 */
export const updateDepartment = async (
  id: number,
  data: UpdateDepartmentInput
): Promise<{ success: boolean; data?: Department; error?: string; message?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const url = companyId
      ? `${API_BASE_URL}/api/departments/${id}?companyId=${companyId}`
      : `${API_BASE_URL}/api/departments/${id}`;

    const res = await fetch(url, {
      method: "PUT",
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
    return { success: false, error: result.message || "Failed to update department" };
  } catch (error: any) {
    console.error("API error updating department:", error);
    return { success: false, error: error.message || "Failed to update department" };
  }
};

/**
 * Delete a department.
 */
export const deleteDepartment = async (
  id: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const url = companyId
      ? `${API_BASE_URL}/api/departments/${id}?companyId=${companyId}`
      : `${API_BASE_URL}/api/departments/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message };
    }
    return { success: false, error: result.message || "Failed to delete department" };
  } catch (error: any) {
    console.error("API error deleting department:", error);
    return { success: false, error: error.message || "Failed to delete department" };
  }
};
