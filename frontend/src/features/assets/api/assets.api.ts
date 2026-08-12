import {
  AssetDetails,
  AssetAssignment,
  AssetHistory,
  CreateAssetInput,
  AssignAssetInput,
  ReturnAssetInput,
} from "../types/assets.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

const getHeaders = (includeContentType = true) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ===================================
// Assets API
// ===================================

export async function getAllAssets(params?: {
  assetType?: string;
  assetStatus?: string;
  brand?: string;
}): Promise<{ success: boolean; data?: AssetDetails[]; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params?.assetType) query.append("assetType", params.assetType);
    if (params?.assetStatus) query.append("assetStatus", params.assetStatus);
    if (params?.brand) query.append("brand", params.brand);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/api/assets${queryString}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "omit",
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to fetch assets" };
  }
}

export async function getAssetById(id: number): Promise<{ success: boolean; data?: AssetDetails; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "omit",
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to fetch asset details" };
  }
}

export async function createAsset(input: CreateAssetInput): Promise<{ success: boolean; data?: AssetDetails; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "omit",
      body: JSON.stringify(input),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to create asset" };
  }
}

export async function updateAsset(id: number, input: Partial<CreateAssetInput>): Promise<{ success: boolean; data?: AssetDetails; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "omit",
      body: JSON.stringify(input),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to update asset" };
  }
}

export async function deleteAsset(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
      credentials: "omit",
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to delete asset" };
  }
}

// ===================================
// Asset Assignments API
// ===================================

export async function getAllAssignments(params?: {
  assetId?: number;
  userId?: number;
  assignmentStatus?: string;
}): Promise<{ success: boolean; data?: AssetAssignment[]; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params?.assetId) query.append("assetId", String(params.assetId));
    if (params?.userId) query.append("userId", String(params.userId));
    if (params?.assignmentStatus) query.append("assignmentStatus", params.assignmentStatus);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/api/assets/assignments${queryString}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "omit",
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to fetch assignments" };
  }
}

export async function createAssignment(input: AssignAssetInput): Promise<{ success: boolean; data?: AssetAssignment; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets/assignments`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "omit",
      body: JSON.stringify(input),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to assign asset" };
  }
}

export async function updateAssignment(id: number, input: ReturnAssetInput): Promise<{ success: boolean; data?: AssetAssignment; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets/assignments/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "omit",
      body: JSON.stringify(input),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to update assignment" };
  }
}

export async function deleteAssignment(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets/assignments/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
      credentials: "omit",
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to delete assignment" };
  }
}

// ===================================
// Asset History API
// ===================================

export async function getAllHistory(params?: {
  assetId?: number;
  userId?: number;
  action?: string;
}): Promise<{ success: boolean; data?: AssetHistory[]; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params?.assetId) query.append("assetId", String(params.assetId));
    if (params?.userId) query.append("userId", String(params.userId));
    if (params?.action) query.append("action", params.action);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/api/assets/history${queryString}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "omit",
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to fetch asset history" };
  }
}
