export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export interface Expense {
  id: string;
  userId: number;
  employeeName: string;
  category: string;
  amount: number;
  submittedDate: string;
  description: string;
  merchant: string;
  status: ExpenseStatus;
  receiptUrl: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  comments: string | null;
  billId?: number | null;
}

export interface CreateExpenseInput {
  category: string;
  amount: number;
  description: string;
  merchant: string;
  submittedDate: string;
  receiptUrl?: string | null;
}

export interface ExpenseStats {
  totalAmount: number;
  totalRequests: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  monthlyTrend: Array<{
    month: string; // e.g. "Mar", "Apr", etc.
    amount: number;
  }>;
}
