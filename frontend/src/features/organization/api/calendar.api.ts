const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

export interface CalendarRecord {
  calendarId: number;
  companyId?: number;
  calendarCode: string;
  calendarName: string;
  remarks?: string | null;
  status: boolean;
}

export interface CreateCalendarInput {
  calendarCode: string;
  calendarName: string;
  remarks?: string;
  status?: boolean;
}

export interface HolidayRecord {
  holidayId: number;
  calendarId: number;
  companyId?: number;
  holidayCode: string;
  holidayName: string;
  startDate: string;
  endDate: string;
  holidayType: "HOLIDAY" | "WEEK_OFF";
  isHalfDay?: boolean;
  isOptional?: boolean;
  remarks?: string | null;
  status?: boolean;
}

export interface CreateHolidayInput {
  calendarId: number;
  holidayCode: string;
  holidayName: string;
  startDate: string;
  endDate: string;
  holidayType: "HOLIDAY" | "WEEK_OFF";
  isHalfDay?: boolean;
  isOptional?: boolean;
  remarks?: string;
  status?: boolean;
}

/**
 * Fetch all Calendars (GET /api/calendars)
 */
export const getCalendars = async (): Promise<{ success: boolean; data?: CalendarRecord[]; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/calendars`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch calendars list" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Create a new Calendar (POST /api/calendars)
 */
export const createCalendar = async (input: CreateCalendarInput): Promise<{ success: boolean; data?: CalendarRecord; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/calendars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        status: true,
        ...input,
      }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to create calendar" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Update Calendar (PUT /api/calendars/:id)
 */
export const updateCalendar = async (id: number, input: Partial<CreateCalendarInput>): Promise<{ success: boolean; data?: CalendarRecord; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/calendars/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to update calendar" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete Calendar (DELETE /api/calendars/:id)
 */
export const deleteCalendar = async (id: number): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/calendars/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to delete calendar" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Fetch Holidays (GET /api/holidays?calendarId=X)
 */
export const getHolidays = async (calendarId?: number): Promise<{ success: boolean; data?: HolidayRecord[]; error?: string }> => {
  const token = getAuthToken();
  try {
    const query = calendarId ? `?calendarId=${calendarId}` : "";
    const res = await fetch(`${API_BASE_URL}/api/holidays${query}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to fetch holidays list" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Create a Holiday (POST /api/holidays)
 */
export const createHoliday = async (input: CreateHolidayInput): Promise<{ success: boolean; data?: HolidayRecord; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/holidays`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        status: true,
        isHalfDay: false,
        isOptional: false,
        ...input,
      }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to create holiday" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Update a Holiday (PUT /api/holidays/:id)
 */
export const updateHoliday = async (id: number, input: Partial<CreateHolidayInput>): Promise<{ success: boolean; data?: HolidayRecord; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/holidays/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.message || "Failed to update holiday" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete a Holiday (DELETE /api/holidays/:id)
 */
export const deleteHoliday = async (id: number): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/api/holidays/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    }
    return { success: false, error: result.message || "Failed to delete holiday" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
