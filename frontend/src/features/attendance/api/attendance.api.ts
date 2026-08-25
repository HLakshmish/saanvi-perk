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



