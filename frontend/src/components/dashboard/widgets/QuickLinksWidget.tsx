"use client";

import React from "react";
import { Link2, ClipboardList, CalendarDays, UserPlus, Receipt, FileText, ChevronRight } from "lucide-react";

const quickLinks = [
  { label: "Apply Leave", icon: CalendarDays },
  { label: "Submit Expense", icon: Receipt },
  { label: "My Requests", icon: ClipboardList },
  { label: "View Payslip", icon: FileText },
  { label: "Add Employee", icon: UserPlus },
  { label: "Directory", icon: Link2 },
];

export const QuickLinksWidget: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#4f39f6]/10 flex items-center justify-center">
          <Link2 className="w-3.5 h-3.5 text-[#4f39f6]" />
        </div>
        <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Quick Links</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-[#4f39f6]/30 hover:bg-[#4f39f6]/5 transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-[#4f39f6]/10 text-[#4f39f6] flex items-center justify-center shrink-0 group-hover:bg-[#4f39f6] group-hover:text-white transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-[#4f39f6] flex-1 leading-tight transition-colors truncate">
                {link.label}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#4f39f6] transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
