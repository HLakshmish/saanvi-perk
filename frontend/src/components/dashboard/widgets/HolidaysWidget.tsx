"use client";

import React, { useState, useEffect } from "react";
import { Holiday } from "@/types/dashboard";
import { CalendarDays, Sparkles } from "lucide-react";
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
      const upcomingApiHolidays = res.data.filter(
        (h) => new Date(h.startDate).setHours(0, 0, 0, 0) >= today.getTime()
      );

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
    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <CalendarDays className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Upcoming Holidays</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Schedule</p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary-light border border-brand-primary/20 px-2.5 py-1 rounded-full">
            {list.length} Upcoming
          </span>
        </div>

        {/* Scrollable list */}
        <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
          {list.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 transition-all duration-200 hover:border-brand-primary/30 hover:bg-brand-primary-light/30 group cursor-pointer"
            >
              {/* Date Badge */}
              <div className="bg-brand-primary text-brand-btn-text rounded-xl px-3 py-2 flex flex-col items-center justify-center min-w-[50px] shadow-xs shrink-0 font-bold">
                <span className="text-lg font-black leading-none">{item.date}</span>
                <span className="text-[9px] font-extrabold uppercase mt-0.5 opacity-90 tracking-wider">
                  {item.month.substring(0, 3)}
                </span>
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate group-hover:text-brand-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.day}</p>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No upcoming holidays scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
