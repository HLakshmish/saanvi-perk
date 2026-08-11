import React from "react";
import { ChevronRight } from "lucide-react";
import { LeaveRequest } from "../types/leaves.types";

interface LeavesSummaryTabProps {
  onOpenCompOffModal: () => void;
  onOpenApplyLeaveModal: () => void;
  requests: LeaveRequest[];
}

export const LeavesSummaryTab: React.FC<LeavesSummaryTabProps> = ({
  onOpenCompOffModal,
  onOpenApplyLeaveModal,
  requests,
}) => {
  // SVG Donut Chart helper component
  const DonutChart = ({ percentage = 100 }: { percentage?: number }) => {
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
            stroke="#a855f7"
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Row with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#013e37] tracking-tight">
            Leave Summary
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Track your leave accruals, balances, and submitted requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCompOffModal}
            className="px-4 py-2 border border-[#013e37]/20 text-[#013e37] hover:bg-[#013e37]/5 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Add Comp Off Balance
          </button>
          <button
            onClick={onOpenApplyLeaveModal}
            className="px-5 py-2 bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer"
          >
            Apply Leave
          </button>
        </div>
      </div>

      {/* 3 Donut Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Leaves Accumulated */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <h3 className="text-xs font-bold text-slate-900 tracking-wide">
            Total Leaves Accumulated: <span className="text-slate-900 font-extrabold text-sm">12.00</span>
          </h3>
          <DonutChart percentage={100} />
          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2 text-[11px] font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
              <span className="truncate">C.COMPOFF</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Earned Leave</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span className="truncate">Loss of Pay</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">Sick Leave / Casu...</span>
              <span className="ml-auto font-extrabold text-slate-900">12</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Leaves Availed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <h3 className="text-xs font-bold text-slate-900 tracking-wide">
            Total Leaves Availed: <span className="text-slate-900 font-extrabold text-sm">3.00</span>
          </h3>
          <DonutChart percentage={25} />
          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2 text-[11px] font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
              <span className="truncate">C.COMPOFF</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Earned Leave</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span className="truncate">Loss of Pay</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">Sick Leave / Casu...</span>
              <span className="ml-auto font-extrabold text-slate-900">3</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Leaves Balance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <h3 className="text-xs font-bold text-slate-900 tracking-wide">
            Total Leaves Balance: <span className="text-slate-900 font-extrabold text-sm">9.00</span>
          </h3>
          <DonutChart percentage={75} />
          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2 text-[11px] font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
              <span className="truncate">C.COMPOFF</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Earned Leave</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span className="truncate">Loss of Pay</span>
              <span className="ml-auto font-extrabold text-slate-900">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">Sick Leave / Casu...</span>
              <span className="ml-auto font-extrabold text-slate-900">9</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">My Requests</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs sm:text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-900">
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">From - To</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors cursor-pointer group">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{req.requestDate}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{req.leaveType}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{req.fromDate} to {req.toDate}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{req.days}</td>
                  <td className="py-3.5 px-4 text-slate-600 truncate max-w-[220px]">{req.remarks}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
