const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  if (match) return match[1];
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
}

function getCompanyIdCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )company_id=([^;]*)/);
  if (match && match[1]) return Number(match[1]);
  const storedId = localStorage.getItem("company_id");
  return storedId ? Number(storedId) : 4;
}

export const fetchCompanyDetails = async () => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies/${companyId || 4}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch company details" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

export const updateCompanyDetails = async (updateData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies/${companyId || 4}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updateData),
    });
    const result = await res.json();
    if (res.ok && result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to update company details" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

export const fetchLocations = async () => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/locations`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const updateLocation = async (locationId: number, updateData: Record<string, any>) => {
  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/api/locations/${locationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updateData),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchPermissions = async () => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/roles/permissions`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const fetchRoles = async () => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const url = `${API_BASE_URL}/api/roles?companyId=${companyId}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const fetchRoleById = async (roleId: string | number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const url = `${API_BASE_URL}/api/roles/${roleId}?companyId=${companyId}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch role details" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

export const createRoleApi = async (roleData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    status: true,
    companyId: Number(companyId),
    ...roleData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/roles`, {
      method: "POST",
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
    return { success: false, error: result.message || "Failed to create role" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateRoleApi = async (roleId: string | number, roleData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    status: true,
    companyId: Number(companyId),
    ...roleData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/roles/${roleId}?companyId=${companyId}`, {
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
    return { success: false, error: result.message || "Failed to update role" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteRoleApi = async (roleId: string | number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/roles/${roleId}?companyId=${companyId}`
    : `${API_BASE_URL}/api/roles/${roleId}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to delete role" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchLeaveTypes = async () => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-types?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-types`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const fetchLeaveTypeById = async (id: string | number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-types/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-types/${id}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch leave type details" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createLeaveTypeApi = async (leaveData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    status: true,
    companyId: Number(companyId),
    ...leaveData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-types`, {
      method: "POST",
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
    return { success: false, error: result.message || "Failed to create leave type" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLeaveTypeApi = async (id: string | number, leaveData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    status: true,
    ...leaveData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-types/${id}?companyId=${companyId}`, {
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
    return { success: false, error: result.message || "Failed to update leave type" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteLeaveTypeApi = async (id: string | number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-types/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-types/${id}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to delete leave type" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
