"use client";

import React from "react";
import { UserCheck, Clock, CalendarCheck } from "lucide-react";

const probationEmployees = [
  { id: "1", name: "Deepak Kumar", endDate: "15 Aug 2026", daysLeft: 9, department: "Engineering" },
  { id: "2", name: "Priya Sharma", endDate: "28 Aug 2026", daysLeft: 22, department: "Marketing" },
];

export const EmployeeProbationsWidget: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#013e37]/15 shadow-2xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#013e37]/10 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-[#013e37]" />
          </div>
          <div>
            <h3 className="font-bold text-[#013e37] text-sm">Probations</h3>
            <p className="text-[11px] text-[#013e37]/65 font-medium">Ending soon</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#013e37] bg-[#013e37]/10 px-2.5 py-1 rounded-full border border-[#013e37]/20">
          {probationEmployees.length}
        </span>
      </div>

      {probationEmployees.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 min-h-[120px] text-center">
          <CalendarCheck className="w-6 h-6 mb-2 text-slate-300" />
          <span className="text-xs font-medium text-slate-500">
            No probations ending soon
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {probationEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:border-[#013e37]/30 hover:bg-[#013e37]/5 group"
            >
              <div className="w-9 h-9 rounded-full bg-[#013e37] text-[#ffefb3] flex items-center justify-center text-xs font-extrabold shrink-0 shadow-2xs">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-[#013e37] transition-colors">{emp.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{emp.department}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#013e37]">
                  <Clock className="w-3 h-3 text-[#013e37]" />
                  <span>{emp.daysLeft}d left</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{emp.endDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
