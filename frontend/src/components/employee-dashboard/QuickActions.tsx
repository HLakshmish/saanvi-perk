"use client";

import React from "react";
import {
  Clock,
  Umbrella,
  CalendarCheck,
  FileCheck,
  User,
  Laptop,
  Banknote,
  Receipt,
  ChevronRight,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onTabChange }) => {
  const services = [
    {
      id: "attendance",
      title: "Attendance",
      subtitle: "Punch Logs & Shifts",
      icon: Clock,  
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300",
      iconBg: "bg-emerald-600 text-white",
    },
    {
      id: "holidays-leaves",
      title: "Leaves",
      subtitle: "Apply & Balance",
      icon: Umbrella,
      bgClass: "bg-teal-50 text-teal-800 border-teal-100 hover:border-teal-300",
      iconBg: "bg-brand-primary text-brand-btn-text",
    },
    {
      id: "requests",
      title: "Requests",
      subtitle: "WFH & Permissions",
      icon: CalendarCheck,
      bgClass: "bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300",
      iconBg: "bg-purple-600 text-white",
    },
    {
      id: "approval",
      title: "Approvals",
      subtitle: "Review & Status",
      icon: FileCheck,
      bgClass: "bg-amber-50 text-amber-800 border-amber-100 hover:border-amber-300",
      iconBg: "bg-amber-600 text-white",
    },
    {
      id: "profile",
      title: "My Profile",
      subtitle: "HR, Bank & Docs",
      icon: User,
      bgClass: "bg-sky-50 text-sky-800 border-sky-100 hover:border-sky-300",
      iconBg: "bg-sky-600 text-white",
    },
    {
      id: "assets",
      title: "My Assets",
      subtitle: "Assigned Devices",
      icon: Laptop,
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300",
      iconBg: "bg-indigo-600 text-white",
    },
    {
      id: "payroll",
      title: "Payroll",
      subtitle: "Payslips & Salary",
      icon: Banknote,
      bgClass: "bg-emerald-50/70 text-emerald-800 border-emerald-100 hover:border-emerald-300",
      iconBg: "bg-emerald-700 text-white",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-brand-primary text-xs sm:text-sm tracking-tight">
              Quick Hub
            </h3>
          </div>
        </div>
      </div>

      {/* 3 or 4 Column Grid Layout (2 cols on mobile, 3 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="group relative flex flex-col p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-brand-primary/40 hover:shadow-md transition-all duration-200 text-left cursor-pointer active:scale-95 overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-2xs transition-transform duration-200 group-hover:scale-110 ${item.iconBg}`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-0.5">
                <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-brand-primary transition-colors leading-tight">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
