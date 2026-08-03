"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

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
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base flex items-center gap-1 cursor-pointer hover:text-blue-600">
          Employee Statistics <ChevronRight className="w-4 h-4 text-gray-500" />
        </h3>
      </div>

      <p className="text-xs text-gray-600 font-medium mb-4">
        Headcount: <span className="font-bold text-gray-900">{headcount}</span>
      </p>

      {/* Metric Rings / Doughnut Indicators */}
      <div className="space-y-3">
        {/* At Work */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-100 bg-purple-50/30">
          <div className="w-9 h-9 rounded-full border-4 border-blue-500 border-t-transparent flex items-center justify-center shrink-0" />
          <div className="flex-1 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-gray-700">At Work</span>
            <span className="font-bold text-gray-900">{atWork}</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
          <div className="w-9 h-9 rounded-full border-4 border-gray-300 flex items-center justify-center shrink-0" />
          <div className="flex-1 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-gray-700">On Leave</span>
            <span className="font-bold text-gray-900">{onLeave}</span>
          </div>
        </div>

        {/* Absent */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50/30">
          <div className="w-9 h-9 rounded-full border-4 border-rose-500 border-t-transparent flex items-center justify-center shrink-0" />
          <div className="flex-1 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-gray-700">Absent</span>
            <span className="font-bold text-gray-900">{absent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
