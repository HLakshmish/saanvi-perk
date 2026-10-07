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
  ArrowLeft,
  User,
} from "lucide-react";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";
import {
  assignEmployeeSalary,
  calculateSalaryBreakup,
  getEmployeeSalaryStructure,
  getSalaryHistory,
} from "../api/payroll.api";
import { SalaryBreakupResult, EmployeeSalaryStructure } from "../types/payroll.types";
import { snackbar as toast } from "@/components/ui/snackbar";

interface AssignSalaryModalProps {
  isOpen?: boolean;
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
  isOpen = true,
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
  const [effectiveTo, setEffectiveTo] = useState<string>("");
  const [revisionType, setRevisionType] = useState<string>("ANNUAL_APPRAISAL");
  const [remarks, setRemarks] = useState<string>("");

  const [previewResult, setPreviewResult] = useState<SalaryBreakupResult | null>(null);
  const [empHistory, setEmpHistory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingEmps, setIsLoadingEmps] = useState<boolean>(true);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

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
          } else if (emps.length > 0 && !selectedUserId) {
            setSelectedUserId(emps[0].id);
          }
        })
        .catch(() => toast.show("Failed to load employee list", "error"))
        .finally(() => setIsLoadingEmps(false));
    }
  }, [isOpen, prefillUserId]);

  // When selected user changes, find or fetch their existing structure & past history
  useEffect(() => {
    if (!selectedUserId || !isOpen) {
      setCurrentStructure(null);
      setEmpHistory([]);
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

    // Also fetch their past history for timeline context
    setIsLoadingHistory(true);
    getSalaryHistory(Number(selectedUserId))
      .then((res) => {
        if (res.success && res.data) {
          setEmpHistory(res.data);
        } else {
          setEmpHistory([]);
        }
      })
      .catch(() => setEmpHistory([]))
      .finally(() => setIsLoadingHistory(false));
  }, [selectedUserId, isOpen, existingStructures, prefillCtc]);

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
      setCtcValue("");
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

  // Update preview breakup with effectiveDate
  useEffect(() => {
    const num = parseFloat(ctcValue.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) {
      setPreviewResult(null);
      return;
    }
    const payload =
      inputType === "annual"
        ? { annualCtc: num, effectiveDate: effectiveDate || undefined }
        : { monthlyCtc: num, effectiveDate: effectiveDate || undefined };
    calculateSalaryBreakup(payload).then((res) => {
      if (res.success && res.data) {
        setPreviewResult(res.data);
      }
    });
  }, [ctcValue, inputType, effectiveDate]);

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
        effectiveTo: effectiveTo ? effectiveTo : undefined,
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
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Return to Employee Salary List"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to List</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {currentAnnualCtc > 0 ? "Revise Salary / Assign Hike" : "Assign Employee CTC & Compensation"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure employee CTC with starting effective date, hike percentage & statutory rules
            </p>
          </div>
        </div>

        {/* Date Effective Badge in Header */}
        <div className="flex items-center gap-2">
          {effectiveDate && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              <span>
                Effective Date:{" "}
                <strong>
                  {new Date(effectiveDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Form & Live Preview */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Controls (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            {/* Employee Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Employee <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white cursor-pointer"
                required
              >
                <option value="" disabled>
                  {isLoadingEmps ? "Loading employees..." : "-- Choose Employee --"}
                </option>
                {employees.map((emp: any) => {
                  const empName =
                    emp.name?.trim() ||
                    `${emp.firstName || emp.first_name || ""} ${emp.lastName || emp.last_name || ""}`.trim() ||
                    `Employee #${emp.id}`;
                  const empCode = emp.employeeCode || emp.employee_code || `EMP-${emp.id}`;
                  const desig =
                    typeof emp.designation === "string"
                      ? emp.designation
                      : emp.designation?.designation_name || emp.designation_name || "";
                  const label = desig
                    ? `${empName} (${empCode}) — ${desig}`
                    : `${empName} (${empCode})`;

                  return (
                    <option key={emp.id} value={emp.id}>
                      {label}
                    </option>
                  );
                })}
              </select>

              {/* Selected Employee Summary Card */}
              {(() => {
                const sel = employees.find((e: any) => String(e.id) === String(selectedUserId)) as any;
                if (!sel) return null;
                const empName =
                  sel.name?.trim() ||
                  `${sel.firstName || sel.first_name || ""} ${sel.lastName || sel.last_name || ""}`.trim() ||
                  `Employee #${sel.id}`;
                const empCode = sel.employeeCode || sel.employee_code || `EMP-${sel.id}`;
                const desig =
                  typeof sel.designation === "string"
                    ? sel.designation
                    : sel.designation?.designation_name || sel.designation_name || "Employee";
                const dept = sel.department || sel.department_name || "General";

                return (
                  <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-xs">
                        {empName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{empName}</div>
                        <div className="text-[11px] text-slate-500">
                          {desig} • {dept}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[11px]">
                        {empCode}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Current Active Structure Card (If exists) */}
            {currentAnnualCtc > 0 && (
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Current Active Compensation</span>
                  </span>
                  {currentStructure?.effective_date && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                      Effective since:{" "}
                      {new Date(currentStructure.effective_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="text-slate-600">
                    Annual CTC:{" "}
                    <span className="font-extrabold text-slate-900 block sm:inline">
                      {formatCurrency(currentAnnualCtc)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Monthly CTC:{" "}
                    <span className="font-extrabold text-slate-900 block sm:inline">
                      {formatCurrency(currentMonthlyCtc)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    In-Hand:{" "}
                    <span className="font-extrabold text-emerald-700 block sm:inline">
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
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
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
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
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
                <span className="absolute left-3.5 top-3 text-base font-bold text-slate-400">₹</span>
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
                  placeholder="e.g. 500000"
                  className="w-full pl-9 pr-24 py-3 text-lg font-extrabold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-semibold text-slate-400">
                  {inputType === "annual" ? "/ year" : "/ month"}
                </span>
              </div>
            </div>

            {/* When This Starts and Ends (Effective Date Range) */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Start Date</span>
                      <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white cursor-pointer"
                    required
                  />

                  {/* Quick Start Date Chips */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate("this_month")}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      1st of This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate("today")}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                  </div>
                </div>

                {/* End Date (Optional / Till Next Revision) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>End Date</span>
                      <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    {effectiveTo && (
                      <button
                        type="button"
                        onClick={() => setEffectiveTo("")}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Clear (Ongoing)
                      </button>
                    )}
                  </div>

                  <input
                    type="date"
                    value={effectiveTo}
                    min={effectiveDate || undefined}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white cursor-pointer"
                  />

                  <p className="text-[10px] text-slate-400">
                    {effectiveTo ? `Ends on ${new Date(effectiveTo).toLocaleDateString("en-IN")}` : "Leave blank for ongoing (until next revision)"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>
                  Takes effect from {effectiveDate ? new Date(effectiveDate).toLocaleDateString("en-IN") : "selected start"}{effectiveTo ? ` to ${new Date(effectiveTo).toLocaleDateString("en-IN")}` : " (ongoing)"}. Prior dates remain unaffected.
                </span>
                {previewResult?.ratesApplied?.versionName && (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Policy: {previewResult.ratesApplied.versionName}
                  </span>
                )}
              </div>
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
                  className="w-full px-3 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white cursor-pointer"
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
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white"
                />
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
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
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer border border-slate-200"
                  >
                    Cancel / Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
          </div>

          {/* Right Column: Live Breakup Preview & History Timeline (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Breakup Preview Card */}
            {monthly ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-700">Calculated Breakup Preview</h4>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Based on policy as of {effectiveDate || "today"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-brand-primary">
                      {formatCurrency(monthly.ctc)}
                    </span>
                    <div className="text-[10px] text-slate-400">/ month</div>
                  </div>
                </div>

                {previewResult?.ratesApplied?.versionName && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between font-semibold">
                    <span>Applied Statutory Policy:</span>
                    <span className="font-bold">{previewResult.ratesApplied.versionName}</span>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Basic Pay ({previewResult?.ratesApplied?.basicPercentage ?? 50}%)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(monthly.basicPay)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(monthly.hra)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Other Allowances</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(monthly.otherAllowances)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 font-bold text-indigo-900 bg-indigo-50/50 px-2 rounded-lg">
                    <span>Monthly Gross Salary</span>
                    <span>{formatCurrency(monthly.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Employee EPF ({previewResult?.ratesApplied?.employeePfRate ?? 12}%)</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(monthly.employeePf)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">
                      Employee ESI {monthly.basicPay > 21000 ? "(Exempt > ₹21k)" : `(${previewResult?.ratesApplied?.employeeEsiRate ?? 0.75}%)`}
                    </span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(monthly.employeeEsi)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(monthly.professionalTax)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 font-bold text-rose-900 bg-rose-50/50 px-2 rounded-lg">
                    <span>Total Deductions</span>
                    <span>-{formatCurrency(monthly.totalDeductions)}</span>
                  </div>
                </div>

                {/* In Hand Take Home Highlight */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                        Net Monthly Take-Home
                      </span>
                      {currentStructure &&
                        Number(currentStructure.net_salary_monthly) > 0 &&
                        monthly.netSalary > Number(currentStructure.net_salary_monthly) && (
                          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                            +{formatCurrency(monthly.netSalary - Number(currentStructure.net_salary_monthly))}/mo increase
                          </div>
                        )}
                    </div>
                    <div className="text-xl font-black text-emerald-900">
                      {formatCurrency(monthly.netSalary)}
                    </div>
                  </div>
                </div>

                {/* Employer Contributions Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] space-y-1.5">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Employer Statutory Contributions
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Employer PF ({previewResult?.ratesApplied?.employerPfRate ?? 13}%):</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(monthly.employerPf)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Employer ESI {monthly.basicPay > 21000 ? "(Exempt)" : `(${previewResult?.ratesApplied?.employerEsiRate ?? 3.25}%)`}:
                    </span>
                    <span className="font-semibold text-slate-900">{formatCurrency(monthly.employerEsi)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Gratuity ({previewResult?.ratesApplied?.gratuityRate ?? 4.81}%):</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(monthly.gratuity)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center text-slate-400 text-xs">
                Enter a valid CTC amount to see the live statutory breakup.
              </div>
            )}

            {/* Historical Revisions Timeline Card */}
            {selectedUserId && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Past Revision History</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {empHistory.length} {empHistory.length === 1 ? "record" : "records"}
                  </span>
                </div>

                {isLoadingHistory ? (
                  <div className="py-6 text-center text-slate-400 text-xs">Loading history...</div>
                ) : empHistory.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs italic">
                    No previous revisions recorded for this employee.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-indigo-100 ml-2 pl-4 space-y-4 text-xs">
                    {empHistory.map((h, i) => (
                      <div key={h.id || i} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {new Date(h.effective_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {Number(h.hike_percentage) > 0 ? (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                              +{h.hike_percentage}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {h.revision_type || "INITIAL"}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 font-semibold mt-0.5">
                          {formatCurrency(h.new_annual_ctc)} / yr
                        </div>
                        {h.remarks && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">"{h.remarks}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
