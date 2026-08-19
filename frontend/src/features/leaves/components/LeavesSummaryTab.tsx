import React from "react";
import { ChevronRight } from "lucide-react";
import { LeaveRequest } from "../types/leaves.types";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface LeavesSummaryTabProps {
  onOpenCompOffModal: () => void;
  onOpenApplyLeaveModal: () => void;
  requests: LeaveRequest[];
  isAdminOrSuperAdmin?: boolean;
  onStatusUpdate?: (id: string, status: "APPROVED" | "REJECTED") => Promise<boolean>;
  onRowClick?: (id: string) => void;
  accumulatedSick?: number;
  accumulatedComp?: number;
  accumulatedEarned?: number;
  accumulatedLop?: number;
}

export const LeavesSummaryTab: React.FC<LeavesSummaryTabProps> = ({
  onOpenCompOffModal,
  onOpenApplyLeaveModal,
  requests,
  isAdminOrSuperAdmin = false,
  onStatusUpdate,
  onRowClick,
  accumulatedSick = 12.00,
  accumulatedComp = 0.00,
  accumulatedEarned = 0.00,
  accumulatedLop = 0.00,
}) => {
  // 1. Dynamic Balance Calculations
  const totalAccumulated = accumulatedSick + accumulatedComp + accumulatedEarned + accumulatedLop;

  let availedSick = 0;
  let availedComp = 0;
  let availedEarned = 0;
  let availedLop = 0;

  requests.forEach((req) => {
    if (req.status === "Approved") {
      const type = req.leaveType.toLowerCase();
      if (type.includes("sick") || type.includes("casual")) {
        availedSick += req.days;
      } else if (type.includes("comp")) {
        availedComp += req.days;
      } else if (type.includes("earned")) {
        availedEarned += req.days;
      } else if (type.includes("loss") || type.includes("lop")) {
        availedLop += req.days;
      }
    }
  });

  const totalAvailed = availedSick + availedComp + availedEarned + availedLop;

  const balanceSick = Math.max(0, accumulatedSick - availedSick);
  const balanceComp = Math.max(0, accumulatedComp - availedComp);
  const balanceEarned = Math.max(0, accumulatedEarned - availedEarned);
  const balanceLop = Math.max(0, accumulatedLop - availedLop);
  const totalBalance = balanceSick + balanceComp + balanceEarned + balanceLop;

  // Chart percentage helpers
  const availedPercentage = totalAccumulated > 0 ? Math.min(100, (totalAvailed / totalAccumulated) * 100) : 0;
  const balancePercentage = totalAccumulated > 0 ? Math.min(100, (totalBalance / totalAccumulated) * 100) : 0;

  // SVG Donut Chart helper component
  const DonutChart = ({ percentage = 100, color = "#a855f7" }: { percentage?: number; color?: string }) => {
    const size = 120;
    const strokeWidth = 14;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex justify-center my-3 relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>
    );
  };

  const getStatusStyles = (status: "Approved" | "Pending" | "Rejected" | "Cancelled") => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Cancelled":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Row with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-primary tracking-tight">
            Leave Summary
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Track your leave accruals, balances, and submitted requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCompOffModal}
            className="px-4 py-2 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Add Comp Off Balance
          </button>
          <button
            onClick={onOpenApplyLeaveModal}
            className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer"
          >
            Apply Leave
          </button>
        </div>
      </div>

      {/* 3 Donut Progress Cards Grid */}
      {!isAdminOrSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Leaves Accumulated */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Total Leaves Accumulated: <span className="text-slate-900 font-extrabold text-sm">{totalAccumulated.toFixed(2)}</span>
            </h3>
            <DonutChart percentage={100} color="#a855f7" />
            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                <span className="truncate">C.COMPOFF</span>
                <span className="ml-auto font-extrabold text-slate-900">{accumulatedComp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">Earned Leave</span>
                <span className="ml-auto font-extrabold text-slate-900">{accumulatedEarned}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                <span className="truncate">Loss of Pay</span>
                <span className="ml-auto font-extrabold text-slate-900">{accumulatedLop}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate">Sick Leave / Casu...</span>
                <span className="ml-auto font-extrabold text-slate-900">{accumulatedSick}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Leaves Availed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Total Leaves Availed: <span className="text-slate-900 font-extrabold text-sm">{totalAvailed.toFixed(2)}</span>
            </h3>
            <DonutChart percentage={availedPercentage} color="#f43f5e" />
            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                <span className="truncate">C.COMPOFF</span>
                <span className="ml-auto font-extrabold text-slate-900">{availedComp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">Earned Leave</span>
                <span className="ml-auto font-extrabold text-slate-900">{availedEarned}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                <span className="truncate">Loss of Pay</span>
                <span className="ml-auto font-extrabold text-slate-900">{availedLop}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate">Sick Leave / Casu...</span>
                <span className="ml-auto font-extrabold text-slate-900">{availedSick}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Leaves Balance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Total Leaves Balance: <span className="text-slate-900 font-extrabold text-sm">{totalBalance.toFixed(2)}</span>
            </h3>
            <DonutChart percentage={balancePercentage} color="#10b981" />
            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                <span className="truncate">C.COMPOFF</span>
                <span className="ml-auto font-extrabold text-slate-900">{balanceComp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">Earned Leave</span>
                <span className="ml-auto font-extrabold text-slate-900">{balanceEarned}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                <span className="truncate">Loss of Pay</span>
                <span className="ml-auto font-extrabold text-slate-900">{balanceLop}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate">Sick Leave / Casu...</span>
                <span className="ml-auto font-extrabold text-slate-900">{balanceSick}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">{isAdminOrSuperAdmin ? "Employee Requests" : "My Requests"}</h3>

        <TableContainer className="rounded-xl border-none shadow-none">
          <Table className="min-w-[700px]">
            <TableHeader>
              <tr>
                <TableHead>Request Date</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From - To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    No leave requests found. Click "Apply Leave" to submit your first request.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow
                    key={req.id}
                    onClick={() => onRowClick?.(req.id)}
                  >
                    <TableCell className="font-semibold text-slate-900">{req.requestDate}</TableCell>
                    <TableCell className="text-slate-700 font-medium">{req.leaveType}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{req.fromDate} to {req.toDate}</TableCell>
                    <TableCell className="font-bold text-slate-900">{req.days}</TableCell>
                    <TableCell className="text-slate-600 truncate max-w-[220px]" title={req.remarks}>{req.remarks}</TableCell>
                    <TableCell>
                      {isAdminOrSuperAdmin && req.status === "Pending" && onStatusUpdate ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onStatusUpdate(req.id, "APPROVED")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs cursor-pointer transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onStatusUpdate(req.id, "REJECTED")}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-2xs cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(req.status)}`}>
                          {req.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all inline-block" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 font-semibold">
          <span>Showing 1 to {requests.length} of {requests.length} entries</span>
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select className="border border-slate-300 rounded-lg px-2 py-1 bg-white text-xs font-bold text-slate-800 focus:outline-none">
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </div>
    </div>
  );
};
