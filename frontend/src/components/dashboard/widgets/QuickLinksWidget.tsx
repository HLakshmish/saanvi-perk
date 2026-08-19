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
    <div className="bg-white p-4 rounded-xl border border-brand-primary/15 shadow-2xs flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <Link2 className="w-3.5 h-3.5 text-brand-primary" />
        </div>
        <h3 className="font-bold text-brand-primary text-xs sm:text-sm">Quick Links</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-brand-btn-text transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-750 group-hover:text-brand-primary flex-1 leading-tight transition-colors truncate">
                {link.label}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-brand-primary transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
