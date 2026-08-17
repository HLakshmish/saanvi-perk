import { Expense, ExpenseStatus, ExpenseStats, CreateExpenseInput } from "../types/expenses.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  if (match) return match[1];
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
}

export function getCompanyIdCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )company_id=([^;]*)/);
  return match ? Number(match[1]) : null;
}

/**
 * Decodes the current user's userId from the JWT payload.
 */
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
    // Regular users have userId, SuperAdmin has superAdminId
    return parsed.userId ? Number(parsed.userId) : parsed.superAdminId ? Number(parsed.superAdminId) : null;
  } catch (e) {
    console.error("Failed to decode token for userId:", e);
    return null;
  }
}

/**
 * Maps database claim status to frontend ExpenseStatus.
 */
function mapBackendStatus(status: string): ExpenseStatus {
  const norm = status?.toUpperCase();
  if (norm === "APPROVED" || norm === "PAID") return "Approved";
  if (norm === "REJECTED" || norm === "CANCELLED") return "Rejected";
  return "Pending"; // Matches SUBMITTED, UNDER_REVIEW, DRAFT
}

/**
 * Maps database claim to frontend Expense object.
 */
function mapClaimToExpense(claim: any): Expense {
  const submittedDate = claim.submittedAt 
    ? claim.submittedAt.split("T")[0] 
    : claim.claimDate 
      ? claim.claimDate.split("T")[0] 
      : new Date().toISOString().split("T")[0];

  const firstBill = claim.bills && claim.bills.length > 0 ? claim.bills[0] : null;

  return {
    id: String(claim.claimId),
    userId: claim.userId,
    employeeName: claim.user 
      ? `${claim.user.firstName} ${claim.user.lastName || ""}`.trim() 
      : `User #${claim.userId}`,
    category: claim.reimbursementType || "Others",
    amount: Number(claim.totalAmount),
    submittedDate,
    description: claim.description || "",
    merchant: claim.remarks || firstBill?.vendorName || "",
    status: mapBackendStatus(claim.status),
    receiptUrl: firstBill ? firstBill.fileName : null,
    billId: firstBill ? firstBill.billId : null,
    approvedBy: claim.approver 
      ? `${claim.approver.firstName} ${claim.approver.lastName || ""}`.trim() 
      : null,
    approvedDate: claim.approvedAt ? claim.approvedAt.split("T")[0] : null,
    comments: claim.rejectionReason || claim.remarks || null,
  };
}

/**
 * Fetch list of expenses from actual API.
 * Performs client-side search/filters on retrieved backend data.
 */
export const getExpenses = async (filters?: {
  search?: string;
  category?: string;
  status?: string;
  period?: string;
}): Promise<Expense[]> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  if (!companyId) {
    throw new Error("Session expired. Please log in again.");
  }

  const url = `${API_BASE_URL}/api/reimbursements?companyId=${companyId}`;

  try {
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();

    // Handle 403 Forbidden (missing permission) gracefully — return empty list instead of throwing
    if (res.status === 403) {
      return [];
    }

    if (!res.ok || !result.success || !Array.isArray(result.data)) {
      return [];
    }

    const list: Expense[] = result.data.map(mapClaimToExpense);
    let filtered = [...list];

    // Client-side search query
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e: Expense) =>
          e.id.toLowerCase().includes(query) ||
          e.employeeName.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.merchant.toLowerCase().includes(query)
      );
    }

    // Client-side category filter
    if (filters?.category && filters.category !== "All") {
      filtered = filtered.filter((e: Expense) => e.category === filters.category);
    }

    // Client-side status filter
    if (filters?.status && filters.status !== "All") {
      filtered = filtered.filter((e: Expense) => e.status === filters.status);
    }

    // Client-side period filter
    if (filters?.period && filters.period !== "All") {
      const today = new Date();
      filtered = filtered.filter((e: Expense) => {
        const expDate = new Date(e.submittedDate);
        if (filters.period === "This Month") {
          return (
            expDate.getMonth() === today.getMonth() &&
            expDate.getFullYear() === today.getFullYear()
          );
        } else if (filters.period === "Last Month") {
          const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          return expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear;
        }
        return true;
      });
    }

    return filtered.sort((a, b) => b.submittedDate.localeCompare(a.submittedDate));
  } catch (error) {
    console.error("API error fetching claims:", error);
    throw error; // Propagate error state to UI correctly
  }
};

/**
 * Creates/submits a new expense claim. Uploads file attachments if provided.
 */
export const createExpense = async (
  input: CreateExpenseInput & { receiptFile?: File | null },
  currentUser: { userId: number; name: string }
): Promise<{ success: boolean; data?: Expense; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  if (!token || !companyId) {
    return { success: false, error: "Authentication session expired. Please log in again." };
  }

  try {
    // 1. Submit claim JSON metadata
    const claimRes = await fetch(`${API_BASE_URL}/api/reimbursements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reimbursementType: input.category,
        claimDate: input.submittedDate ? new Date(input.submittedDate).toISOString() : new Date().toISOString(),
        totalAmount: Number(input.amount),
        description: input.description,
        status: "SUBMITTED",
        remarks: input.merchant, // map merchant to remarks
        companyId: companyId,
      }),
    });

    const claimResult = await claimRes.json();
    if (!claimRes.ok || !claimResult.success || !claimResult.data) {
      return { success: false, error: claimResult.message || "Failed to submit claim details." };
    }

    const claim = claimResult.data;

    // 2. Upload file attachment if receiptFile is selected
    if (input.receiptFile) {
      const formData = new FormData();
      formData.append("claimId", String(claim.claimId));
      formData.append("billAmount", String(input.amount));
      formData.append("vendorName", input.merchant);
      formData.append("file", input.receiptFile);
      formData.append("companyId", String(companyId));

      const billRes = await fetch(`${API_BASE_URL}/api/reimbursements/bills`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const billResult = await billRes.json();
      if (!billRes.ok || !billResult.success) {
        return { 
          success: false, 
          error: billResult.message || "Claim created, but failed to upload attachment file." 
        };
      }
      
      // Update claim object locally with bill details
      claim.bills = [billResult.data];
    }

    return { success: true, data: mapClaimToExpense(claim) };
  } catch (err: any) {
    console.error("API error submitting claim:", err);
    return { success: false, error: err.message || "Failed to submit expense claim." };
  }
};

/**
 * Updates status of an expense (Approve / Reject).
 */
export const updateExpenseStatus = async (
  expenseId: string,
  status: ExpenseStatus,
  comments: string,
  approverName: string
): Promise<{ success: boolean; data?: Expense; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  if (!token || !companyId) {
    return { success: false, error: "Authentication expired. Access denied." };
  }

  // Map UI status back to backend database enum
  const backendStatus = status === "Approved" ? "APPROVED" : "REJECTED";

  try {
    const res = await fetch(`${API_BASE_URL}/api/reimbursements/${expenseId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: backendStatus,
        remarks: comments,
        rejectionReason: backendStatus === "REJECTED" ? comments : undefined,
        companyId: companyId,
      }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.message || "Failed to update status." };
    }

    return { success: true, data: mapClaimToExpense(result.data) };
  } catch (err: any) {
    console.error("API error updating claim status:", err);
    return { success: false, error: err.message || "Failed to update expense status." };
  }
};

/**
 * Downloads a bill attachment blob by ID.
 */
export const downloadBill = async (billId: number): Promise<Blob> => {
  const token = getAuthToken();
  if (!token) throw new Error("Session expired.");

  const res = await fetch(`${API_BASE_URL}/api/reimbursements/bills/${billId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to download bill receipt file.");
  }

  return await res.blob();
};

/**
 * Retrieves aggregate statistics dynamically using database claims.
 */
export const getExpenseStats = async (period?: string, trendOffset: number = 0): Promise<ExpenseStats> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();
  if (!companyId) {
    throw new Error("Session expired. Please log in again.");
  }

  const url = `${API_BASE_URL}/api/reimbursements?companyId=${companyId}`;

  try {
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();
    if (res.status === 403 || !res.ok || !result.success || !Array.isArray(result.data)) {
      return {
        totalAmount: 0,
        totalRequests: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        monthlyTrend: [],
      };
    }

    const list: Expense[] = result.data.map(mapClaimToExpense);

    // Filter by period first if needed
    let filtered = [...list];
    if (period && period !== "All") {
      const today = new Date();
      filtered = filtered.filter((e: Expense) => {
        const expDate = new Date(e.submittedDate);
        if (period === "This Month") {
          return (
            expDate.getMonth() === today.getMonth() &&
            expDate.getFullYear() === today.getFullYear()
          );
        } else if (period === "Last Month") {
          const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          return expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear;
        }
        return true;
      });
    }

    const approved = filtered.filter((e) => e.status === "Approved");
    const totalAmount = approved.reduce((sum, e) => sum + e.amount, 0);

    // Dynamic 6-month trend calculations
    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseYear = 2026;
    const baseMonthIndex = 7; // August

    const months: Array<{ name: string; year: number; key: string }> = [];
    for (let i = 5; i >= 0; i--) {
      const totalMonths = baseMonthIndex + trendOffset - i;
      let monthIdx = totalMonths % 12;
      let yearOffset = Math.floor(totalMonths / 12);
      if (monthIdx < 0) {
        monthIdx += 12;
      }
      const year = baseYear + yearOffset;
      const name = monthNamesShort[monthIdx];
      months.push({
        name,
        year,
        key: `${name} ${year}`
      });
    }

    const monthlyTrendMap: Record<string, number> = {};
    months.forEach((m) => {
      monthlyTrendMap[m.key] = 0;
    });

    list.filter((e: Expense) => e.status === "Approved").forEach((e: Expense) => {
      const date = new Date(e.submittedDate);
      const mName = monthNamesShort[date.getMonth()];
      const mYear = date.getFullYear();
      const key = `${mName} ${mYear}`;
      if (key in monthlyTrendMap) {
        monthlyTrendMap[key] += e.amount;
      }
    });

    const monthlyTrend = months.map((m) => ({
      month: m.name,
      amount: monthlyTrendMap[m.key],
    }));

    return {
      totalAmount,
      totalRequests: filtered.length,
      approvedCount: filtered.filter((e) => e.status === "Approved").length,
      pendingCount: filtered.filter((e) => e.status === "Pending").length,
      rejectedCount: filtered.filter((e) => e.status === "Rejected").length,
      monthlyTrend,
    };
  } catch (error) {
    console.error("API error getting stats:", error);
    // Return empty stats on error
    return {
      totalAmount: 0,
      totalRequests: 0,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      monthlyTrend: [],
    };
  }
};
