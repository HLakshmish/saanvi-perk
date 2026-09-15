"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Building2,
  DollarSign,
  UserPlus,
  RefreshCw,
  Info,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PayrollSettings, SalaryBreakupResult } from "../types/payroll.types";
import { calculateSalaryBreakup, getPayrollSettings } from "../api/payroll.api";
import { snackbar as toast } from "@/components/ui/snackbar";

interface SalaryBreakupCalculatorProps {
  onAssignToEmployee?: (ctcAmount: number, isAnnual: boolean) => void;
  onNavigateToSettings?: () => void;
}

export const SalaryBreakupCalculator: React.FC<SalaryBreakupCalculatorProps> = ({
  onAssignToEmployee,
  onNavigateToSettings,
}) => {
  const [inputType, setInputType] = useState<"annual" | "monthly">("annual");
  // Default to 858,660 (the exact sample from the spreadsheet user provided!)
  const [inputValue, setInputValue] = useState<string>("858660");
  const [settings, setSettings] = useState<PayrollSettings | null>(null);
  const [calculationResult, setCalculationResult] = useState<SalaryBreakupResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick preset CTC values
  const presets = [
    { label: "₹3.6 LPA", annual: 360000 },
    { label: "₹6.0 LPA", annual: 600000 },
    { label: "₹8.58 LPA (Sample)", annual: 858660 },
    { label: "₹12.0 LPA", annual: 1200000 },
    { label: "₹18.0 LPA", annual: 1800000 },
    { label: "₹24.0 LPA", annual: 2400000 },
  ];

  // Load configured company settings
  useEffect(() => {
    let isMounted = true;
    getPayrollSettings().then((res) => {
      if (isMounted && res.success && res.data) {
        setSettings(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute calculation whenever input or settings change
  const computeBreakup = async (val: string, type: "annual" | "monthly") => {
    const num = parseFloat(val.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) {
      setCalculationResult(null);
      return;
    }

    setIsLoading(true);
    try {
      const payload = type === "annual" ? { annualCtc: num } : { monthlyCtc: num };
      const res = await calculateSalaryBreakup(payload);
      if (res.success && res.data) {
        setCalculationResult(res.data);
      } else {
        // Fallback local calculation
        const localResult = performLocalCalculation(num, type, settings);
        setCalculationResult(localResult);
      }
    } catch {
      const localResult = performLocalCalculation(num, type, settings);
      setCalculationResult(localResult);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    computeBreakup(inputValue, inputType);
  }, [inputValue, inputType, settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setInputValue(raw);
  };

  const handleSelectPreset = (annual: number) => {
    if (inputType === "annual") {
      setInputValue(annual.toString());
    } else {
      setInputValue(Math.round(annual / 12).toString());
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const monthly = calculationResult?.monthly;
  const annual = calculationResult?.annual;
  const rates = calculationResult?.ratesApplied || {
    basicPercentage: settings?.basicPercentage ?? 50,
    employeePfRate: settings?.employeePfRate ?? 12,
    employeeEsiRate: settings?.employeeEsiRate ?? 0.75,
    professionalTax: settings?.professionalTax ?? 200,
    employerPfRate: settings?.employerPfRate ?? 13,
    employerEsiRate: settings?.employerEsiRate ?? 3.25,
    gratuityRate: settings?.gratuityRate ?? 4.81,
    statutoryPfWageLimit: settings?.statutoryPfWageLimit ?? 15000,
    usePfWageCeiling: settings?.usePfWageCeiling ?? true,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Configuration Card */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-primary to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-primary-light text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dynamic Statutory Engine & CTC Modeler</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Salary Breakup Calculator
            </h2>
            <p className="text-sm text-slate-300">
              Real-time Indian statutory payroll simulator based on dynamic company CTC rates
              (Basic, EPF, ESI, PT, Employer contributions & Gratuity).
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToSettings && (
              <button
                onClick={onNavigateToSettings}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all backdrop-blur-sm border border-white/10 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-brand-primary-light" />
                <span>Configure Rates & %</span>
              </button>
            )}
            {onAssignToEmployee && monthly && (
              <button
                onClick={() =>
                  onAssignToEmployee(
                    inputType === "annual" ? Number(annual?.ctc || 0) : Number(monthly.ctc || 0),
                    inputType === "annual"
                  )
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-lg hover:shadow-amber-400/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign to Employee</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Controls Bar inside Hero */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Mode Switcher */}
          <div className="md:col-span-4 flex items-center bg-black/25 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                if (inputType !== "annual") {
                  setInputType("annual");
                  const currentM = parseFloat(inputValue) || 0;
                  setInputValue((currentM * 12).toString());
                }
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                inputType === "annual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Annual CTC (LPA)
            </button>
            <button
              onClick={() => {
                if (inputType !== "monthly") {
                  setInputType("monthly");
                  const currentA = parseFloat(inputValue) || 0;
                  setInputValue(Math.round(currentA / 12).toString());
                }
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                inputType === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Monthly CTC
            </button>
          </div>

          {/* Amount Input */}
          <div className="md:col-span-8 relative">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 font-bold text-lg">₹</span>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter CTC Amount..."
                className="w-full pl-9 pr-24 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-extrabold text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all backdrop-blur-md"
              />
              <span className="absolute right-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {inputType === "annual" ? "Per Year" : "Per Month"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick presets pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-300 mr-1">Quick Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPreset(p.annual)}
              className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/5 transition-all font-medium cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      {monthly && annual && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-brand-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cost to Company (CTC)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900">{formatCurrency(monthly.ctc)}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {formatCurrency(annual.ctc)} / year
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-brand-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gross Salary
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900">
                {formatCurrency(monthly.grossSalary)}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {formatCurrency(annual.grossSalary)} / year
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-brand-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Deductions
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-rose-600">
                {formatCurrency(monthly.totalDeductions)}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {formatCurrency(annual.totalDeductions)} / year (EPF + ESI + PT)
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Net Take-Home Salary
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white">
                {formatCurrency(monthly.netSalary)}
              </div>
              <div className="text-xs text-emerald-100 font-semibold mt-0.5">
                {formatCurrency(annual.netSalary)} / year
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The Master Excel Breakup Calculator Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Header Row */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base uppercase tracking-wider">
              Salary Breakup Calculator
            </h3>
            <span className="text-xs text-slate-400 font-medium ml-2 hidden md:inline">
              (Live rates dynamically configured per company policy)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              PF Ceiling: {rates.usePfWageCeiling ? `₹${rates.statutoryPfWageLimit.toLocaleString()}` : "Uncapped"}
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
              PT: ₹{rates.professionalTax}/mo
            </span>
          </div>
        </div>

        {monthly && annual ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase font-bold text-xs">
                  <th className="py-3.5 px-6 font-extrabold">Salary Components</th>
                  <th className="py-3.5 px-4 font-extrabold text-slate-500">Calculation Basis</th>
                  <th className="py-3.5 px-6 font-extrabold text-right">Monthly (Rs.)</th>
                  <th className="py-3.5 px-6 font-extrabold text-right">Annually (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. EARNINGS / GROSS SECTION */}
                <tr className="bg-slate-50/50">
                  <td colSpan={4} className="py-2.5 px-6 font-extrabold text-brand-primary uppercase text-xs tracking-wider">
                    A. Earnings / Gross Components
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    (A) Basic Pay + DA + RA
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-brand-primary">{rates.basicPercentage}%</span> of CTC
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.basicPay)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.basicPay)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    (B) HRA (House Rent Allowance)
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    Remaining Gross Balance
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.hra)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.hra)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    (C) Other Allowances
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    Flexible Benefits / Other
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.otherAllowances)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.otherAllowances)}
                  </td>
                </tr>

                <tr className="bg-indigo-50/60 font-bold border-t-2 border-indigo-200">
                  <td className="py-3 px-6 text-indigo-950 font-extrabold uppercase tracking-wide">
                    Gross Salary
                  </td>
                  <td className="py-3 px-4 text-indigo-700 font-semibold text-xs">
                    (A + B + C)
                  </td>
                  <td className="py-3 px-6 text-right text-indigo-950 font-extrabold text-base">
                    {formatCurrency(monthly.grossSalary)}
                  </td>
                  <td className="py-3 px-6 text-right text-indigo-950 font-extrabold text-base">
                    {formatCurrency(annual.grossSalary)}
                  </td>
                </tr>

                {/* 2. EMPLOYEE DEDUCTIONS SECTION */}
                <tr className="bg-slate-50/50">
                  <td colSpan={4} className="py-2.5 px-6 font-extrabold text-rose-700 uppercase text-xs tracking-wider">
                    B. Deductions (Employee Share)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    EPF Contribution by employee (on Basic Pay)
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-rose-700">{rates.employeePfRate}%</span>{" "}
                    {rates.usePfWageCeiling && "(Capped at ₹15k wage)"}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.employeePf)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.employeePf)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    ESI Contribution by employee (on Basic Pay)
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-rose-700">{rates.employeeEsiRate}%</span> on Basic Pay
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.employeeEsi)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.employeeEsi)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    Professional Tax (PT)
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    State Statutory PT
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.professionalTax)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.professionalTax)}
                  </td>
                </tr>

                <tr className="bg-rose-50/60 font-bold border-t-2 border-rose-200">
                  <td className="py-3 px-6 text-rose-950 font-extrabold uppercase tracking-wide">
                    Total Deductions
                  </td>
                  <td className="py-3 px-4 text-rose-700 font-semibold text-xs">
                    (EPF + ESI + PT)
                  </td>
                  <td className="py-3 px-6 text-right text-rose-950 font-extrabold text-base">
                    {formatCurrency(monthly.totalDeductions)}
                  </td>
                  <td className="py-3 px-6 text-right text-rose-950 font-extrabold text-base">
                    {formatCurrency(annual.totalDeductions)}
                  </td>
                </tr>

                {/* 3. NET SALARY TAKE-HOME */}
                <tr className="bg-emerald-100/70 border-y-2 border-emerald-300">
                  <td className="py-4 px-6 text-emerald-950 font-black uppercase tracking-wider text-sm sm:text-base">
                    Net Salary
                  </td>
                  <td className="py-4 px-4 text-emerald-800 font-bold text-xs">
                    Gross Salary - Total Deductions
                  </td>
                  <td className="py-4 px-6 text-right text-emerald-950 font-black text-lg sm:text-xl">
                    {formatCurrency(monthly.netSalary)}
                  </td>
                  <td className="py-4 px-6 text-right text-emerald-950 font-black text-lg sm:text-xl">
                    {formatCurrency(annual.netSalary)}
                  </td>
                </tr>

                {/* 4. EMPLOYER CONTRIBUTIONS SECTION */}
                <tr className="bg-slate-50/50">
                  <td colSpan={4} className="py-2.5 px-6 font-extrabold text-blue-700 uppercase text-xs tracking-wider">
                    C. Employer&apos;s Contribution
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    Employer PF contribution (with admin charges)
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-blue-700">{rates.employerPfRate}%</span>{" "}
                    {rates.usePfWageCeiling && "(Capped at ₹15k wage)"}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.employerPf)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.employerPf)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    Employer ESI contribution
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-blue-700">{rates.employerEsiRate}%</span> on Basic Pay
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.employerEsi)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.employerEsi)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-800">
                    Gratuity Amount
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-blue-700">{rates.gratuityRate}%</span> on Basic Pay (15/26 days/yr)
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(monthly.gratuity)}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-800">
                    {formatCurrency(annual.gratuity)}
                  </td>
                </tr>

                <tr className="bg-blue-50/60 font-bold border-t-2 border-blue-200">
                  <td className="py-3 px-6 text-blue-950 font-extrabold uppercase tracking-wide">
                    Total Employer Contribution
                  </td>
                  <td className="py-3 px-4 text-blue-700 font-semibold text-xs">
                    (PF + ESI + Gratuity)
                  </td>
                  <td className="py-3 px-6 text-right text-blue-950 font-extrabold text-base">
                    {formatCurrency(monthly.totalEmployerContribution)}
                  </td>
                  <td className="py-3 px-6 text-right text-blue-950 font-extrabold text-base">
                    {formatCurrency(annual.totalEmployerContribution)}
                  </td>
                </tr>

                {/* 5. FINAL COST TO COMPANY (CTC) */}
                <tr className="bg-slate-900 text-white font-black border-t-2 border-slate-900">
                  <td className="py-4 px-6 uppercase tracking-wider text-sm sm:text-base text-amber-300">
                    Cost to Company (CTC)
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-medium text-xs">
                    Gross Salary + Total Employer Contribution
                  </td>
                  <td className="py-4 px-6 text-right font-black text-lg sm:text-xl text-amber-300">
                    {formatCurrency(monthly.ctc)}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-lg sm:text-xl text-amber-300">
                    {formatCurrency(annual.ctc)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 font-medium">
            <Calculator className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            Please enter a valid CTC amount to view the salary breakup.
          </div>
        )}

        {/* Footer Notes & Statutory Clarity */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              All deductions are calculated as per statutory Indian labor regulations & company rates.
              Basic Pay + DA + RA defaults to {rates.basicPercentage}% of CTC.
            </span>
          </div>
          {onAssignToEmployee && monthly && (
            <button
              onClick={() =>
                onAssignToEmployee(
                  inputType === "annual" ? Number(annual?.ctc || 0) : Number(monthly.ctc || 0),
                  inputType === "annual"
                )
              }
              className="inline-flex items-center gap-1.5 font-bold text-brand-primary hover:text-brand-primary/80 transition-colors cursor-pointer"
            >
              <span>Assign This Structure to an Employee</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Pure local calculation function for offline/fallback speed
function performLocalCalculation(
  amount: number,
  type: "annual" | "monthly",
  settings: PayrollSettings | null
): SalaryBreakupResult {
  const basicPct = settings?.basicPercentage ?? 50.0;
  const epfRate = settings?.employeePfRate ?? 12.0;
  const esiRate = settings?.employeeEsiRate ?? 0.75;
  const ptVal = settings?.professionalTax ?? 200.0;
  const emPfRate = settings?.employerPfRate ?? 13.0;
  const emEsiRate = settings?.employerEsiRate ?? 3.25;
  const gratRate = settings?.gratuityRate ?? 4.81;
  const statutoryPfCap = settings?.statutoryPfWageLimit ?? 15000.0;
  const usePfCeiling = settings?.usePfWageCeiling ?? true;

  const mCtc = type === "annual" ? Math.round((amount / 12) * 100) / 100 : amount;
  const aCtc = type === "annual" ? amount : Math.round(amount * 12 * 100) / 100;

  const basicMonthly = Math.round(mCtc * (basicPct / 100) * 100) / 100;
  const pfWage = usePfCeiling ? Math.min(basicMonthly, statutoryPfCap) : basicMonthly;

  const employerPfMonthly = Math.round(pfWage * (emPfRate / 100));
  const employerEsiMonthly = Math.round(basicMonthly * (emEsiRate / 100));
  const gratuityMonthly = Math.round(basicMonthly * (gratRate / 100));
  const totalEmployer = employerPfMonthly + employerEsiMonthly + gratuityMonthly;

  const grossMonthly = Math.round((mCtc - totalEmployer) * 100) / 100;
  const remainingGross = Math.max(0, grossMonthly - basicMonthly);
  const hraMonthly = Math.round((remainingGross / 2) * 100) / 100;
  const otherMonthly = Math.round((remainingGross - hraMonthly) * 100) / 100;

  const employeePfMonthly = Math.round(pfWage * (epfRate / 100));
  const employeeEsiMonthly = Math.round(basicMonthly * (esiRate / 100));
  const ptMonthly = ptVal;
  const totalDeductionsMonthly = employeePfMonthly + employeeEsiMonthly + ptMonthly;

  const netMonthly = Math.round((grossMonthly - totalDeductionsMonthly) * 100) / 100;

  return {
    ratesApplied: {
      basicPercentage: basicPct,
      employeePfRate: epfRate,
      employeeEsiRate: esiRate,
      professionalTax: ptVal,
      employerPfRate: emPfRate,
      employerEsiRate: emEsiRate,
      gratuityRate: gratRate,
      statutoryPfWageLimit: statutoryPfCap,
      usePfWageCeiling: usePfCeiling,
    },
    monthly: {
      ctc: mCtc,
      grossSalary: grossMonthly,
      basicPay: basicMonthly,
      hra: hraMonthly,
      otherAllowances: otherMonthly,
      employeePf: employeePfMonthly,
      employeeEsi: employeeEsiMonthly,
      professionalTax: ptMonthly,
      totalDeductions: totalDeductionsMonthly,
      netSalary: netMonthly,
      employerPf: employerPfMonthly,
      employerEsi: employerEsiMonthly,
      gratuity: gratuityMonthly,
      totalEmployerContribution: totalEmployer,
    },
    annual: {
      ctc: aCtc,
      grossSalary: Math.round(grossMonthly * 12),
      basicPay: Math.round(basicMonthly * 12),
      hra: Math.round(hraMonthly * 12),
      otherAllowances: Math.round(otherMonthly * 12),
      employeePf: Math.round(employeePfMonthly * 12),
      employeeEsi: Math.round(employeeEsiMonthly * 12),
      professionalTax: Math.round(ptMonthly * 12),
      totalDeductions: Math.round(totalDeductionsMonthly * 12),
      netSalary: Math.round(netMonthly * 12),
      employerPf: Math.round(employerPfMonthly * 12),
      employerEsi: Math.round(employerEsiMonthly * 12),
      gratuity: Math.round(gratuityMonthly * 12),
      totalEmployerContribution: Math.round(totalEmployer * 12),
    },
  };
}
