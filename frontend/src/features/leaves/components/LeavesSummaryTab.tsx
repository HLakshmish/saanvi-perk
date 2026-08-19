import React from "react";
import {
  ChevronRight,
  Heart,
  Clock,
  Award,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
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

  const availablePercentage = totalAccumulated > 0 ? (totalBalance / totalAccumulated) * 100 : 0;

  // Custom Ring Gauge for the Leave Wallet
  const LeaveWalletGauge = ({ percentage, value }: { percentage: number; value: number }) => {
    const size = 160;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        {/* Soft backlighting */}
        <div className="absolute w-28 h-28 bg-brand-primary/5 rounded-full blur-xl animate-pulse" />
        
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--brand-primary-light)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--brand-primary)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Labels inside circle */}
        <div className="absolute text-center flex flex-col justify-center items-center">
          <span className="text-3xl font-black text-brand-primary tracking-tight">
            {value.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Remaining
          </span>
        </div>
      </div>
    );
  };

  // Mini ring gauge for breakdown cards
  const MiniGauge = ({ percentage, color }: { percentage: number; color: string }) => {
    const size = 50;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[9px] font-extrabold text-slate-700">
          {Math.round(percentage)}%
        </span>
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

  // Data structure for the breakdown leave types
  const leaveBreakdown = [
    {
      name: "Sick Leave / Casual Leave",
      code: "SL+CL",
      available: balanceSick,
      used: availedSick,
      total: accumulatedSick,
      color: "#8b5cf6", // Purple
      icon: Heart,
    },
    {
      name: "Comp-off",
      code: "COFF",
      available: balanceComp,
      used: availedComp,
      total: accumulatedComp,
      color: "#0d9488", // Teal
      icon: Clock,
    },
    {
      name: "Earned Leave",
      code: "EL",
      available: balanceEarned,
      used: availedEarned,
      total: accumulatedEarned,
      color: "#10b981", // Emerald
      icon: Award,
    },
    {
      name: "Loss of Pay",
      code: "LOP",
      available: balanceLop,
      used: availedLop,
      total: accumulatedLop,
      color: "#f43f5e", // Rose
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Row with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-primary tracking-tight">
            Leave Summary
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Track your leave accruals, balances, and submitted requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenApplyLeaveModal}
            className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer"
          >
            Apply Leave
          </button>
        </div>
      </div>

      {/* Premium Leave Wallet Card */}
      {!isAdminOrSuperAdmin && (
        <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-8 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left/Main Column: Wallet Balance & Circular Ring Gauge */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-8">
              {/* Circular Gauge */}
              <div className="shrink-0">
                <LeaveWalletGauge percentage={availablePercentage} value={totalBalance} />
              </div>

              {/* Balance Details */}
              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary-light border border-brand-primary/10 text-brand-primary font-bold text-[10px] rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Leave Wallet Active</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  Your Available Leave Balance
                </h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  Currently, you have <span className="font-extrabold text-brand-primary">{totalBalance.toFixed(2)} days</span> left in your wallet, representing <span className="font-bold text-brand-primary">{availablePercentage.toFixed(1)}%</span> of your total <span className="font-bold text-slate-800">{totalAccumulated.toFixed(2)} accrued days</span>.
                </p>
              </div>
            </div>

            {/* Right Column: Statistics Grid separated by visual divider */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 lg:pl-8 flex flex-col gap-5 justify-center">
              
              {/* Stat 1: Total Accrued */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Accrued
                  </span>
                  <p className="text-lg font-black text-slate-800 leading-none mt-1">
                    {totalAccumulated.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Stat 2: Total Availed */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Used
                  </span>
                  <p className="text-lg font-black text-slate-800 leading-none mt-1">
                    {totalAvailed.toFixed(2)}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Leave Breakdown Section */}
      {!isAdminOrSuperAdmin && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
            Leave Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {leaveBreakdown.map((item) => {
              const Icon = item.icon;
              const hasAllocation = item.total > 0;
              const isFullyUsed = hasAllocation && item.available === 0;
              
              // Calculate percent of use
              const utilizationPercentage = hasAllocation 
                ? (item.available / item.total) * 100 
                : 0;

              return (
                <div
                  key={item.code}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-brand-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gap-4"
                >
                  {/* Card Top: Icon & Title */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                      {item.code}
                    </span>
                  </div>

                  {/* Card Middle: Available Balance & Circular Gauge */}
                  <div className="flex items-center justify-between my-1">
                    <div className="space-y-0.5">
                      <span className="text-2xl font-black text-slate-800 leading-none block">
                        {item.available.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Available
                      </span>
                    </div>

                    {/* Radial utilization gauge */}
                    {hasAllocation ? (
                      <MiniGauge percentage={utilizationPercentage} color={item.color} />
                    ) : (
                      <div className="w-[50px] h-[50px] rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-[9px] font-extrabold text-slate-400">
                        None
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Accrued vs Used totals */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Used {item.used.toFixed(1)}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Total {item.total.toFixed(1)}</span>
                  </div>

                  {/* State text tag */}
                  <div className="text-[9px] font-bold flex items-center gap-1.5 mt-0.5">
                    {!hasAllocation ? (
                      <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">No Allocation</span>
                    ) : isFullyUsed ? (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-rose-500" /> Fully Used
                      </span>
                    ) : item.used > 0 ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Partially Used</span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Full Available</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-brand-primary">{isAdminOrSuperAdmin ? "Employee Requests" : "My Requests"}</h3>

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
