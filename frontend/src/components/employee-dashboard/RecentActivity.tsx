"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import { Expense } from "@/features/expenses/types/expenses.types";

interface RecentActivityProps {
  isCheckedIn: boolean;
  expenses: Expense[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  isCheckedIn,
  expenses,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[200px]">
      <div>
        <div className="flex items-center gap-2 mb-3.5">
          <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <h3 className="font-bold text-brand-primary text-xs sm:text-sm">Recent Activity</h3>
        </div>

        <div className="relative pl-3.5 border-l border-slate-100 space-y-3 text-left">
          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-brand-primary border-2 border-white absolute -left-[19px] top-1 shadow-2xs" />
            <p className="text-[11px] font-bold text-slate-800 leading-tight">Attendance Check In</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
              Logged check-in today {isCheckedIn ? "active" : "previously"}
            </p>
          </div>

          {expenses.length > 0 ? (
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white absolute -left-[20px] top-1 shadow-2xs" />
              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                Expense: ₹{expenses[0].amount}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                Claim {expenses[0].status.toLowerCase()} for {expenses[0].category}
              </p>
            </div>
          ) : (
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-slate-350 border-2 border-white absolute -left-[19px] top-1 shadow-2xs" />
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Portal Activated</p>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Personal dashboard loaded successfully</p>
            </div>
          )}

          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-amber-500 border-2 border-white absolute -left-[19px] top-1 shadow-2xs" />
            <p className="text-[11px] font-bold text-slate-800 leading-tight">Leave Balance Confirmed</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Annual allotment of sick & casual leaves verified</p>
          </div>
        </div>
      </div>

      <div className="text-[9px] font-semibold text-slate-400 italic text-right mt-3 select-none">
        Auto-synced with logs
      </div>
    </div>
  );
};
