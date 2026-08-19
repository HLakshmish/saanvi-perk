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

const pendingRequests = new Map<string, Promise<Response>>();

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
    const res = await fetchDeduplicated(url, {
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
    const res = await fetchDeduplicated(url, {
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

// ==========================================
// LEAVE POLICIES
// ==========================================
export const fetchLeavePolicies = async () => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-policies?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-policies`;

  try {
    const res = await fetchDeduplicated(url, {
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

export const createLeavePolicyApi = async (policyData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    status: true,
    companyId: Number(companyId),
    ...policyData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-policies`, {
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
    return { success: false, error: result.message || "Failed to create leave policy" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLeavePolicyApi = async (id: string | number, policyData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    ...policyData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-policies/${id}?companyId=${companyId}`, {
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
    return { success: false, error: result.message || "Failed to update leave policy" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteLeavePolicyApi = async (id: string | number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-policies/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-policies/${id}`;

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
    return { success: false, error: result.message || "Failed to delete leave policy" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// LEAVE POLICY RULES
// ==========================================
export const fetchLeavePolicyRules = async () => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-policy-rules?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-policy-rules`;

  try {
    const res = await fetchDeduplicated(url, {
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

export const createLeavePolicyRuleApi = async (ruleData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    status: true,
    companyId: Number(companyId),
    ...ruleData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-policy-rules`, {
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
    return { success: false, error: result.message || "Failed to create leave policy rule" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLeavePolicyRuleApi = async (id: string | number, ruleData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    ...ruleData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-policy-rules/${id}?companyId=${companyId}`, {
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
    return { success: false, error: result.message || "Failed to update leave policy rule" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteLeavePolicyRuleApi = async (id: string | number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-policy-rules/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-policy-rules/${id}`;

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
    return { success: false, error: result.message || "Failed to delete leave policy rule" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// LEAVE POLICY ACCUMULATIONS
// ==========================================
export const fetchLeavePolicyAccumulations = async () => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-policy-accumulations?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-policy-accumulations`;

  try {
    const res = await fetchDeduplicated(url, {
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

export const createLeavePolicyAccumulationApi = async (accData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    status: true,
    companyId: Number(companyId),
    ...accData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-policy-accumulations`, {
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
    return { success: false, error: result.message || "Failed to create accumulation" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLeavePolicyAccumulationApi = async (id: string | number, accData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    ...accData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-policy-accumulations/${id}?companyId=${companyId}`, {
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
    return { success: false, error: result.message || "Failed to update accumulation" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteLeavePolicyAccumulationApi = async (id: string | number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-policy-accumulations/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-policy-accumulations/${id}`;

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
    return { success: false, error: result.message || "Failed to delete accumulation" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// LEAVE ACCUMULATIONS (Employee-level records)
// ==========================================
export const fetchLeaveAccumulations = async (filters?: { userId?: number; leaveTypeId?: number }) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  
  let url = `${API_BASE_URL}/api/leave-accumulations`;
  const params: string[] = [];
  if (companyId) params.push(`companyId=${companyId}`);
  if (filters?.userId) params.push(`userId=${filters.userId}`);
  if (filters?.leaveTypeId) params.push(`leaveTypeId=${filters.leaveTypeId}`);
  
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  try {
    const res = await fetchDeduplicated(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [], error: result.message || "Failed to fetch leave accumulations" };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const createLeaveAccumulation = async (data: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...data,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-accumulations`, {
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
    return { success: false, error: result.message || "Failed to create leave accumulation" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLeaveAccumulation = async (id: number, data: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...data,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-accumulations/${id}`, {
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
    return { success: false, error: result.message || "Failed to update leave accumulation" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteLeaveAccumulation = async (id: number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-accumulations/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-accumulations/${id}`;

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
    return { success: false, error: result.message || "Failed to delete leave accumulation" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// LEAVE YEAR END PROCESS
// ==========================================
export const fetchYearEndProcesses = async (filters?: { userId?: number; year?: number }) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  
  let url = `${API_BASE_URL}/api/leave-year-end-processes`;
  const params: string[] = [];
  if (companyId) params.push(`companyId=${companyId}`);
  if (filters?.userId) params.push(`userId=${filters.userId}`);
  if (filters?.year) params.push(`year=${filters.year}`);
  
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  try {
    const res = await fetchDeduplicated(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [], error: result.message || "Failed to fetch year end processes" };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const createYearEndProcessApi = async (data: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...data,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-year-end-processes`, {
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
    return { success: false, error: result.message || "Failed to create year end process" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateYearEndProcessApi = async (id: number, data: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...data,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-year-end-processes/${id}`, {
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
    return { success: false, error: result.message || "Failed to update year end process" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteYearEndProcessApi = async (id: number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-year-end-processes/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-year-end-processes/${id}`;

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
    return { success: false, error: result.message || "Failed to delete year end process" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// COMP-OFF POLICIES
// ==========================================
export const fetchCompOffPolicies = async () => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/comp-off-policies?companyId=${companyId}`
    : `${API_BASE_URL}/api/comp-off-policies`;

  try {
    const res = await fetchDeduplicated(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [], error: result.message || "Failed to fetch comp-off policies" };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const createCompOffPolicyApi = async (policyData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...policyData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/comp-off-policies`, {
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
    return { success: false, error: result.message || "Failed to create comp-off policy" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateCompOffPolicyApi = async (id: number, policyData: Record<string, any>) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...policyData,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/comp-off-policies/${id}`, {
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
    return { success: false, error: result.message || "Failed to update comp-off policy" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteCompOffPolicyApi = async (id: number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/comp-off-policies/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/comp-off-policies/${id}`;

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
    return { success: false, error: result.message || "Failed to delete comp-off policy" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// COMP-OFF ASSIGNMENTS
// ==========================================
export const fetchCompOffAssignments = async (filters?: { userId?: number; policyId?: number }) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  
  let url = `${API_BASE_URL}/api/comp-off-assigns`;
  const params: string[] = [];
  if (companyId) params.push(`companyId=${companyId}`);
  if (filters?.userId) params.push(`userId=${filters.userId}`);
  if (filters?.policyId) params.push(`policyId=${filters.policyId}`);
  
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  try {
    const res = await fetchDeduplicated(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [], error: result.message || "Failed to fetch comp-off assignments" };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

export const createCompOffAssignmentApi = async (data: { userIds: number[]; policyId: number; startDate: string; endDate: string; status?: boolean }) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...data,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/comp-off-assigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, count: result.count };
    }
    return { success: false, error: result.message || "Failed to create comp-off assignment" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateCompOffAssignmentApi = async (id: number, data: { policyId?: number; startDate?: string; endDate?: string; status?: boolean }) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie() || 4;
  const payload = {
    companyId: Number(companyId),
    ...data,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/comp-off-assigns/${id}`, {
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
    return { success: false, error: result.message || "Failed to update comp-off assignment" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteCompOffAssignmentApi = async (id: number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/comp-off-assigns/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/comp-off-assigns/${id}`;

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
    return { success: false, error: result.message || "Failed to delete comp-off assignment" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};


