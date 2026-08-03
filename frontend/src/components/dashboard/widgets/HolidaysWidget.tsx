"use client";

import React from "react";
import { Holiday } from "@/types/dashboard";

interface HolidaysWidgetProps {
  holidays?: Holiday[];
}

export const HolidaysWidget: React.FC<HolidaysWidgetProps> = ({ holidays }) => {
  const defaultHolidays: Holiday[] = [
    { id: "1", date: "15", month: "August", day: "Saturday", title: "Independence Day" },
    { id: "2", date: "5", month: "September", day: "Saturday", title: "Shri Krishna Janmashtami" },
    { id: "3", date: "19", month: "September", day: "Saturday", title: "Ganesh Chaturthi" },
  ];

  const list = holidays || defaultHolidays;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col">
      <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
        Holidays
      </h3>
      <p className="text-xs text-gray-500 mb-4 font-medium">Upcoming Holidays:</p>

      <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            {/* Date Badge Left */}
            <div className="bg-purple-100/90 text-purple-950 px-4 py-2.5 flex flex-col items-center justify-center min-w-[70px]">
              <span className="text-lg font-extrabold leading-none">{item.date}</span>
              <span className="text-[10px] font-semibold uppercase">{item.month}</span>
            </div>
            {/* Event Description Right */}
            <div className="p-3 flex flex-col justify-center">
              <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                {item.day}
              </span>
              <span className="text-sm font-bold leading-tight mt-0.5">
                {item.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
