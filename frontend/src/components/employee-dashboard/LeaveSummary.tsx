"use client";

import React from "react";
import { ChevronRight, Plus } from "lucide-react";

interface LeaveSummaryProps {
  onApplyLeave: () => void;
}

export const LeaveSummary: React.FC<LeaveSummaryProps> = ({ onApplyLeave }) => {
  return (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[250px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-brand-primary text-xs sm:text-sm">Leave Summary</h3>
          <button 
            onClick={onApplyLeave}
            className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer animate-in"
          >
            <span>View Leave</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2">
            <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">Available</p>
            <p className="text-base font-extrabold text-emerald-950 mt-1">12.0</p>
          </div>
          <div className="bg-[#f4fbf7] border border-brand-primary/10 rounded-xl p-2">
            <p className="text-[9px] text-brand-primary/80 font-bold uppercase tracking-wider">Used</p>
            <p className="text-base font-extrabold text-brand-primary mt-1">3.0</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pending</p>
            <p className="text-base font-extrabold text-slate-900 mt-1">0.0</p>
          </div>
        </div>

        <div className="space-y-1 text-[11px] font-semibold text-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">Sick / Casual Leave</span>
            </div>
            <span className="font-bold text-slate-900 shrink-0">9 Bal (12 Tot)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Earned Leaves</span>
            </div>
            <span className="font-bold text-slate-900 shrink-0">0 Bal</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
              <span className="truncate">Comp-Off Balance</span>
            </div>
            <span className="font-bold text-slate-900 shrink-0">0 Bal</span>
          </div>
        </div>
      </div>

      <button
        onClick={onApplyLeave}
        className="w-full mt-3 py-2 bg-brand-primary text-brand-btn-text hover:bg-brand-primary-hover text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Apply Leave</span>
      </button>
    </div>
  );
};
