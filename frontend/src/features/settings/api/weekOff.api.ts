import {
  WeekOffRecord,
  WeekOffAssignRecord,
  CreateWeekOffInput,
  AssignWeekOffInput,
} from "../types/weekOff.types";

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

export const getWeekOffs = async (): Promise<{
  success: boolean;
  data?: WeekOffRecord[];
  error?: string;
}> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/week-offs?companyId=${companyId}`
    : `${API_BASE_URL}/api/week-offs`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data || [] };
    }
    return { success: false, error: result.message || "Failed to load week-offs" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error loading week-offs" };
  }
};

export const createWeekOff = async (
  input: CreateWeekOffInput
): Promise<{ success: boolean; data?: WeekOffRecord; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = `${API_BASE_URL}/api/week-offs`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...input,
        ...(companyId ? { companyId } : {}),
      }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to create week-off" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error creating week-off" };
  }
};

export const updateWeekOff = async (
  weekOffId: number,
  input: CreateWeekOffInput
): Promise<{ success: boolean; data?: WeekOffRecord; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/week-offs/${weekOffId}?companyId=${companyId}`
    : `${API_BASE_URL}/api/week-offs/${weekOffId}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...input,
        ...(companyId ? { companyId } : {}),
      }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to update week-off" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error updating week-off" };
  }
};

export const deleteWeekOff = async (
  weekOffId: number
): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/week-offs/${weekOffId}?companyId=${companyId}`
    : `${API_BASE_URL}/api/week-offs/${weekOffId}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to delete week-off" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error deleting week-off" };
  }
};

export const getAssignedWeekOffs = async (
  userId?: number
): Promise<{ success: boolean; data?: WeekOffAssignRecord[]; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  let url = `${API_BASE_URL}/api/week-offs/assign`;
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", String(companyId));
  if (userId) params.append("userId", String(userId));
  if (params.toString()) url += `?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data || [] };
    }
    return { success: false, error: result.message || "Failed to load assigned week-offs" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error loading assigned week-offs" };
  }
};

export const assignWeekOff = async (
  input: AssignWeekOffInput
): Promise<{ success: boolean; data?: WeekOffAssignRecord[]; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = `${API_BASE_URL}/api/week-offs/assign`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...input,
        ...(companyId ? { companyId } : {}),
      }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to assign week-off" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error assigning week-off" };
  }
};
