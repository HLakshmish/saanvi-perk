import { Designation, CreateDesignationInput, UpdateDesignationInput } from "../types/designation.types";

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
 * Fetch all designations for the active company.
 */
export const getDesignations = async (): Promise<Designation[]> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const url = companyId
      ? `${API_BASE_URL}/api/designations?companyId=${companyId}`
      : `${API_BASE_URL}/api/designations`;

    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch designations");
    }

    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("API error fetching designations:", error);
    throw error;
  }
};

/**
 * Create a new designation.
 */
export const createDesignation = async (
  data: CreateDesignationInput
): Promise<{ success: boolean; data?: Designation; error?: string; message?: string }> => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/designations`, {
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
    return { success: false, error: result.message || "Failed to create designation" };
  } catch (error: any) {
    console.error("API error creating designation:", error);
    return { success: false, error: error.message || "Failed to create designation" };
  }
};

/**
 * Update an existing designation by ID.
 */
export const updateDesignation = async (
  id: number,
  data: UpdateDesignationInput
): Promise<{ success: boolean; data?: Designation; error?: string; message?: string }> => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/designations/${id}`, {
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
    return { success: false, error: result.message || "Failed to update designation" };
  } catch (error: any) {
    console.error("API error updating designation:", error);
    return { success: false, error: error.message || "Failed to update designation" };
  }
};

/**
 * Delete a designation by ID.
 */
export const deleteDesignation = async (
  id: number
): Promise<{ success: boolean; error?: string; message?: string }> => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/designations/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message };
    }
    return { success: false, error: result.message || "Failed to delete designation" };
  } catch (error: any) {
    console.error("API error deleting designation:", error);
    return { success: false, error: error.message || "Failed to delete designation" };
  }
};
