"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const AttendanceView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("August");

  return (
    <div className="space-y-5">
      {/* Row 1: Log Attendance & Assigned Shift */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Log Attendance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Log Attendance</h2>
            <a
              href="#request-time-off"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Request Time Off
            </a>
          </div>

          <div className="flex-1 flex items-center justify-center py-8">
            <span className="text-sm font-medium text-gray-500">
              No CHECKIN/OUT Privileges
            </span>
          </div>
        </div>

        {/* Card 2: Assigned Shift */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between min-h-[220px]">
          <h2 className="text-base font-bold text-gray-900 mb-3">Assigned Shift</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
            {/* Today's Shift */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Today's Shift</span>
              <span className="text-sm font-bold text-gray-900 mt-1">
                09:00 AM - 06:00 PM
              </span>
              <span className="inline-block mt-3 w-max text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                General Shift
              </span>
            </div>

            {/* Tomorrow's Shift */}
            <div className="bg-white border border-gray-200 rounded-lg p-3.5 flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Tomorrow's Shift</span>
              <span className="text-sm font-bold text-gray-900 mt-1">
                09:00 AM - 06:00 PM
              </span>
              <span className="inline-block mt-3 w-max text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                General Shift
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-medium mt-3">
            Week Off: Saturday Sunday
          </p>
        </div>
      </div>

      {/* Row 2: Hours Summary & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 3: Hours Summary Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Hours Summary</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Me
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block" />
                My Team
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex-1 flex flex-col justify-end pt-4 pb-2">
            <div className="flex items-end h-48 border-b border-gray-200 relative pb-1">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[11px] text-gray-400">
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              {/* Bars Container */}
              <div className="ml-8 flex-1 grid grid-cols-6 items-end h-full gap-2 px-2">
                {/* Worked Column */}
                <div className="flex items-end justify-center gap-1.5 h-full">
                  <div className="w-3.5 sm:w-4 bg-blue-600 rounded-t-xs h-[95%]" title="Worked (Me): 9 hrs" />
                  <div className="w-3.5 sm:w-4 bg-gray-500 rounded-t-xs h-[55%]" title="Worked (My Team): 5 hrs" />
                </div>
                {/* Late In Column */}
                <div className="flex items-end justify-center h-full">
                  <div className="w-3.5 sm:w-4 h-0" />
                </div>
                {/* Early Out Column */}
                <div className="flex items-end justify-center h-full">
                  <div className="w-3.5 sm:w-4 h-0" />
                </div>
                {/* OT Column */}
                <div className="flex items-end justify-center h-full">
                  <div className="w-3.5 sm:w-4 h-0" />
                </div>
                {/* Short Column */}
                <div className="flex items-end justify-center h-full">
                  <div className="w-3.5 sm:w-4 h-0" />
                </div>
                {/* Permission Column */}
                <div className="flex items-end justify-center h-full">
                  <div className="w-3.5 sm:w-4 h-0" />
                </div>
              </div>
            </div>

            {/* X Axis Labels */}
            <div className="ml-8 grid grid-cols-6 text-center text-[11px] font-medium text-gray-500 pt-2">
              <span>Worked</span>
              <span>Late In</span>
              <span>Early Out</span>
              <span>OT</span>
              <span>Short</span>
              <span>Permission</span>
            </div>
          </div>
        </div>

        {/* Card 4: Calendar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Calender</h2>
            <button className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-gray-50 hover:bg-gray-100">
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          {/* Month Calendar Grid */}
          <div className="flex-1">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-700 py-2 border-b border-gray-100">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-700 py-2 gap-y-2">
              {/* Prev Month Days */}
              <span className="text-gray-300 py-1">26</span>
              <span className="text-gray-300 py-1">27</span>
              <span className="text-gray-300 py-1">28</span>
              <span className="text-gray-300 py-1">29</span>
              <span className="text-gray-300 py-1">30</span>
              <span className="text-gray-300 py-1">31</span>

              {/* August 01 */}
              <span className="flex items-center justify-center">
                <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium">01</span>
              </span>

              {/* August 02 */}
              <span className="flex items-center justify-center">
                <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium">02</span>
              </span>

              {/* August 03 (Present) */}
              <span className="flex items-center justify-center">
                <span className="text-emerald-600 font-bold py-1">03</span>
              </span>

              {/* August 04 (Absent / Today) */}
              <span className="flex items-center justify-center">
                <span className="text-red-500 font-bold py-1">04</span>
              </span>

              {/* August 05 .. 31 */}
              {Array.from({ length: 27 }, (_, i) => {
                const dayNum = String(i + 5).padStart(2, "0");
                return (
                  <span key={dayNum} className="py-1 text-gray-700">
                    {dayNum}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bottom Legend Bar */}
          <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50/80 rounded-lg p-2.5 flex flex-wrap items-center justify-around gap-2 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Present <span className="font-bold text-gray-800 ml-0.5">1</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Leave <span className="font-bold text-gray-800 ml-0.5">0</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              Absent <span className="font-bold text-gray-800 ml-0.5">1</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
              Week Off/Holiday <span className="font-bold text-gray-800 ml-0.5">2</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
