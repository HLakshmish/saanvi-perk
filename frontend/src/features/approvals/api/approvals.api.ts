import { UnifiedApprovalItem, ApprovalActionPayload, ApprovalStats } from "../types/approvals.types";

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

/**
 * Fetch all unified approvals (Leaves, Reimbursements, and Attendance Requests)
 */
export const fetchAllApprovals = async (): Promise<{
  success: boolean;
  data: UnifiedApprovalItem[];
  stats: ApprovalStats;
  error?: string;
}> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const leaveUrl = companyId
    ? `${API_BASE_URL}/api/leave-requests?companyId=${companyId}`
    : `${API_BASE_URL}/api/leave-requests`;

  const reimbUrl = companyId
    ? `${API_BASE_URL}/api/reimbursements?companyId=${companyId}`
    : `${API_BASE_URL}/api/reimbursements`;

  const attUrl = `${API_BASE_URL}/api/attendance-requests`;

  try {
    const [leaveRes, reimbRes, attRes] = await Promise.all([
      fetch(leaveUrl, { headers }).then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      fetch(reimbUrl, { headers }).then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      fetch(attUrl, { headers }).then((r) => r.json()).catch(() => ({ success: false, data: [] })),
    ]);

    const items: UnifiedApprovalItem[] = [];

    // 1. Process Leaves
    if (leaveRes.success && Array.isArray(leaveRes.data)) {
      leaveRes.data.forEach((l: any) => {
        const status = (l.status || "PENDING").toUpperCase();
        const fromDateStr = l.fromDate ? new Date(l.fromDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "";
        const toDateStr = l.toDate ? new Date(l.toDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "";
        const period = fromDateStr && toDateStr ? `${fromDateStr} to ${toDateStr}` : fromDateStr || "N/A";
        const empName = l.user ? `${l.user.firstName} ${l.user.lastName || ""}`.trim() : `Employee #${l.userId}`;
        const days = Number(l.numberOfDays ?? 1);
        const typeName = l.leaveType?.leaveName || "Leave";

        items.push({
          id: `leave-${l.leaveRequestId}`,
          rawId: l.leaveRequestId,
          moduleType: "LEAVE",
          employeeId: l.userId,
          employeeName: empName,
          requestDate: l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-") : "",
          title: `${typeName} (${days} ${days === 1 ? "Day" : "Days"})`,
          category: typeName,
          amountOrDays: `${days.toFixed(1)} Days`,
          numericValue: days,
          periodOrDate: period,
          reason: l.reason || "No reason specified",
          status: status as any,
          approvedBy: l.approvedBy ? String(l.approvedBy) : undefined,
          approvedAt: l.approvedAt ? new Date(l.approvedAt).toLocaleDateString("en-GB").replace(/\//g, "-") : undefined,
          remarks: l.remarks,
          rejectionReason: l.rejectionReason,
        });
      });
    }

    // 2. Process Reimbursements
    if (reimbRes.success && Array.isArray(reimbRes.data)) {
      reimbRes.data.forEach((r: any) => {
        const status = (r.status || "PENDING").toUpperCase();
        const claimDateStr = r.claimDate ? new Date(r.claimDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "";
        const empName = r.user ? `${r.user.firstName} ${r.user.lastName || ""}`.trim() : `Employee #${r.userId}`;
        const amount = Number(r.totalAmount || 0);
        const typeName = r.reimbursementType || "Reimbursement";

        items.push({
          id: `reimb-${r.claimId}`,
          rawId: r.claimId,
          moduleType: "REIMBURSEMENT",
          employeeId: r.userId,
          employeeName: empName,
          requestDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-") : "",
          title: `${typeName} (₹${amount.toLocaleString("en-IN")})`,
          category: typeName,
          amountOrDays: `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          numericValue: amount,
          periodOrDate: claimDateStr || "N/A",
          reason: r.description || "No description provided",
          status: status as any,
          approvedBy: r.approvedBy ? String(r.approvedBy) : undefined,
          approvedAt: r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-GB").replace(/\//g, "-") : undefined,
          remarks: r.remarks,
          rejectionReason: r.rejectionReason,
          bills: r.bills || [],
        });
      });
    }

    // 3. Process Attendance Requests
    if (attRes.success && Array.isArray(attRes.data)) {
      attRes.data.forEach((a: any) => {
        const status = (a.status || "PENDING").toUpperCase();
        const shiftDateStr = a.shiftDate ? new Date(a.shiftDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "";
        const empName = a.user ? `${a.user.firstName} ${a.user.lastName || ""}`.trim() : `Employee #${a.userId}`;
        
        const formatT = (t?: string) => {
          if (!t) return "--:--";
          try {
            return new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
          } catch {
            return "--:--";
          }
        };
        const timeRange = `${formatT(a.checkInTime)} - ${formatT(a.checkOutTime)}`;
        const reasonLabels: Record<string, string> = {
          FORGOT_ID: "Forgot ID / Tech Issue",
          ON_DUTY: "On Duty / Client Visit",
          BUSINESS_TOUR: "Business Tour / Travel",
          NEW_JOINEE: "New Joinee Regularization",
          OTHERS: "Other Reason",
        };
        const reasonLabel = reasonLabels[a.reason] || a.reason || "Attendance Regularization";

        items.push({
          id: `attendance-${a.requestId}`,
          rawId: a.requestId,
          moduleType: "ATTENDANCE",
          employeeId: a.userId,
          employeeName: empName,
          requestDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-") : shiftDateStr,
          title: `Attendance: ${reasonLabel}`,
          category: "Attendance",
          amountOrDays: timeRange,
          numericValue: 1,
          periodOrDate: shiftDateStr || "N/A",
          reason: a.remarks || "No remarks provided",
          status: status as any,
          approvedBy: a.approvedBy ? String(a.approvedBy) : undefined,
          approvedAt: a.approvedAt ? new Date(a.approvedAt).toLocaleDateString("en-GB").replace(/\//g, "-") : undefined,
          remarks: a.remarks,
          rejectionReason: a.rejectionReason,
        });
      });
    }

    // Sort by latest request date / ID descending
    items.sort((a, b) => b.rawId - a.rawId);

    // Calculate dynamic stats
    const total = items.length;
    const pending = items.filter((i) => i.status === "PENDING" || i.status === "UNDER_REVIEW").length;
    const approved = items.filter((i) => i.status === "APPROVED" || i.status === "PAID").length;
    const rejected = items.filter((i) => i.status === "REJECTED" || i.status === "CANCELLED").length;
    const completed = approved + rejected;
    const leavesPending = items.filter((i) => i.moduleType === "LEAVE" && i.status === "PENDING").length;
    const reimbursementsPending = items.filter(
      (i) => i.moduleType === "REIMBURSEMENT" && (i.status === "PENDING" || i.status === "UNDER_REVIEW")
    ).length;
    const attendancePending = items.filter((i) => i.moduleType === "ATTENDANCE" && i.status === "PENDING").length;

    const stats: ApprovalStats = {
      total,
      pending,
      completed,
      approved,
      rejected,
      leavesPending,
      reimbursementsPending,
      attendancePending,
    };

    return { success: true, data: items, stats };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
        approved: 0,
        rejected: 0,
        leavesPending: 0,
        reimbursementsPending: 0,
        attendancePending: 0,
      },
      error: error.message || "Failed to fetch approvals",
    };
  }
};

/**
 * Update single approval status (Leave, Reimbursement, or Attendance)
 */
export const updateApprovalStatus = async (
  item: UnifiedApprovalItem,
  payload: ApprovalActionPayload
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const token = getAuthToken();
  const companyId = getCompanyIdCookie();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    if (item.moduleType === "LEAVE") {
      const url = companyId
        ? `${API_BASE_URL}/api/leave-requests/${item.rawId}/status?companyId=${companyId}`
        : `${API_BASE_URL}/api/leave-requests/${item.rawId}/status`;

      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status: payload.status,
          remarks: payload.remarks || undefined,
          rejectionReason: payload.rejectionReason || undefined,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        return { success: true, message: result.message || `Leave request ${payload.status.toLowerCase()} successfully` };
      }
      return { success: false, error: result.message || "Failed to update leave status" };
    } else if (item.moduleType === "ATTENDANCE") {
      const url = `${API_BASE_URL}/api/attendance-requests/${item.rawId}/status`;
      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status: payload.status,
          rejectionReason: payload.rejectionReason || undefined,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        return { success: true, message: result.message || `Attendance request ${payload.status.toLowerCase()} successfully` };
      }
      return { success: false, error: result.message || "Failed to update attendance request status" };
    } else {
      // Reimbursement Claim
      const url = companyId
        ? `${API_BASE_URL}/api/reimbursements/${item.rawId}/status?companyId=${companyId}`
        : `${API_BASE_URL}/api/reimbursements/${item.rawId}/status`;

      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status: payload.status,
          approvedAmount: payload.approvedAmount ?? (payload.status === "APPROVED" ? item.numericValue : undefined),
          remarks: payload.remarks || undefined,
          rejectionReason: payload.rejectionReason || undefined,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        return { success: true, message: result.message || `Reimbursement claim ${payload.status.toLowerCase()} successfully` };
      }
      return { success: false, error: result.message || "Failed to update reimbursement status" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Network error updating approval status" };
  }
};
