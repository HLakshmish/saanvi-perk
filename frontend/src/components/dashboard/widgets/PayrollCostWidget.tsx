"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, IndianRupee } from "lucide-react";

export const PayrollCostWidget: React.FC = () => {
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const amounts = ["₹4.2L", "₹3.8L", "₹4.5L", "₹3.2L", "₹3.9L", "₹4.1L"];
  const [activePoint, setActivePoint] = useState<number | null>(5); // default last month

  // Exact coordinates matching the curve path
  const points = [
    { cx: 15, cy: 32, idx: 0 },
    { cx: 70, cy: 38, idx: 1 },
    { cx: 125, cy: 14, idx: 2 },
    { cx: 180, cy: 36, idx: 3 },
    { cx: 235, cy: 26, idx: 4 },
    { cx: 285, cy: 20, idx: 5 },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#4f39f6]/10 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 text-[#4f39f6]" />
            </div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Payroll Cost</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#4f39f6] bg-[#4f39f6]/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+8.2%</span>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="flex items-baseline gap-2 mb-2 ml-9">
          <span className="text-xl font-extrabold text-slate-900 leading-none">
            {activePoint !== null ? amounts[activePoint] : "₹23.7L"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {activePoint !== null ? `${months[activePoint]} 2026 Spent` : "Total 6-month Cost"}
          </span>
        </div>

        {/* Date Range Controls */}
        <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 mb-2 border border-slate-100">
          <button className="p-0.5 hover:bg-slate-200/60 rounded transition-colors cursor-pointer">
            <ChevronLeft className="w-3 h-3 text-slate-400" />
          </button>
          <span>Mar 2026 – Aug 2026</span>
          <button className="p-0.5 hover:bg-slate-200/60 rounded transition-colors cursor-pointer">
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* SVG Smooth Curved Area Trend Line */}
      <div className="w-full">
        <svg viewBox="0 0 300 65" className="w-full h-auto overflow-hidden">
          <defs>
            <linearGradient id="payrollSmoothGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f39f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f39f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1="10" y1="15" x2="290" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="10" y1="35" x2="290" y2="35" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="10" y1="55" x2="290" y2="55" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

          {/* Smooth Filled Area */}
          <path
            d="M 15,32 Q 42.5,44 70,38 T 125,14 T 180,36 T 235,26 T 285,20 L 285,60 L 15,60 Z"
            fill="url(#payrollSmoothGradient)"
          />

          {/* Smooth Curved Line Path */}
          <path
            d="M 15,32 Q 42.5,44 70,38 T 125,14 T 180,36 T 235,26 T 285,20"
            fill="none"
            stroke="#4f39f6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points / Circles */}
          {points.map((pt) => (
            <g key={pt.idx} className="cursor-pointer" onMouseEnter={() => setActivePoint(pt.idx)}>
              <circle
                cx={pt.cx}
                cy={pt.cy}
                r={activePoint === pt.idx ? "4.5" : "3"}
                className={`${
                  activePoint === pt.idx
                    ? "fill-[#4f39f6] stroke-white stroke-2"
                    : "fill-white stroke-[#4f39f6] stroke-2"
                } transition-all`}
              />
            </g>
          ))}
        </svg>

        {/* X Axis Month Labels */}
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100">
          {months.map((m, i) => (
            <span
              key={m}
              onClick={() => setActivePoint(i)}
              className={`cursor-pointer transition-colors ${
                activePoint === i ? "text-[#4f39f6] font-bold" : "hover:text-slate-600"
              }`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
