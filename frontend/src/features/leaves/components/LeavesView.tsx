"use client";

import React, { useState, useEffect } from "react";
import { LeaveTab, LeaveRequest, ApplyLeaveInput, CompOffInput } from "../types/leaves.types";
import { LeavesSummaryTab } from "./LeavesSummaryTab";
import { LeavesRequestTab } from "./LeavesRequestTab";
import { LeavesHolidayTab } from "./LeavesHolidayTab";
import { RequestCompOffModal } from "./RequestCompOffModal";
import { ApplyLeaveModal } from "./ApplyLeaveModal";
import { RejectLeaveModal } from "./RejectLeaveModal";
import { LeaveDetailsModal } from "./LeaveDetailsModal";
import { fetchLeaveRequests, createLeaveRequest, getCurrentUserId, updateLeaveRequestStatus } from "../api/leaves.api";
import { fetchLeaveTypes, fetchLeavePolicies, fetchLeavePolicyRules, fetchLeavePolicyAccumulations, fetchLeaveAccumulations } from "@/features/settings/api/settings.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

function getUserRoleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
  return match ? match[1] : null;
}

export const LeavesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaveTab>("summary");
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic accumulated limits state
  const [accumulatedSick, setAccumulatedSick] = useState<number>(12.00);
  const [accumulatedComp, setAccumulatedComp] = useState<number>(0.00);
  const [accumulatedEarned, setAccumulatedEarned] = useState<number>(0.00);
  const [accumulatedLop, setAccumulatedLop] = useState<number>(0.00);

  // Detail & Rejection Modals State
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | number | null>(null);
  const [rejectLeaveId, setRejectLeaveId] = useState<string | number | null>(null);

  const userRole = getUserRoleCookie();
  const isAdminOrSuperAdmin = userRole === "superadmin" || userRole === "admin";

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterUserId = isAdminOrSuperAdmin ? undefined : (getCurrentUserId() || undefined);
      const currentUserId = getCurrentUserId();

      const [res, typesRes, empList, policiesRes, rulesRes, accsRes, empAccsRes] = await Promise.all([
        fetchLeaveRequests(filterUserId),
        fetchLeaveTypes(),
        getEmployees().catch(() => [] as Employee[]),
        fetchLeavePolicies().catch(() => ({ success: false, data: [] })),
        fetchLeavePolicyRules().catch(() => ({ success: false, data: [] })),
        fetchLeavePolicyAccumulations().catch(() => ({ success: false, data: [] })),
        fetchLeaveAccumulations().catch(() => ({ success: false, data: [] })),
      ]);

      const DEFAULT_LEAVE_TYPES = [
        { leaveTypeId: 1, leaveName: "Sick Leave/Casual Leave", leaveCode: "SL+CL", status: true },
        { leaveTypeId: 2, leaveName: "Earned Leave", leaveCode: "EL", status: true },
        { leaveTypeId: 3, leaveName: "Loss of Pay", leaveCode: "LOP", status: true },
        { leaveTypeId: 4, leaveName: "COMPOFF", leaveCode: "COFF", status: true },
      ];

      let resolvedTypes = [] as any[];
      if (typesRes.success && Array.isArray(typesRes.data) && typesRes.data.length > 0) {
        setLeaveTypes(typesRes.data);
        resolvedTypes = typesRes.data;
      } else {
        setLeaveTypes(DEFAULT_LEAVE_TYPES);
        resolvedTypes = DEFAULT_LEAVE_TYPES;
      }

      if (Array.isArray(empList)) {
        setEmployees(empList);
      }

      const userAllocations = empAccsRes.success && Array.isArray(empAccsRes.data)
        ? empAccsRes.data.filter((a: any) => Number(a.userId) === Number(currentUserId) && a.status)
        : [];

      // Calculate dynamic accumulations from user's allocations, or fall back to policies/rules config
      const activePolicies = (policiesRes.success && Array.isArray(policiesRes.data)) ? policiesRes.data.filter((p: any) => p.status) : [];
      const activeRules = rulesRes.success && Array.isArray(rulesRes.data)
        ? rulesRes.data.filter((r: any) => r.status && activePolicies.some((p: any) => p.leavePolicyId === r.leavePolicyId))
        : [];
      const activeAccs = accsRes.success && Array.isArray(accsRes.data)
        ? accsRes.data.filter((a: any) => a.status && activePolicies.some((p: any) => p.leavePolicyId === a.leavePolicyId))
        : [];

      let dynamicSick = 0;
      let dynamicComp = 0;
      let dynamicEarned = 0;
      let dynamicLop = 0;
      let hasAccumulations = userAllocations.length > 0;
      let hasRules = false;

      resolvedTypes.forEach((lt: any) => {
        const alloc = userAllocations.find((a: any) => Number(a.leaveTypeId) === Number(lt.leaveTypeId));
        
        let limit = 0;
        if (alloc) {
          limit = Number(alloc.numberOfLeaves);
        } else {
          const rule = activeRules.find((r: any) => Number(r.leaveTypeId) === Number(lt.leaveTypeId));
          const acc = activeAccs.find((a: any) => Number(a.leaveTypeId) === Number(lt.leaveTypeId));

          if (rule && rule.annualRequestLimit !== null) {
            limit = Number(rule.annualRequestLimit);
            hasRules = true;
          } else if (acc) {
            if (acc.maxAccumulationPerYear !== null) {
              limit = Number(acc.maxAccumulationPerYear);
              hasRules = true;
            } else if (acc.maxLeaveBalance !== null) {
              limit = Number(acc.maxLeaveBalance);
              hasRules = true;
            }
          }
        }

        const name = lt.leaveName.toLowerCase();
        const code = lt.leaveCode.toLowerCase();
        if (name.includes("sick") || name.includes("casual") || code.includes("sl") || code.includes("cl")) {
          dynamicSick += limit;
        } else if (name.includes("comp") || code.includes("comp")) {
          dynamicComp += limit;
        } else if (name.includes("earned") || code.includes("el")) {
          dynamicEarned += limit;
        } else if (name.includes("loss") || name.includes("lop") || code.includes("lop")) {
          dynamicLop += limit;
        }
      });

      if (hasAccumulations || hasRules) {
        setAccumulatedSick(dynamicSick);
        setAccumulatedComp(dynamicComp);
        setAccumulatedEarned(dynamicEarned);
        setAccumulatedLop(dynamicLop);
      } else {
        setAccumulatedSick(12.00);
        setAccumulatedComp(0.00);
        setAccumulatedEarned(0.00);
        setAccumulatedLop(0.00);
      }

      if (res.success && Array.isArray(res.data)) {
        // Map backend leave request structure to frontend LeaveRequest interface
        const mapped: LeaveRequest[] = res.data.map((item: any) => {
          // Format request date (dd-mm-yyyy)
          const reqDate = item.createdAt 
            ? new Date(item.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-") 
            : "";
          // Format fromDate & toDate (dd-mm-yyyy)
          const fromDateFmt = item.fromDate
            ? new Date(item.fromDate).toLocaleDateString("en-GB").replace(/\//g, "-")
            : "";
          const toDateFmt = item.toDate
            ? new Date(item.toDate).toLocaleDateString("en-GB").replace(/\//g, "-")
            : "";
          
          // Status mapping
          let statusText: "Approved" | "Pending" | "Rejected" | "Cancelled" = "Pending";
          const backendStatus = String(item.status).toUpperCase();
          if (backendStatus === "APPROVED") statusText = "Approved";
          else if (backendStatus === "REJECTED") statusText = "Rejected";
          else if (backendStatus === "CANCELLED") statusText = "Cancelled";

          // Find employee name using backend relation first, fallback to list search
          let empName = `Employee ID: ${item.userId}`;
          if (item.user) {
            empName = `${item.user.firstName} ${item.user.lastName || ""}`.trim();
          } else {
            const emp = empList.find((e: any) => String(e.id) === String(item.userId));
            if (emp) empName = emp.name;
          }

          // Find leave type using backend relation first, fallback to list search
          let leaveTypeName = "Leave";
          if (item.leaveType) {
            leaveTypeName = item.leaveType.leaveName;
          } else {
            const lt = resolvedTypes.find((t: any) => Number(t.leaveTypeId) === Number(item.leaveTypeId));
            if (lt) leaveTypeName = lt.leaveName;
          }

          // If admin, prepend employee name to leaveType to make it clear whose request it is
          const leaveTypeLabel = isAdminOrSuperAdmin
            ? `${empName}: ${leaveTypeName}`
            : leaveTypeName;

          return {
            id: String(item.leaveRequestId),
            requestDate: reqDate,
            leaveType: leaveTypeLabel,
            fromDate: fromDateFmt,
            toDate: toDateFmt,
            days: item.numberOfDays,
            remarks: item.reason,
            status: statusText,
          };
        });
        setRequests(mapped);
      } else {
        setError(res.error || "Failed to load leave requests.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [isAdminOrSuperAdmin]);

  const handleApplyLeaveSubmit = async (data: ApplyLeaveInput): Promise<boolean> => {
    try {
      const start = new Date(data.fromDate);
      const end = new Date(data.toDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const days = data.isHalfDay ? 0.5 : (isNaN(diffDays) ? 1 : diffDays);

      const userId = getCurrentUserId();
      const payload = {
        leaveTypeId: data.leaveTypeId,
        fromDate: new Date(data.fromDate).toISOString(),
        toDate: new Date(data.toDate).toISOString(),
        numberOfDays: days,
        reason: data.reason,
        userId: data.userId || userId || undefined,
      };

      const res = await createLeaveRequest(payload);
      if (res.success) {
        toast.success("Leave request submitted successfully!");
        await loadRequests();
        return true;
      } else {
        toast.error(res.error || "Failed to submit leave request.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during submission.");
      return false;
    }
  };

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED"): Promise<boolean> => {
    if (status === "REJECTED") {
      setRejectLeaveId(id);
      return true;
    }

    try {
      const res = await updateLeaveRequestStatus(id, status);
      if (res.success) {
        toast.success(`Leave request was successfully ${status.toLowerCase()}!`);
        await loadRequests();
        return true;
      } else {
        toast.error(res.error || "Failed to update leave request status.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while updating status.");
      return false;
    }
  };

  const handleRejectSubmit = async (reason: string, remarks: string): Promise<boolean> => {
    if (!rejectLeaveId) return false;
    try {
      const res = await updateLeaveRequestStatus(rejectLeaveId, "REJECTED", reason, remarks);
      if (res.success) {
        toast.success("Leave request was successfully rejected.");
        await loadRequests();
        return true;
      } else {
        toast.error(res.error || "Failed to reject leave request.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during rejection.");
      return false;
    }
  };

  const handleCompOffSubmit = (data: CompOffInput) => {
    toast.info("Comp-Off accrual request functionality is not supported by the backend yet.");
  };

  return (
    <div className="w-full space-y-6">
      {/* Upper Navigation Header Bar: Summary | Request | Holiday */}
      <div className="flex justify-end border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "summary"
                ? "bg-brand-primary text-brand-btn-text shadow-2xs border border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("request")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "request"
                ? "bg-brand-primary text-brand-btn-text shadow-2xs border border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab("holiday")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "holiday"
                ? "bg-brand-primary text-brand-btn-text shadow-2xs border border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
            }`}
          >
            Holiday
          </button>
        </div>
      </div>

      {/* Render Active Tab Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="text-xs font-bold">Loading leave data...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-rose-50/50 border border-rose-200 rounded-2xl text-center gap-3 animate-fade-in">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <div>
            <p className="font-bold text-rose-800 text-sm">Failed to Load Leave Data</p>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadRequests}
            className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {activeTab === "summary" && (
            <LeavesSummaryTab
              onOpenApplyLeaveModal={() => setIsApplyLeaveModalOpen(true)}
              requests={requests}
              isAdminOrSuperAdmin={isAdminOrSuperAdmin}
              onStatusUpdate={handleStatusUpdate}
              onRowClick={(id) => setSelectedLeaveId(id)}
              accumulatedSick={accumulatedSick}
              accumulatedComp={accumulatedComp}
              accumulatedEarned={accumulatedEarned}
              accumulatedLop={accumulatedLop}
            />
          )}

          {activeTab === "request" && (
            <LeavesRequestTab
              requests={requests}
              isAdminOrSuperAdmin={isAdminOrSuperAdmin}
              onStatusUpdate={handleStatusUpdate}
              onRowClick={(id) => setSelectedLeaveId(id)}
            />
          )}

          {activeTab === "holiday" && <LeavesHolidayTab />}
        </>
      )}



      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveModalOpen}
        onClose={() => setIsApplyLeaveModalOpen(false)}
        onSubmit={handleApplyLeaveSubmit}
        leaveTypes={leaveTypes}
        employees={employees}
      />

      {/* Leave Details Modal */}
      <LeaveDetailsModal
        isOpen={selectedLeaveId !== null}
        onClose={() => setSelectedLeaveId(null)}
        leaveRequestId={selectedLeaveId}
        employees={employees}
        leaveTypes={leaveTypes}
        onDeleteSuccess={loadRequests}
      />

      {/* Reject Leave Modal */}
      <RejectLeaveModal
        isOpen={rejectLeaveId !== null}
        onClose={() => setRejectLeaveId(null)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};
