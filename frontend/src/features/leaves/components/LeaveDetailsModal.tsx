import React, { useState, useEffect } from "react";
import { X, Loader2, Calendar, User, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { fetchLeaveRequestById, deleteLeaveRequest } from "../api/leaves.api";
import { toast } from "sonner";

interface LeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequestId: string | number | null;
  employees: any[];
  leaveTypes: any[];
  isAdminOrSuperAdmin?: boolean;
  onDeleteSuccess?: () => void;
}

function getUserRoleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
  return match ? match[1] : null;
}

export const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
  isOpen,
  onClose,
  leaveRequestId,
  employees = [],
  leaveTypes = [],
  isAdminOrSuperAdmin,
  onDeleteSuccess,
}) => {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && leaveRequestId) {
      const getDetails = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
          const res = await fetchLeaveRequestById(leaveRequestId);
          if (res.success && res.data) {
            setDetails(res.data);
          } else {
            setErrorMsg(res.error || "Failed to load leave request details.");
          }
        } catch (err: any) {
          setErrorMsg(err.message || "An unexpected error occurred.");
        } finally {
          setIsLoading(false);
        }
      };
      getDetails();
    } else {
      setDetails(null);
    }
  }, [isOpen, leaveRequestId]);

  if (!isOpen) return null;

  // Resolve client-side mapping values using backend relations
  let employeeName = details ? `Employee ID: ${details.userId}` : "";
  if (details?.user) {
    employeeName = `${details.user.firstName} ${details.user.lastName || ""}`.trim();
  } else if (details) {
    const emp = employees.find((e) => String(e.id) === String(details.userId));
    if (emp) employeeName = emp.name;
  }

  let leaveTypeName = "Leave";
  let leaveTypeCode = "";
  if (details?.leaveType) {
    leaveTypeName = details.leaveType.leaveName;
    leaveTypeCode = details.leaveType.leaveCode;
  } else if (details) {
    const lt = leaveTypes.find((t) => Number(t.leaveTypeId) === Number(details.leaveTypeId));
    if (lt) {
      leaveTypeName = lt.leaveName;
      leaveTypeCode = lt.leaveCode;
    }
  }

  let processedByName = "System / Admin";
  if (details?.approvedUser) {
    processedByName = `${details.approvedUser.firstName} ${details.approvedUser.lastName || ""}`.trim();
  } else if (details?.approvedBy) {
    const approver = employees.find((e) => String(e.id) === String(details.approvedBy));
    processedByName = approver ? approver.name : `User ID: ${details.approvedBy}`;
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-rose-50 text-rose-700 border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200">
            Cancelled
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Pending Approval
          </span>
        );
    }
  };

  const userRole = getUserRoleCookie();
  const isUserAdminOrSuper = isAdminOrSuperAdmin !== undefined 
    ? isAdminOrSuperAdmin 
    : (userRole === "superadmin" || userRole === "admin");

  const handleDelete = async () => {
    if (!leaveRequestId) return;
    if (!confirm("Are you sure you want to cancel / delete this leave request?")) return;

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      const res = await deleteLeaveRequest(Number(leaveRequestId));
      if (res.success) {
        toast.success("Leave request cancelled successfully.");
        onDeleteSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to cancel leave request.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[520px] overflow-hidden flex flex-col relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:bg-slate-50 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-brand-primary tracking-tight">
            Leave Request Details
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Overview of the leave request.
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <span className="text-xs font-semibold">Retrieving details...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs text-center">
              {errorMsg}
            </div>
          ) : details ? (
            <div className="space-y-5">
              {/* Employee & Type */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Employee</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {employeeName}
                  </p>
                </div>
                <div>{getStatusBadge(details.status)}</div>
              </div>

              <hr className="border-slate-100" />

              {/* Leave Type & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">Leave Type</div>
                  <p className="text-xs font-bold text-slate-900">
                    {leaveTypeName} {leaveTypeCode ? `(${leaveTypeCode})` : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">Duration</div>
                  <p className="text-xs font-bold text-slate-900">
                    {details.numberOfDays} {details.numberOfDays === 1 ? "Day" : "Days"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">From Date</div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(details.fromDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">To Date</div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(details.toDate)}
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Reason */}
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-semibold">Reason / Description</div>
                <p className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
                  {details.reason || "No description provided."}
                </p>
              </div>

              {/* Approver / Rejection Section */}
              {(details.status === "APPROVED" || details.status === "REJECTED") && (
                <>
                  <hr className="border-slate-100" />
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/65">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Processed By</div>
                        <p className="text-xs font-bold text-slate-900">
                          {processedByName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Processed At</div>
                        <p className="text-xs font-bold text-slate-900">
                          {formatDate(details.approvedAt)}
                        </p>
                      </div>
                    </div>

                    {details.status === "REJECTED" && details.rejectionReason && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Rejection Reason</div>
                        <p className="text-xs font-bold text-rose-800 bg-rose-50/50 border border-rose-200/50 p-2.5 rounded-xl">
                          {details.rejectionReason}
                        </p>
                      </div>
                    )}

                    {details.remarks && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Approver Comments</div>
                        <p className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 p-2.5 rounded-xl">
                          {details.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Metadata */}
              <div className="text-[10px] text-slate-400 font-semibold text-right pt-2">
                Applied on: {formatDate(details.createdAt)}
              </div>
            </div>
          ) : (
            <div className="text-xs text-center text-slate-400 font-semibold">
              No leave request selected.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
          <div>
            {isUserAdminOrSuper && details?.status === "PENDING" && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Cancel Request</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
