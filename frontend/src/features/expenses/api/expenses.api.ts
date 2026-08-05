import { Expense, ExpenseStatus, ExpenseStats, CreateExpenseInput } from "../types/expenses.types";

const LOCAL_STORAGE_KEY = "saanvi_expenses_claims_v3";

// Default seed data
const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "EXP-101",
    userId: 1,
    employeeName: "Sharanya",
    category: "Travel",
    amount: 1200,
    submittedDate: "2026-03-15",
    description: "Travel to local client site",
    merchant: "Uber",
    status: "Approved",
    receiptUrl: "receipt_travel_101.pdf",
    approvedBy: "CHINMAYA BAIRY",
    approvedDate: "2026-03-18",
    comments: "Approved based on local travel guidelines.",
  },
  {
    id: "EXP-102",
    userId: 2,
    employeeName: "Sandeep Kumar",
    category: "Food & Meals",
    amount: 3200,
    submittedDate: "2026-04-12",
    description: "Client business lunch meeting",
    merchant: "Local Cafe",
    status: "Approved",
    receiptUrl: "receipt_food_102.pdf",
    approvedBy: "CHINMAYA BAIRY",
    approvedDate: "2026-04-14",
    comments: "Approved client meeting meal.",
  },
  {
    id: "EXP-103",
    userId: 1,
    employeeName: "Sharanya",
    category: "Equipment",
    amount: 1500,
    submittedDate: "2026-05-20",
    description: "Ergonomic laptop stand for office",
    merchant: "Amazon",
    status: "Approved",
    receiptUrl: null,
    approvedBy: "CHINMAYA BAIRY",
    approvedDate: "2026-05-22",
    comments: "Approved hardware requisition.",
  },
  {
    id: "EXP-104",
    userId: 3,
    employeeName: "Rohan K",
    category: "Software",
    amount: 2400,
    submittedDate: "2026-08-02",
    description: "Monthly subscription for developer tools",
    merchant: "GitHub",
    status: "Pending",
    receiptUrl: null,
    approvedBy: null,
    approvedDate: null,
    comments: null,
  },
];

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

function getSavedExpenses(): Expense[] {
  if (typeof window === "undefined") return DEFAULT_EXPENSES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_EXPENSES));
      return DEFAULT_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_EXPENSES;
  }
}

function saveExpenses(expenses: Expense[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error("Failed to save expenses locally:", e);
  }
}

/**
 * Fetch list of expenses (supports mock local storage fallback).
 * Filters dynamically depending on category, status, and query details.
 */
export const getExpenses = async (filters?: {
  search?: string;
  category?: string;
  status?: string;
  period?: string;
}): Promise<Expense[]> => {
  const token = getAuthToken();
  // Simulate backend connection/authentication check
  if (!token) {
    console.warn("Unauthorized access to expenses list (no auth token found).");
  }

  const list = getSavedExpenses();
  let filtered = [...list];

  if (filters?.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.id.toLowerCase().includes(query) ||
        e.employeeName.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.merchant.toLowerCase().includes(query)
    );
  }

  if (filters?.category && filters.category !== "All") {
    filtered = filtered.filter((e) => e.category === filters.category);
  }

  if (filters?.status && filters.status !== "All") {
    filtered = filtered.filter((e) => e.status === filters.status);
  }

  if (filters?.period && filters.period !== "All") {
    const today = new Date();
    filtered = filtered.filter((e) => {
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

  // Return sorted descending by date/id
  return filtered.sort((a, b) => b.submittedDate.localeCompare(a.submittedDate));
};

/**
 * Creates/submits a new expense claim.
 */
export const createExpense = async (
  input: CreateExpenseInput,
  currentUser: { userId: number; name: string }
): Promise<{ success: boolean; data?: Expense; error?: string }> => {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "Authentication session expired. Please log in again." };
  }

  try {
    const list = getSavedExpenses();
    const newId = `EXP-${Math.floor(Math.random() * 900) + 100}`;
    const newExpense: Expense = {
      id: newId,
      userId: currentUser.userId,
      employeeName: currentUser.name,
      category: input.category,
      amount: Number(input.amount),
      submittedDate: input.submittedDate || new Date().toISOString().split("T")[0],
      description: input.description,
      merchant: input.merchant,
      status: "Pending",
      receiptUrl: input.receiptUrl || null,
      approvedBy: null,
      approvedDate: null,
      comments: null,
    };

    list.unshift(newExpense);
    saveExpenses(list);

    return { success: true, data: newExpense };
  } catch (err: any) {
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
  if (!token) {
    return { success: false, error: "Authentication expired. Access denied." };
  }

  try {
    const list = getSavedExpenses();
    const index = list.findIndex((e) => e.id === expenseId);
    if (index === -1) {
      return { success: false, error: "Expense claim not found." };
    }

    const updated = {
      ...list[index],
      status,
      approvedBy: approverName,
      approvedDate: new Date().toISOString().split("T")[0],
      comments: comments || `${status} by manager.`,
    };

    list[index] = updated;
    saveExpenses(list);

    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update expense status." };
  }
};

/**
 * Retrieves aggregate statistics for dashboard components.
 */
export const getExpenseStats = async (period?: string, trendOffset: number = 0): Promise<ExpenseStats> => {
  const list = getSavedExpenses();
  
  // Filter by period first if needed
  let filtered = [...list];
  if (period && period !== "All") {
    const today = new Date();
    filtered = filtered.filter((e) => {
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

  // Dynamic 6-month range calculation based on base date August 2026 and trendOffset
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

  // Populate trend from all approved items in the list
  list.filter((e) => e.status === "Approved").forEach((e) => {
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
};
