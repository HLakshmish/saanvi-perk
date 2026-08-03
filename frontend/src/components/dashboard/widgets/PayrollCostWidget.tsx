"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PayrollCostWidget: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
          Payroll Cost
        </h3>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between bg-gray-100/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 mb-4">
        <button className="p-1 hover:bg-gray-200 rounded">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span>Mar 2026 - Aug 2026</span>
        <button className="p-1 hover:bg-gray-200 rounded">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* SVG Wave Chart Representation */}
      <div className="relative h-44 w-full flex items-end">
        <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="0" x2="300" y2="0" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="30" x2="300" y2="30" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="90" x2="300" y2="90" stroke="#f1f5f9" strokeWidth="1" />

          {/* Filled Area Curve */}
          <path
            d="M 10 90 Q 60 10, 80 15 T 150 90 Q 180 40, 200 45 T 290 90 L 290 100 L 10 100 Z"
            fill="url(#payrollGradient)"
          />

          {/* Stroke Line */}
          <path
            d="M 10 90 Q 60 10, 80 15 T 150 90 Q 180 40, 200 45 T 290 90"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* X Axis Labels */}
        <div className="absolute bottom-0 w-full flex justify-between text-[11px] font-medium text-gray-500 pt-2 border-t border-gray-100">
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
        </div>
      </div>
    </div>
  );
};
