"use client";

import React, { useState } from "react";
import {
  Banknote,
  Calculator,
  Sliders,
} from "lucide-react";
import { SalaryBreakupCalculator } from "./SalaryBreakupCalculator";
import { PayrollSettingsTab } from "./PayrollSettingsTab";

interface PayrollViewProps {
  currentRole?: string;
  currentUserName?: string;
  currentUserId?: number;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  currentRole = "admin",
  currentUserName,
  currentUserId,
}) => {
  const isEmployee = currentRole === "employee";
  const [activeTab, setActiveTab] = useState<"calculator" | "settings">("calculator");

  if (isEmployee) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded-3xl p-6 text-center shadow-xs">
        <Banknote className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-sm font-extrabold text-slate-700">Access Restricted</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Payroll calculations and settings are only accessible by administrative personnel.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Header Row with Title & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-primary/15 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight">
              Payroll Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Indian statutory compensation, real-time CTC calculations & dynamic rates
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs Header */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-brand-primary text-brand-btn-text font-bold shadow-2xs border border-brand-primary"
                : "hover:text-brand-primary hover:bg-slate-100"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Salary Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-brand-primary text-brand-btn-text font-bold shadow-2xs border border-brand-primary"
                : "hover:text-brand-primary hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings & Rates</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "calculator" && (
        <SalaryBreakupCalculator
          onNavigateToSettings={() => setActiveTab("settings")}
        />
      )}

      {activeTab === "settings" && <PayrollSettingsTab />}
    </div>
  );
};

