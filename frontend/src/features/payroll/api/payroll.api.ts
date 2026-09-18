import {
  PayrollSettings,
  CalculateSalaryInput,
  SalaryBreakupResult,
  EmployeeSalaryStructure,
  Payslip
} from "../types/payroll.types";

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

function getHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// 1. Get Payroll Settings (dynamic rates)
export async function getPayrollSettings(companyId?: number): Promise<{ success: boolean; data?: PayrollSettings; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const url = cId ? `${API_BASE_URL}/api/payroll/settings?companyId=${cId}` : `${API_BASE_URL}/api/payroll/settings`;
    const res = await fetch(url, { method: "GET", headers: getHeaders() });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to fetch payroll settings" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 2. Update Payroll Settings (dynamic rates)
export async function updatePayrollSettings(data: Partial<PayrollSettings>, companyId?: number): Promise<{ success: boolean; data?: PayrollSettings; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const res = await fetch(`${API_BASE_URL}/api/payroll/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ ...data, companyId: cId })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to update payroll settings" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 3. Calculate Salary Breakup (Real-time Calculator)
export async function calculateSalaryBreakup(payload: CalculateSalaryInput, companyId?: number): Promise<{ success: boolean; data?: SalaryBreakupResult; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const res = await fetch(`${API_BASE_URL}/api/payroll/calculate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...payload, companyId: cId })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to calculate salary breakup" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 4. Assign Salary Structure to Employee (Initial or Hike / Revision)
export async function assignEmployeeSalary(
  payload: {
    userId: number;
    annualCtc?: number;
    monthlyCtc?: number;
    monthlyGross?: number;
    basicAmount?: number;
    effectiveDate?: string;
    hikePercentage?: number;
    previousCtc?: number;
    revisionType?: string;
    remarks?: string;
  },
  companyId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const res = await fetch(`${API_BASE_URL}/api/payroll/salaries`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...payload, companyId: cId })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to assign salary structure" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 4b. Get Salary Revision & Hike History for Employee
export async function getSalaryHistory(
  userId: number,
  companyId?: number
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const query = cId ? `?companyId=${cId}` : "";
    const res = await fetch(`${API_BASE_URL}/api/payroll/salaries/${userId}/history${query}`, {
      method: "GET",
      headers: getHeaders()
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to fetch salary history" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 5. Get All Employee Salary Structures
export async function getAllSalaryStructures(search?: string, companyId?: number): Promise<{ success: boolean; data?: EmployeeSalaryStructure[]; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const query = new URLSearchParams();
    if (cId) query.set("companyId", String(cId));
    if (search) query.set("search", search);

    const res = await fetch(`${API_BASE_URL}/api/payroll/salaries?${query.toString()}`, {
      method: "GET",
      headers: getHeaders()
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to fetch salary structures" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 6. Get Salary Structure for a Specific Employee
export async function getEmployeeSalaryStructure(userId: number, companyId?: number): Promise<{ success: boolean; data?: EmployeeSalaryStructure; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const query = cId ? `?companyId=${cId}` : "";
    const res = await fetch(`${API_BASE_URL}/api/payroll/salaries/${userId}${query}`, {
      method: "GET",
      headers: getHeaders()
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to fetch employee salary structure" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 7. Generate Monthly Payroll / Payslips
export async function generateMonthlyPayroll(payload: { month: number; year: number; userIds?: number[] }, companyId?: number): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const res = await fetch(`${API_BASE_URL}/api/payroll/payslips/generate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...payload, companyId: cId })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to generate monthly payroll" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 8. Get Payslips List
export async function getPayslips(filters: { userId?: number; month?: number; year?: number; status?: string }, companyId?: number): Promise<{ success: boolean; data?: Payslip[]; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const query = new URLSearchParams();
    if (cId) query.set("companyId", String(cId));
    if (filters.userId) query.set("userId", String(filters.userId));
    if (filters.month) query.set("month", String(filters.month));
    if (filters.year) query.set("year", String(filters.year));
    if (filters.status) query.set("status", filters.status);

    const res = await fetch(`${API_BASE_URL}/api/payroll/payslips?${query.toString()}`, {
      method: "GET",
      headers: getHeaders()
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to fetch payslips" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 9. Get Single Payslip by ID
export async function getPayslipById(id: number, companyId?: number): Promise<{ success: boolean; data?: Payslip; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const query = cId ? `?companyId=${cId}` : "";
    const res = await fetch(`${API_BASE_URL}/api/payroll/payslips/${id}${query}`, {
      method: "GET",
      headers: getHeaders()
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to fetch payslip details" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// 10. Update Payslip Status (e.g. mark as PAID)
export async function updatePayslipStatus(id: number, status: "GENERATED" | "PAID" | "ON_HOLD", paymentDate?: string, companyId?: number): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const cId = companyId || getCompanyIdCookie();
    const res = await fetch(`${API_BASE_URL}/api/payroll/payslips/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, paymentDate, companyId: cId })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || "Failed to update payslip status" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}
