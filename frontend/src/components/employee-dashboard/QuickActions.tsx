"use client";

import React from "react";
import { User, ClipboardList, Receipt, Clock, ChevronRight } from "lucide-react";

interface QuickActionsProps {
  onViewProfile: () => void;
  onApplyLeave: () => void;
  onSubmitExpense: () => void;
  onViewAttendance: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onViewProfile,
  onApplyLeave,
  onSubmitExpense,
  onViewAttendance,
}) => {
  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-2xs">
      <h3 className="font-bold text-[#013e37] text-xs sm:text-sm mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={onViewProfile}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#013e37]/35 hover:bg-[#013e37]/5 transition-all text-left font-bold text-xs text-slate-800 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#013e37]/10 flex items-center justify-center text-[#013e37]">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>View Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onApplyLeave}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#013e37]/35 hover:bg-[#013e37]/5 transition-all text-left font-bold text-xs text-slate-800 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#013e37]/10 flex items-center justify-center text-[#013e37]">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
            <span>Apply Leave</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onSubmitExpense}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#013e37]/35 hover:bg-[#013e37]/5 transition-all text-left font-bold text-xs text-slate-800 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#013e37]/10 flex items-center justify-center text-[#013e37]">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <span>Submit Expense</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onViewAttendance}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#013e37]/35 hover:bg-[#013e37]/5 transition-all text-left font-bold text-xs text-slate-800 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#013e37]/10 flex items-center justify-center text-[#013e37]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>View Attendance</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
