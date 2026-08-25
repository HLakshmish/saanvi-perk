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
