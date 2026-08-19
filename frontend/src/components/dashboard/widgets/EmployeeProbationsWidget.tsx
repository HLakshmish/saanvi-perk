"use client";

import React from "react";
import { UserCheck, Clock, CalendarCheck, ShieldAlert } from "lucide-react";

const probationEmployees = [
  { id: "1", name: "Deepak Kumar", endDate: "15 Aug 2026", daysLeft: 9, department: "Engineering" },
  { id: "2", name: "Priya Sharma", endDate: "28 Aug 2026", daysLeft: 22, department: "Marketing" },
];

export const EmployeeProbationsWidget: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <UserCheck className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Probation Review</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Evaluation</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary-light border border-brand-primary/20 px-2.5 py-1 rounded-full">
            {probationEmployees.length} Ending Soon
          </span>
        </div>

        {probationEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-center">
            <CalendarCheck className="w-6 h-6 mb-2 text-slate-300" />
            <span className="text-xs font-semibold text-slate-500">
              No employee probations ending soon
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {probationEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 transition-all hover:border-brand-primary/40 hover:bg-brand-primary-light/30 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-primary transition-colors">{emp.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{emp.department}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5 text-amber-600" />
                    <span>{emp.daysLeft}d left</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{emp.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
