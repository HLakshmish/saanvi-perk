"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowUpRight,
  Clock,
  Award,
  HelpCircle,
} from "lucide-react";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";
import {
  assignEmployeeSalary,
  calculateSalaryBreakup,
  getEmployeeSalaryStructure,
} from "../api/payroll.api";
import { SalaryBreakupResult, EmployeeSalaryStructure } from "../types/payroll.types";
import { snackbar as toast } from "@/components/ui/snackbar";

interface AssignSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillCtc?: number;
  prefillIsAnnual?: boolean;
  prefillUserId?: string | number;
  existingStructures?: EmployeeSalaryStructure[];
}

const HIKE_PRESETS = [5, 10, 15, 20, 25, 30];

const REVISION_REASONS = [
  { value: "ANNUAL_APPRAISAL", label: "Annual Appraisal Hike" },
  { value: "PERFORMANCE", label: "Performance Hike" },
  { value: "PROMOTION", label: "Promotion & Role Change" },
  { value: "PROBATION_CONFIRMATION", label: "Probation Confirmation" },
  { value: "MARKET_CORRECTION", label: "Market Adjustment" },
  { value: "INITIAL", label: "Initial Salary Assignment" },
  { value: "OTHER", label: "Other / Custom" },
];

export const AssignSalaryModal: React.FC<AssignSalaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefillCtc,
  prefillIsAnnual = true,
  prefillUserId,
  existingStructures,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentStructure, setCurrentStructure] = useState<EmployeeSalaryStructure | null>(null);

  // Assignment modes: 'hike' (percentage increment) vs 'direct' (raw CTC amount)
  const [assignmentMode, setAssignmentMode] = useState<"direct" | "hike">("direct");
  const [hikePercentage, setHikePercentage] = useState<string>("10");

  const [inputType, setInputType] = useState<"annual" | "monthly">("annual");
  const [ctcValue, setCtcValue] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [revisionType, setRevisionType] = useState<string>("ANNUAL_APPRAISAL");
  const [remarks, setRemarks] = useState<string>("");

  const [previewResult, setPreviewResult] = useState<SalaryBreakupResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingEmps, setIsLoadingEmps] = useState<boolean>(true);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState<boolean>(false);

  // Set initial effective date to 1st of current month and sync prefill user
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      setEffectiveDate(`${y}-${m}-01`);

      if (prefillUserId) {
        setSelectedUserId(String(prefillUserId));
      } else {
        setSelectedUserId("");
      }
      setRemarks("");
    }
  }, [isOpen, prefillUserId]);

  // Load employees list
  useEffect(() => {
    if (isOpen) {
      setIsLoadingEmps(true);
      getEmployees()
        .then((emps) => {
          setEmployees(emps);
          if (prefillUserId) {
            setSelectedUserId(String(prefillUserId));
          } else if (emps.length > 0) {
            setSelectedUserId((prev) => prev || emps[0].id);
          }
        })
        .catch(() => toast.show("Failed to load employee list", "error"))
        .finally(() => setIsLoadingEmps(false));
    }
  }, [isOpen, prefillUserId]);

  // When selected user changes, find or fetch their existing structure
  useEffect(() => {
    if (!selectedUserId || !isOpen) {
      setCurrentStructure(null);
      return;
    }

    const matched = existingStructures?.find(
      (s) => String(s.user_id) === String(selectedUserId)
    );

    if (matched) {
      setCurrentStructure(matched);
      const currAnnual = Number(matched.annual_ctc) || 0;
      if (currAnnual > 0 && !prefillCtc) {
        setAssignmentMode("hike");
        setRevisionType("ANNUAL_APPRAISAL");
      }
    } else {
      setIsLoadingCurrent(true);
      getEmployeeSalaryStructure(Number(selectedUserId))
        .then((res) => {
          if (res.success && res.data) {
            setCurrentStructure(res.data);
            const currAnnual = Number(res.data.annual_ctc) || 0;
            if (currAnnual > 0 && !prefillCtc) {
              setAssignmentMode("hike");
              setRevisionType("ANNUAL_APPRAISAL");
            }
          } else {
            setCurrentStructure(null);
            setAssignmentMode("direct");
            setRevisionType("INITIAL");
          }
        })
        .catch(() => {
          setCurrentStructure(null);
          setAssignmentMode("direct");
          setRevisionType("INITIAL");
        })
        .finally(() => setIsLoadingCurrent(false));
    }
  }, [selectedUserId, isOpen, existingStructures]);

  // Set prefill CTC if passed
  useEffect(() => {
    if (prefillCtc && prefillCtc > 0) {
      setInputType(prefillIsAnnual ? "annual" : "monthly");
      setCtcValue(prefillCtc.toString());
      setAssignmentMode("direct");
    } else if (currentStructure) {
      const currAnnual = Number(currentStructure.annual_ctc) || 0;
      if (assignmentMode === "hike" && currAnnual > 0) {
        const pct = parseFloat(hikePercentage) || 0;
        const newAnnual = Math.round(currAnnual * (1 + pct / 100));
        setInputType("annual");
        setCtcValue(newAnnual.toString());
      } else if (!ctcValue) {
        setCtcValue(currAnnual.toString());
      }
    } else if (!ctcValue) {
      setCtcValue("858660"); // Default spreadsheet sample
    }
  }, [prefillCtc, prefillIsAnnual, currentStructure, assignmentMode, hikePercentage]);

  // Recalculate when in hike mode
  const handleApplyHikePercent = (percent: number) => {
    setHikePercentage(percent.toString());
    const currAnnual = Number(currentStructure?.annual_ctc) || 0;
    if (currAnnual > 0) {
      const newAnnual = Math.round(currAnnual * (1 + percent / 100));
      setInputType("annual");
      setCtcValue(newAnnual.toString());
    }
  };

  // Update preview breakup
  useEffect(() => {
    const num = parseFloat(ctcValue.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) {
      setPreviewResult(null);
      return;
    }
    const payload = inputType === "annual" ? { annualCtc: num } : { monthlyCtc: num };
    calculateSalaryBreakup(payload).then((res) => {
      if (res.success && res.data) {
        setPreviewResult(res.data);
      }
    });
  }, [ctcValue, inputType]);

  if (!isOpen) return null;

  const currentAnnualCtc = Number(currentStructure?.annual_ctc) || 0;
  const currentMonthlyCtc = Number(currentStructure?.monthly_ctc) || 0;
  const targetAnnualCtc =
    inputType === "annual"
      ? parseFloat(ctcValue.replace(/,/g, "")) || 0
      : (parseFloat(ctcValue.replace(/,/g, "")) || 0) * 12;

  const hikeAmount = Math.max(0, targetAnnualCtc - currentAnnualCtc);
  const calculatedHikePercent =
    currentAnnualCtc > 0 && targetAnnualCtc > currentAnnualCtc
      ? Math.round(((targetAnnualCtc - currentAnnualCtc) / currentAnnualCtc) * 100 * 10) / 10
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userIdNum = parseInt(selectedUserId, 10);
    if (!userIdNum) {
      toast.show("Please select an employee", "error");
      return;
    }
    const num = parseFloat(ctcValue.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) {
      toast.show("Please enter a valid CTC amount", "error");
      return;
    }
    if (!effectiveDate) {
      toast.show("Please select when this salary/hike starts", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        userId: userIdNum,
        effectiveDate,
        revisionType,
        previousCtc: currentAnnualCtc,
        hikePercentage: calculatedHikePercent,
        remarks: remarks.trim() || undefined,
      };

      if (inputType === "annual") {
        payload.annualCtc = num;
      } else {
        payload.monthlyCtc = num;
      }

      const res = await assignEmployeeSalary(payload);
      if (res.success) {
        toast.show(
          calculatedHikePercent > 0
            ? `Salary hike of ${calculatedHikePercent}% assigned successfully starting ${effectiveDate}!`
            : "Salary structure assigned successfully!",
          "success"
        );
        onSuccess();
        onClose();
      } else {
        toast.show(res.error || "Failed to assign salary", "error");
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to assign salary", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null) return "₹0";
    const n = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(n)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(n));
  };

  const monthly = previewResult?.monthly;

  // Preset date shortcuts
  const handleSetQuickDate = (type: "this_month" | "next_month" | "today") => {
    const now = new Date();
    if (type === "today") {
      setEffectiveDate(now.toISOString().split("T")[0]);
    } else if (type === "this_month") {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      setEffectiveDate(`${y}-${m}-01`);
    } else if (type === "next_month") {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const y = nextMonth.getFullYear();
      const m = String(nextMonth.getMonth() + 1).padStart(2, "0");
      setEffectiveDate(`${y}-${m}-01`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentAnnualCtc > 0 ? "Revise Salary / Assign Hike" : "Assign Salary Structure (CTC)"}
              </h3>
              <p className="text-xs text-slate-500">
                Configure employee CTC with starting date, hike percentage & statutory rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Employee Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Employee <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white cursor-pointer"
                required
              >
                <option value="" disabled>
                  {isLoadingEmps ? "Loading employees..." : "-- Choose Employee --"}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode || `ID: ${emp.id}`}) — {emp.designation || "Employee"}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Compensation Card (if exists) */}
            {currentAnnualCtc > 0 && (
              <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/40 rounded-2xl p-3.5 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Current Active Compensation</span>
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    Effective since:{" "}
                    {currentStructure?.effective_date
                      ? new Date(currentStructure.effective_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Current"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    Annual CTC:{" "}
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(currentAnnualCtc)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Monthly CTC:{" "}
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(currentMonthlyCtc)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    In-Hand:{" "}
                    <span className="font-extrabold text-emerald-700">
                      {formatCurrency(currentStructure?.net_salary_monthly)} / mo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode Switcher: Salary Hike (%) vs Direct CTC */}
            {currentAnnualCtc > 0 && (
              <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAssignmentMode("hike");
                    handleApplyHikePercent(parseFloat(hikePercentage) || 10);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    assignmentMode === "hike"
                      ? "bg-white text-brand-primary shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Give Salary Hike (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentMode("direct")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    assignmentMode === "direct"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Direct CTC Amount</span>
                </button>
              </div>
            )}

            {/* If in Hike Mode: Hike Percentage Selector & Live Increment */}
            {assignmentMode === "hike" && currentAnnualCtc > 0 && (
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select or Enter Hike Percentage</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.5"
                      value={hikePercentage}
                      onChange={(e) => handleApplyHikePercent(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-xs font-black text-right border border-emerald-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="text-xs font-bold text-emerald-700">%</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {HIKE_PRESETS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleApplyHikePercent(pct)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        parseFloat(hikePercentage) === pct
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70"
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>

                {/* Computed Hike Breakdown Pill */}
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs font-semibold text-emerald-900">
                  <span>Hike Increase Amount:</span>
                  <span className="font-black text-emerald-700">
                    +{formatCurrency(hikeAmount)} / yr (+{formatCurrency(Math.round(hikeAmount / 12))} / mo)
                  </span>
                </div>
              </div>
            )}

            {/* Target Cost to Company (CTC) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>New Cost to Company (CTC)</span>
                  <span className="text-rose-500">*</span>
                  {calculatedHikePercent > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +{calculatedHikePercent}% Hike
                    </span>
                  )}
                </label>

                {/* Annual vs Monthly Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      if (inputType !== "annual") {
                        setInputType("annual");
                        const m = parseFloat(ctcValue) || 0;
                        setCtcValue((m * 12).toString());
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      inputType === "annual"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    Annual CTC
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (inputType !== "monthly") {
                        setInputType("monthly");
                        const a = parseFloat(ctcValue) || 0;
                        setCtcValue(Math.round(a / 12).toString());
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      inputType === "monthly"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    Monthly CTC
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="text"
                  value={ctcValue}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9.]/g, "");
                    setCtcValue(clean);
                    if (assignmentMode === "hike") {
                      setAssignmentMode("direct");
                    }
                  }}
                  placeholder="e.g. 858660"
                  className="w-full pl-8 pr-20 py-2.5 text-base font-extrabold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  required
                />
                <span className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400">
                  {inputType === "annual" ? "/ year" : "/ month"}
                </span>
              </div>
            </div>

            {/* When This Starts (Effective Date) - KEY REQUIREMENT */}
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                  <span>When does this salary / hike start?</span>
                  <span className="text-rose-500">*</span>
                </label>

                {/* Quick Date Chips */}
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate("this_month")}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    1st of This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate("next_month")}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    1st of Next Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate("today")}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white"
                required
              />
              <p className="text-[11px] text-slate-500">
                Monthly payslips generated from this date forward will reflect this updated salary and statutory calculations.
              </p>
            </div>

            {/* Revision Reason / Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Revision Type
                </label>
                <select
                  value={revisionType}
                  onChange={(e) => setRevisionType(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white cursor-pointer"
                >
                  {REVISION_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Q1 Appraisal, Promotion"
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white"
                />
              </div>
            </div>

            {/* Live Breakup Preview Card */}
            {monthly && (
              <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200/80 pb-2">
                  <span>Calculated Breakup Preview:</span>
                  <span className="text-brand-primary font-extrabold">
                    {formatCurrency(monthly.ctc)} / mo
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-slate-600">
                    Basic Pay (50%):{" "}
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(monthly.basicPay)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Gross Salary:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(monthly.grossSalary)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    EPF Employee:{" "}
                    <span className="font-semibold text-rose-600">
                      -{formatCurrency(monthly.employeePf)}
                    </span>{" "}
                    <span className="text-[10px] text-slate-400">
                      {monthly.basicPay > 15000 ? "(Capped ₹1,800)" : "(12%)"}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    ESI Employee:{" "}
                    <span className="font-semibold text-rose-600">
                      -{formatCurrency(monthly.employeeEsi)}
                    </span>{" "}
                    <span className="text-[10px] text-slate-400">
                      {monthly.basicPay > 21000 ? "(Exempt > ₹21k)" : "(0.75%)"}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Professional Tax:{" "}
                    <span className="font-semibold text-rose-600">
                      -{formatCurrency(monthly.professionalTax)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Total Deductions:{" "}
                    <span className="font-semibold text-rose-600">
                      -{formatCurrency(monthly.totalDeductions)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between font-bold">
                  <div>
                    <span className="text-emerald-700">Net Monthly In-Hand:</span>
                    {currentStructure &&
                      Number(currentStructure.net_salary_monthly) > 0 &&
                      monthly.netSalary > Number(currentStructure.net_salary_monthly) && (
                        <span className="ml-2 text-[10px] font-extrabold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          +
                          {formatCurrency(
                            monthly.netSalary - Number(currentStructure.net_salary_monthly)
                          )}
                          /mo increase
                        </span>
                      )}
                  </div>
                  <span className="text-emerald-700 text-sm font-black">
                    {formatCurrency(monthly.netSalary)} / mo
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer (Pinned) */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              {calculatedHikePercent > 0 ? (
                <span className="text-emerald-700 font-bold">
                  Applying {calculatedHikePercent}% hike from {effectiveDate}
                </span>
              ) : (
                <span>Effective from: {effectiveDate || "Selected date"}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : calculatedHikePercent > 0
                    ? `Assign Hike (+${calculatedHikePercent}%)`
                    : "Assign Structure"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

