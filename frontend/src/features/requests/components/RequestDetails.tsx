"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Calendar, FileText } from "lucide-react";

// API Helpers
import { fetchAttendanceRequests } from "@/features/attendance/api/attendance.api";
import { fetchLeaveRequests } from "@/features/leaves/api/leaves.api";
import { fetchReimbursementClaims, fetchReimbursementHistory, getCompanyIdCookie, getCurrentUserId } from "@/features/expenses/api/expenses.api";
import { getUserById } from "@/features/employees/api/employees.api";

interface RequestDetailsProps {
  requestId: string;
  onBack: () => void;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({
  requestId,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse source and database ID
  const dashIndex = requestId.indexOf("-");
  const source = dashIndex !== -1 ? requestId.substring(0, dashIndex) : "";
  const dbIdStr = dashIndex !== -1 ? requestId.substring(dashIndex + 1) : requestId;
  const dbId = parseInt(dbIdStr, 10);

  // Utility: Date formatter in DD-MMM-YYYY format (e.g., 11-Aug-2026)
  const formatDate = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      const day = String(d.getDate()).padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "—";
    }
  };

  // Utility: Localized INR amount formatter (e.g., ₹1,000 or ₹1,000.50)
  const formatAmount = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return "—";
    const num = Number(amount);
    if (isNaN(num)) return "—";
    const hasDecimal = num % 1 !== 0;
    return "₹" + num.toLocaleString("en-IN", {
      minimumFractionDigits: hasDecimal ? 2 : 0,
      maximumFractionDigits: 2,
    });
  };

  // Utility: Time formatter
  const formatTime = (timeStr: string | Date | null | undefined): string => {
    if (!timeStr) return "—";
    try {
      // Handles ISO dates or time strings
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) {
        // Fallback if it is a direct HH:MM:SS string
        return String(timeStr);
      }
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(timeStr);
    }
  };

  useEffect(() => {
    let active = true;

    const loadRequestDetails = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      setDetails(null);
      setUserProfile(null);
      setHistory([]);

      try {
        let fetchedDetails: any = null;
        let fetchedHistory: any[] = [];
        let userId: number | null = null;

        const companyId = getCompanyIdCookie();
        const userIdToken = getCurrentUserId();

        let userRole: string | null = null;
        if (typeof window !== "undefined") {
          userRole = document.cookie.match(/(?:^|; )user_role=([^;]*)/)?.[1] || localStorage.getItem("user_role");
        }
        const isAdminOrSuperAdmin = userRole === "admin" || userRole === "superadmin" || userRole === "owner";
        const filterUserId = isAdminOrSuperAdmin ? undefined : (userIdToken || undefined);

        if (source === "attendance") {
          const res = await fetchAttendanceRequests(filterUserId);
          if (res.success && Array.isArray(res.data)) {
            const matched = res.data.find((req: any) => req.requestId === dbId);
            if (matched) {
              fetchedDetails = matched;
              userId = matched.userId;
            } else {
              throw new Error("Attendance request not found.");
            }
          } else {
            throw new Error(res.message || "Failed to load attendance requests.");
          }
        } else if (source === "leave") {
          const res = await fetchLeaveRequests(filterUserId);
          if (res.success && Array.isArray(res.data)) {
            const matched = res.data.find((req: any) => req.leaveRequestId === dbId);
            if (matched) {
              fetchedDetails = matched;
              userId = matched.userId;
            } else {
              throw new Error("Leave request not found.");
            }
          } else {
            throw new Error(res.error || "Failed to load leave requests.");
          }
        } else if (source === "reimbursement") {
          const [listRes, historyRes] = await Promise.all([
            fetchReimbursementClaims(companyId || 0, filterUserId),
            fetchReimbursementHistory(dbId).catch(() => ({ success: false, data: [] }))
          ]);

          if (listRes.success && Array.isArray(listRes.data)) {
            const matchedClaim = listRes.data.find((c: any) => c.claimId === dbId);
            if (matchedClaim) {
              fetchedDetails = matchedClaim;
              userId = matchedClaim.userId;
            } else {
              throw new Error("Reimbursement claim not found.");
            }
          } else {
            throw new Error(listRes.message || "Failed to load reimbursement claims.");
          }

          if (historyRes.success && Array.isArray(historyRes.data)) {
            fetchedHistory = historyRes.data;
          }
        } else {
          throw new Error("Invalid request source type.");
        }

        if (!active) return;

        setDetails(fetchedDetails);
        setHistory(fetchedHistory);

        // Fetch user profile to resolve department and designation details
        if (userId) {
          const userRes = await getUserById(userId);
          if (active && userRes.success && userRes.data) {
            setUserProfile(userRes.data);
          }
        }
      } catch (err: any) {
        if (active) {
          setErrorMsg(err.message || "An unexpected error occurred loading details.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadRequestDetails();

    return () => {
      active = false;
    };
  }, [requestId, source, dbId]);

  // Status mapping UI helper
  const getStatusBadge = (statusStr: string | null | undefined) => {
    const s = String(statusStr || "PENDING").toUpperCase();
    if (s === "APPROVED" || s === "PAID") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-650 border border-slate-200">
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        Pending
      </span>
    );
  };

  // Render left panel based on source type
  const renderRequestDetails = () => {
    if (!details) return null;

    const empName = userProfile 
      ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim() 
      : details.user 
        ? `${details.user.firstName} ${details.user.lastName || ""}`.trim()
        : "—";

    const empCode = userProfile?.employeeCode || details.user?.employeeCode || "—";
    const deptName = userProfile?.department?.departmentName || "—";
    const desigName = userProfile?.roles?.[0]?.roleName || userProfile?.userRoles?.[0]?.role?.roleName || "—";

    return (
      <div className="border border-gray-200 rounded-xl p-5 sm:p-6 bg-white space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
            {source} Details
          </h3>
          <div>{getStatusBadge(details.status)}</div>
        </div>

        {/* Employee profile panel */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Employee Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Employee Code</span>
              <p className="text-gray-900 font-semibold mt-1">{empCode}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Employee Name</span>
              <p className="text-gray-900 font-semibold mt-1">{empName}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Department</span>
              <p className="text-gray-900 font-semibold mt-1">{deptName}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Designation</span>
              <p className="text-gray-900 font-semibold mt-1">{desigName}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Source-specific request panel */}
        {source === "attendance" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Attendance Correction Info
            </h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div>
                <span className="text-gray-400 font-medium">Shift Date</span>
                <p className="text-gray-900 font-semibold mt-1">{formatDate(details.shiftDate)}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Reason</span>
                <p className="text-gray-900 font-semibold mt-1 capitalize">{(details.reason || "—").replace("_", " ")}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Requested Check-In</span>
                <p className="text-gray-900 font-semibold mt-1">{formatTime(details.checkInTime)}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Requested Check-Out</span>
                <p className="text-gray-900 font-semibold mt-1">{formatTime(details.checkOutTime)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 font-medium">Remarks / Description</span>
                <p className="text-gray-900 font-semibold mt-1 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  {details.remarks || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {source === "leave" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Leave Request Info
            </h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div>
                <span className="text-gray-400 font-medium">Leave Type</span>
                <p className="text-gray-900 font-semibold mt-1">
                  {details.leaveType?.leaveName || "Leave"} {details.leaveType?.leaveCode ? `(${details.leaveType.leaveCode})` : ""}
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Duration</span>
                <p className="text-gray-900 font-semibold mt-1 font-mono">
                  {details.numberOfDays} {details.numberOfDays === 1 ? "day" : "days"}
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">From Date</span>
                <p className="text-gray-900 font-semibold mt-1">{formatDate(details.fromDate)}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">To Date</span>
                <p className="text-gray-900 font-semibold mt-1">{formatDate(details.toDate)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 font-medium">Reason for Leave</span>
                <p className="text-gray-900 font-semibold mt-1 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  {details.reason || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {source === "reimbursement" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Reimbursement Claim Info
            </h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div>
                <span className="text-gray-400 font-medium">Claim Number</span>
                <p className="text-gray-900 font-semibold mt-1 font-mono">{details.claimNumber || "—"}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Claim Category</span>
                <p className="text-gray-900 font-semibold mt-1">{details.reimbursementType || "—"}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Claim Date</span>
                <p className="text-gray-900 font-semibold mt-1">{formatDate(details.claimDate)}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Total Amount</span>
                <p className="text-gray-900 font-bold mt-1 text-sm text-brand-primary">
                  {formatAmount(details.totalAmount)}
                </p>
              </div>
              {details.approvedAmount !== null && details.approvedAmount !== undefined && (
                <div>
                  <span className="text-gray-400 font-medium">Approved Amount</span>
                  <p className="text-emerald-700 font-bold mt-1 text-sm">
                    {formatAmount(details.approvedAmount)}
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-gray-400 font-medium">Description / Details</span>
                <p className="text-gray-900 font-semibold mt-1 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  {details.description || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approver Rejection/Comments Alert Banner */}
        {details.rejectionReason && (
          <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-xl text-xs space-y-1">
            <span className="font-extrabold text-rose-800 uppercase tracking-wide">Rejection Reason</span>
            <p className="font-semibold text-rose-700">{details.rejectionReason}</p>
          </div>
        )}
      </div>
    );
  };

  // Render right panel timeline
  const renderTimeline = () => {
    if (!details) return null;

    // Reimbursement has dynamic history list from DB
    const hasValidHistory = source === "reimbursement" && history.length > 0 && history.some((h: any) => h && (h.action || h.actionDate || h.actionBy));

    if (hasValidHistory) {
      return (
        <div className="border border-gray-200 rounded-xl p-5 sm:p-6 bg-white space-y-6">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-gray-100 pb-2">
            Approval History Log
          </h3>
          <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {history.map((hist, idx) => {
              const date = hist.actionDate ? formatDate(hist.actionDate) : "—";
              let actor = "—";
              if (hist.user) {
                actor = `${hist.user.firstName || ""} ${hist.user.lastName || ""}`.trim() || "—";
              } else if (hist.actionBy) {
                actor = `User ID: ${hist.actionBy}`;
              }

              const actionName = hist.action 
                ? String(hist.action).replace(/_/g, " ") 
                : "—";

              return (
                <div key={hist.historyId || idx} className="flex gap-4 items-start relative pl-1 animate-in fade-in">
                  <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-btn-text flex items-center justify-center font-bold text-[9px] relative z-10 shrink-0 shadow-2xs border border-white">
                    {idx + 1}
                  </div>
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 capitalize">{actionName}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{date}</span>
                    </div>
                    <p className="text-gray-500 font-medium">Performed by: <span className="font-bold text-slate-700">{actor}</span></p>
                    {hist.remarks && (
                      <p className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-100/50 p-2 rounded-lg mt-1.5 italic">
                        "{hist.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Default Timeline fallback for Leave / Attendance Requests
    const isProcessed = details.status === "APPROVED" || details.status === "REJECTED";
    const approverName = details.approvedUser
      ? `${details.approvedUser.firstName} ${details.approvedUser.lastName || ""}`.trim()
      : details.approvedBy
        ? `User ID: ${details.approvedBy}`
        : "System / Admin";

    return (
      <div className="border border-gray-200 rounded-xl p-5 sm:p-6 bg-white space-y-6">
        <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-gray-100 pb-2">
          Approval Stages
        </h3>
        <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {/* Stage 1: Created */}
          <div className="flex gap-4 items-start relative pl-1">
            <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-btn-text flex items-center justify-center font-bold text-[9px] relative z-10 shrink-0 border border-white">
              1
            </div>
            <div className="space-y-0.5 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Submitted</span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {formatDate(details.createdAt || details.submittedAt)}
                </span>
              </div>
              <p className="text-gray-500 font-medium">Request created and queued for approval.</p>
            </div>
          </div>

          {/* Stage 2: Processing Status */}
          <div className="flex gap-4 items-start relative pl-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] relative z-10 shrink-0 border border-white ${
              isProcessed ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
            }`}>
              2
            </div>
            <div className="space-y-1 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  {isProcessed ? details.status : "Pending Action"}
                </span>
                {isProcessed && (
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {formatDate(details.approvedAt)}
                  </span>
                )}
              </div>
              <p className="text-gray-500 font-medium">
                {isProcessed 
                  ? `Processed by ${approverName}` 
                  : "Awaiting action from reporting manager/admin."
                }
              </p>
              {isProcessed && details.remarks && (
                <p className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg mt-1">
                  Comments: {details.remarks}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button and Section Title */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-all border border-gray-200 text-brand-primary cursor-pointer"
            title="Back to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-brand-primary">
            Request Detail View
          </h2>
        </div>

        {/* Conditional Layouts based on fetching states */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            <span className="text-xs font-semibold">Loading request history details...</span>
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Could Not Load Details</h3>
            <p className="text-xs font-semibold text-slate-500 bg-rose-50/50 p-3.5 border border-rose-100 rounded-xl">
              {errorMsg}
            </p>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-brand-primary text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              Back to Request History
            </button>
          </div>
        ) : (
          /* 2-Column Details Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Details Form */}
            {renderRequestDetails()}

            {/* Right Panel: Approval Timeline */}
            {renderTimeline()}
          </div>
        )}
      </div>
    </div>
  );
};

