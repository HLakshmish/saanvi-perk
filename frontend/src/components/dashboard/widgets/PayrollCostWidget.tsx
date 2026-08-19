"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, IndianRupee, PieChart } from "lucide-react";

export const PayrollCostWidget: React.FC = () => {
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const amounts = ["₹4.2L", "₹3.8L", "₹4.5L", "₹3.2L", "₹3.9L", "₹4.1L"];
  const [activePoint, setActivePoint] = useState<number | null>(5);

  const points = [
    { cx: 15, cy: 32, idx: 0 },
    { cx: 70, cy: 38, idx: 1 },
    { cx: 125, cy: 14, idx: 2 },
    { cx: 180, cy: 36, idx: 3 },
    { cx: 235, cy: 26, idx: 4 },
    { cx: 285, cy: 20, idx: 5 },
  ];

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <IndianRupee className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Payroll Cost</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>+8.2%</span>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {activePoint !== null ? amounts[activePoint] : "₹23.7L"}
          </span>
          <span className="text-xs text-slate-400 font-bold">
            {activePoint !== null ? `${months[activePoint]} 2026 Spent` : "Total 6-month Cost"}
          </span>
        </div>
      </div>

      {/* SVG Smooth Curved Area Trend Line */}
      <div className="w-full">
        <svg viewBox="0 0 300 65" className="w-full h-auto overflow-hidden">
          <defs>
            <linearGradient id="payrollSmoothGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#012e29" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#012e29" stopOpacity="0.0" />
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
            stroke="#012e29"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((pt) => (
            <g key={pt.idx} className="cursor-pointer" onMouseEnter={() => setActivePoint(pt.idx)}>
              <circle
                cx={pt.cx}
                cy={pt.cy}
                r={activePoint === pt.idx ? "5" : "3.5"}
                className={`${
                  activePoint === pt.idx
                    ? "fill-[#012e29] stroke-white stroke-2"
                    : "fill-white stroke-[#012e29] stroke-2"
                } transition-all`}
              />
            </g>
          ))}
        </svg>

        {/* X Axis Month Labels */}
        <div className="flex justify-between text-[11px] font-extrabold text-slate-400 pt-2 border-t border-slate-100">
          {months.map((m, i) => (
            <span
              key={m}
              onClick={() => setActivePoint(i)}
              className={`cursor-pointer transition-colors ${
                activePoint === i ? "text-brand-primary font-black" : "hover:text-slate-700"
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
