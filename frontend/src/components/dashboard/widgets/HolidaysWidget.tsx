"use client";

import React from "react";
import { Holiday } from "@/types/dashboard";
import { CalendarDays } from "lucide-react";

interface HolidaysWidgetProps {
  holidays?: Holiday[];
}

export const HolidaysWidget: React.FC<HolidaysWidgetProps> = ({ holidays }) => {
  const defaultHolidays: Holiday[] = [
    { id: "1", date: "15", month: "August", day: "Friday", title: "Independence Day" },
    { id: "2", date: "5", month: "September", day: "Friday", title: "Shri Krishna Janmashtami" },
    { id: "3", date: "19", month: "September", day: "Friday", title: "Ganesh Chaturthi" },
  ];

  const list = holidays || defaultHolidays;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#4f39f6]/10 flex items-center justify-center">
          <CalendarDays className="w-3.5 h-3.5 text-[#4f39f6]" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Upcoming Holidays</h3>
          <p className="text-[10px] text-slate-400 font-medium">{list.length} upcoming this quarter</p>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-0.5">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-all duration-200 hover:border-[#4f39f6]/30 hover:bg-[#4f39f6]/5 group"
          >
            {/* Date Badge */}
            <div className="bg-[#4f39f6] text-white rounded-lg px-2.5 py-1.5 flex flex-col items-center justify-center min-w-[46px] shadow-2xs shrink-0">
              <span className="text-base font-extrabold leading-none">{item.date}</span>
              <span className="text-[8px] font-bold uppercase mt-0.5 opacity-90">
                {item.month.substring(0, 3)}
              </span>
            </div>

            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-[#4f39f6] transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.day}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
