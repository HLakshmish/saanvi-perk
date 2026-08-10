import { OfficeLocation, CreateLocationInput, UpdateLocationInput } from "../types/location.types";

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
 * Fetch all office locations for the active company.
 */
export const getLocations = async (): Promise<OfficeLocation[]> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const url = companyId
      ? `${API_BASE_URL}/api/locations?companyId=${companyId}`
      : `${API_BASE_URL}/api/locations`;

    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch locations");
    }

    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("API error fetching locations:", error);
    throw error;
  }
};

/**
 * Create a new location.
 */
export const createLocation = async (
  data: CreateLocationInput
): Promise<{ success: boolean; data?: OfficeLocation; error?: string; message?: string }> => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/locations`, {
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
    return { success: false, error: result.message || "Failed to create location" };
  } catch (error: any) {
    console.error("API error creating location:", error);
    return { success: false, error: error.message || "Failed to create location" };
  }
};

/**
 * Update an existing location by ID.
 */
export const updateLocation = async (
  id: number,
  data: UpdateLocationInput
): Promise<{ success: boolean; data?: OfficeLocation; error?: string; message?: string }> => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/locations/${id}`, {
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
    return { success: false, error: result.message || "Failed to update location" };
  } catch (error: any) {
    console.error("API error updating location:", error);
    return { success: false, error: error.message || "Failed to update location" };
  }
};

/**
 * Delete a location by ID.
 */
export const deleteLocation = async (
  id: number
): Promise<{ success: boolean; error?: string; message?: string }> => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/locations/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message };
    }
    return { success: false, error: result.message || "Failed to delete location" };
  } catch (error: any) {
    console.error("API error deleting location:", error);
    return { success: false, error: error.message || "Failed to delete location" };
  }
};
