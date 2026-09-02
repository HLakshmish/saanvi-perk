"use client";

import React from "react";
import { Link2, ClipboardList, CalendarDays, UserPlus, Receipt, FileText, ChevronRight, Zap } from "lucide-react";

interface QuickLinksWidgetProps {
  onTabChange?: (tab: string) => void;
}

const quickLinks = [
  { label: "Apply Leave", icon: CalendarDays, tab: "holidays-leaves" },
  { label: "Submit Expense", icon: Receipt, tab: "expenses" },
  { label: "My Requests", icon: ClipboardList, tab: "requests" },
  { label: "View Payslip", icon: FileText, tab: "expenses" },
  { label: "Add Employee", icon: UserPlus, tab: "employees" },
  { label: "Directory", icon: Link2, tab: "employees" },
];

export const QuickLinksWidget: React.FC<QuickLinksWidgetProps> = ({ onTabChange }) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <Zap className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shortcuts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => onTabChange?.(link.tab)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-brand-primary/40 hover:bg-brand-primary-light/40 transition-all duration-200 group text-left cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-btn-text flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-800 group-hover:text-brand-primary flex-1 leading-tight transition-colors truncate">
                  {link.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
