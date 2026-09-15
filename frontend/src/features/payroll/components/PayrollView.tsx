"use client";

import React, { useState, useEffect } from "react";
import {
  Banknote,
  Calculator,
  Users,
  FileText,
  Sliders,
  Sparkles,
} from "lucide-react";
import { SalaryBreakupCalculator } from "./SalaryBreakupCalculator";
import { EmployeeSalaryList } from "./EmployeeSalaryList";
import { PayslipsView } from "./PayslipsView";
import { PayrollSettingsTab } from "./PayrollSettingsTab";
import { AssignSalaryModal } from "./AssignSalaryModal";

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
  const [activeTab, setActiveTab] = useState<"calculator" | "salaries" | "payslips" | "settings">(
    isEmployee ? "payslips" : "calculator"
  );

  // Modal state for assigning CTC directly from calculator
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignPrefillCtc, setAssignPrefillCtc] = useState<number | undefined>(undefined);
  const [assignPrefillIsAnnual, setAssignPrefillIsAnnual] = useState<boolean>(true);

  const handleAssignFromCalculator = (ctc: number, isAnnual: boolean) => {
    setAssignPrefillCtc(ctc);
    setAssignPrefillIsAnnual(isAnnual);
    setIsAssignModalOpen(true);
  };

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
              Indian statutory compensation, real-time CTC calculations, dynamic rates & payslips
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs Header */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
          {!isEmployee && (
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
          )}

          {!isEmployee && (
            <button
              onClick={() => setActiveTab("salaries")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "salaries"
                  ? "bg-brand-primary text-brand-btn-text font-bold shadow-2xs border border-brand-primary"
                  : "hover:text-brand-primary hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Employee Salaries</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("payslips")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "payslips"
                ? "bg-brand-primary text-brand-btn-text font-bold shadow-2xs border border-brand-primary"
                : "hover:text-brand-primary hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isEmployee ? "My Payslips" : "Monthly Payslips"}</span>
          </button>

          {!isEmployee && (
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
          )}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "calculator" && !isEmployee && (
        <SalaryBreakupCalculator
          onAssignToEmployee={handleAssignFromCalculator}
          onNavigateToSettings={() => setActiveTab("settings")}
        />
      )}

      {activeTab === "salaries" && !isEmployee && (
        <EmployeeSalaryList onOpenCalculator={() => setActiveTab("calculator")} />
      )}

      {activeTab === "payslips" && (
        <PayslipsView currentRole={currentRole} currentUserId={currentUserId} />
      )}

      {activeTab === "settings" && !isEmployee && <PayrollSettingsTab />}

      {/* Assign Salary Modal from Calculator Shortcut */}
      <AssignSalaryModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          setActiveTab("salaries");
        }}
        prefillCtc={assignPrefillCtc}
        prefillIsAnnual={assignPrefillIsAnnual}
      />
    </div>
  );
};
