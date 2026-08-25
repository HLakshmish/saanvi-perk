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

export function getCurrentUserId(): number | null {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.userId ? Number(parsed.userId) : parsed.superAdminId ? Number(parsed.superAdminId) : null;
  } catch (e) {
    console.error("Failed to decode token for userId:", e);
    return null;
  }
}

export const fetchLeaveRequests = async (filterUserId?: number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  
  let url = `${API_BASE_URL}/api/leave-requests`;
  const params = new URLSearchParams();
  if (companyId) {
    params.append("companyId", String(companyId));
  }
  if (filterUserId) {
    params.append("userId", String(filterUserId));
  }
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  try {
    const res = await fetchDeduplicated(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch leave requests" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

export const createLeaveRequest = async (payload: {
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  reason: string;
  userId?: number;
  companyId?: number;
}) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  const body = {
    ...payload,
    companyId: payload.companyId || companyId || undefined,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/leave-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to submit leave request" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

export const deleteLeaveRequest = async (id: number) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-requests/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-requests/${id}`;

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
    return { success: false, error: result.message || "Failed to cancel leave request" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

export const updateLeaveRequestStatus = async (
  id: number | string,
  status: "APPROVED" | "REJECTED" | "CANCELLED",
  rejectionReason?: string,
  remarks?: string
) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = `${API_BASE_URL}/api/leave-requests/${id}/status?companyId=${companyId}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status, rejectionReason, remarks }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to update leave request status" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

export const fetchLeaveRequestById = async (id: number | string) => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  const url = companyId
    ? `${API_BASE_URL}/api/leave-requests/${id}?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-requests/${id}`;

  try {
    const res = await fetchDeduplicated(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch leave request details" };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

// Fetch leave requests report data
export const getLeaveRequestReportView = async (params: {
  companyId?: number;
  userId?: number;
}) => {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params.companyId) query.append("companyId", String(params.companyId));
  if (params.userId) query.append("userId", String(params.userId));

  const url = `${API_BASE_URL}/api/leave-requests/report/view?${query.toString()}`;
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
    return { success: false, error: error.message || "Network error" };
  }
};

// Download leave requests CSV report
export const downloadLeaveRequestReport = async (params: {
  companyId?: number;
  userId?: number;
}) => {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params.companyId) query.append("companyId", String(params.companyId));
  if (params.userId) query.append("userId", String(params.userId));

  const url = `${API_BASE_URL}/api/leave-requests/report/download?${query.toString()}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) throw new Error("Failed to download file");

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "leave_report.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};

// Fetch all configured leave types
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
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
};
