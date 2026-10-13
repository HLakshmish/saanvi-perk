const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

export interface AttendancePayload {
  userId: number;
  attendanceDate: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  attendanceStatus?: "PRESENT" | "HALF_DAY" | "ABSENT" | "ON_LEAVE";
  workingMinutes?: number;
  remarks?: string;
}

// 1. Create a Check-In record in backend
export async function createAttendanceCheckIn(data: AttendancePayload) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/attendances`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}

// 2. Update Check-Out in existing attendance record
export async function updateAttendanceCheckOut(
  attendanceId: number,
  data: Partial<AttendancePayload>
) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/attendances/${attendanceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}

// 3. Fetch attendance list
export async function getAttendances(params?: {
  userId?: number;
  attendanceDate?: string;
}) {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params?.userId) query.append("userId", String(params.userId));
  if (params?.attendanceDate) query.append("attendanceDate", params.attendanceDate);

  const url = `${API_BASE_URL}/api/attendances${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json();
  return json;
}

// 4. Fetch attendance report data
export async function getAttendanceReportView(params: {
  userId?: number;
  attendanceStatus?: string;
  attendanceDate?: string;
}) {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params.userId) query.append("userId", String(params.userId));
  if (params.attendanceStatus) query.append("attendanceStatus", params.attendanceStatus);
  if (params.attendanceDate) query.append("attendanceDate", params.attendanceDate);

  const url = `${API_BASE_URL}/api/attendances/report/view?${query.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json();
  return json;
}

export interface AttendanceRequestPayload {
  shiftDate: string; // ISO string or YYYY-MM-DD
  reason: "BUSINESS_TOUR" | "FORGOT_ID" | "NEW_JOINEE" | "ON_DUTY" | "OTHERS";
  checkInTime?: string | null;
  checkOutTime?: string | null;
  isNextDay?: boolean;
  remarks: string;
}

export async function createAttendanceRequest(data: AttendanceRequestPayload) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/attendance-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}

export async function fetchAttendanceRequests(filterUserId?: number) {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (filterUserId) query.append("userId", String(filterUserId));

  const url = `${API_BASE_URL}/api/attendance-requests${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json();
  return json;
}

// 5. Download attendance CSV report
export async function downloadAttendanceReport(params: {
  userId?: number;
  attendanceStatus?: string;
  attendanceDate?: string;
}) {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params.userId) query.append("userId", String(params.userId));
  if (params.attendanceStatus) query.append("attendanceStatus", params.attendanceStatus);
  if (params.attendanceDate) query.append("attendanceDate", params.attendanceDate);

  const url = `${API_BASE_URL}/api/attendances/report/download?${query.toString()}`;
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
  link.setAttribute("download", "attendance_report.csv");
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
}

// 6. Comp-Off Work Permission Requests
export interface CompOffRequestPayload {
  userId?: number;
  workDate: string;
  requestType?: "HOLIDAY" | "WEEK_OFF" | "OTHER";
  holidayOrWeekOffName?: string;
  reason: string;
  companyId?: number;
}

export async function createCompOffRequest(data: CompOffRequestPayload) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/comp-off-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}

export async function fetchCompOffRequests(
  filterOrParams?: number | { userId?: number; status?: string; companyId?: number }
) {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (typeof filterOrParams === "number") {
    query.append("userId", String(filterOrParams));
  } else if (filterOrParams && typeof filterOrParams === "object") {
    if (filterOrParams.userId) query.append("userId", String(filterOrParams.userId));
    if (filterOrParams.status) query.append("status", filterOrParams.status);
    if (filterOrParams.companyId) query.append("companyId", String(filterOrParams.companyId));
  }

  const url = `${API_BASE_URL}/api/comp-off-requests${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json();
  return json;
}

export async function updateCompOffRequestStatus(
  id: number,
  payload: { status: "APPROVED" | "REJECTED" | "CANCELLED"; rejectionReason?: string; remarks?: string }
) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/comp-off-requests/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return json;
}
