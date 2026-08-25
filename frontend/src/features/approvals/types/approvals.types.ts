export type ApprovalModuleType = "LEAVE" | "REIMBURSEMENT" | "ATTENDANCE";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "PAID" | "UNDER_REVIEW";

export interface UnifiedApprovalItem {
  id: string; // "leave-12", "reimb-34", or "attendance-56"
  rawId: number;
  moduleType: ApprovalModuleType;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  avatarUrl?: string;
  requestDate: string; // ISO date or formatted
  title: string; // "Casual Leave (2 Days)", "Travel Reimbursement (₹4,500)", or "Attendance Regularization"
  category: string; // "Casual Leave", "Travel Expense", or "Attendance Correction"
  amountOrDays: string; // "2.0 Days", "₹4,500.00", or "09:30 - 18:30"
  numericValue: number; // 2 or 4500
  periodOrDate: string; // "24-08-2026 to 25-08-2026" or "15-08-2026"
  reason: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  remarks?: string;
  rejectionReason?: string;
  bills?: Array<{
    billId: number;
    fileName: string;
    billAmount: number;
    billNumber?: string;
  }>;
}

export interface ApprovalActionPayload {
  status: "APPROVED" | "REJECTED" | "PAID";
  remarks?: string;
  rejectionReason?: string;
  approvedAmount?: number;
}

export interface ApprovalStats {
  total: number;
  pending: number;
  completed: number;
  approved: number;
  rejected: number;
  leavesPending: number;
  reimbursementsPending: number;
  attendancePending: number;
}
