"use client";

import React, { useState, useEffect } from "react";
import { Holiday } from "@/types/dashboard";
import { CalendarDays } from "lucide-react";
import { getHolidays } from "@/features/organization/api/calendar.api";

interface HolidaysWidgetProps {
  holidays?: Holiday[];
}

export const HolidaysWidget: React.FC<HolidaysWidgetProps> = ({ holidays: propsHolidays }) => {
  const [list, setList] = useState<Holiday[]>(propsHolidays || []);

  useEffect(() => {
    if (!propsHolidays) {
      fetchHolidays();
    }
  }, [propsHolidays]);

  const fetchHolidays = async () => {
    const res = await getHolidays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (res.success && res.data && res.data.length > 0) {
      // 1. Filter out past holidays (only keep today and future dates)
      const upcomingApiHolidays = res.data.filter(
        (h) => new Date(h.startDate).setHours(0, 0, 0, 0) >= today.getTime()
      );

      // 2. Sort ascending by start date
      upcomingApiHolidays.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      const mapped: Holiday[] = upcomingApiHolidays.map((h) => {
        const d = new Date(h.startDate);
        return {
          id: String(h.holidayId),
          date: String(d.getDate()),
          month: d.toLocaleString("en-US", { month: "long" }),
          day: d.toLocaleString("en-US", { weekday: "long" }),
          title: h.holidayName,
        };
      });

      setList(mapped);
    } else {
      setList([]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#4f39f6]/10 flex items-center justify-center">
          <CalendarDays className="w-3.5 h-3.5 text-[#4f39f6]" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Upcoming Holidays</h3>
          <p className="text-[10px] text-slate-400 font-medium">
            {list.length} upcoming {list.length === 1 ? "holiday" : "holidays"}
          </p>
        </div>
      </div>

      {/* Scrollable list with scroller flush to the right edge */}
      <div className="space-y-2 overflow-y-auto max-h-[220px] -mr-4 pr-4 pl-0.5">
        {list.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-all duration-200 hover:border-[#4f39f6]/30 hover:bg-[#4f39f6]/5 group mr-1.5"
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
        {list.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No upcoming holidays found.
          </div>
        )}
      </div>
    </div>
  );
};
