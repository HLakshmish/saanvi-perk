"use client";

import React from "react";
import { Users, UserCheck, CalendarOff, UserX } from "lucide-react";

interface EmployeeStatsProps {
  headcount?: number;
  atWork?: number;
  onLeave?: number;
  absent?: number;
}

export const EmployeeStatsWidget: React.FC<EmployeeStatsProps> = ({
  headcount = 38,
  atWork = 21,
  onLeave = 0,
  absent = 17,
}) => {
  const stats = [
    {
      label: "Headcount",
      value: headcount,
      icon: Users,
    },
    {
      label: "At Work",
      value: atWork,
      icon: UserCheck,
    },
    {
      label: "On Leave",
      value: onLeave,
      icon: CalendarOff,
    },
    {
      label: "Absent",
      value: absent,
      icon: UserX,
    },
  ];

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-sm transition-all duration-200 hover:border-[#4f39f6]/40 hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4f39f6]/10 flex items-center justify-center text-[#4f39f6] group-hover:bg-[#4f39f6] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
