"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  Percent,
} from "lucide-react";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";
import { assignEmployeeSalary, calculateSalaryBreakup } from "../api/payroll.api";
import { SalaryBreakupResult } from "../types/payroll.types";
import { snackbar as toast } from "@/components/ui/snackbar";

interface AssignSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillCtc?: number;
  prefillIsAnnual?: boolean;
}

export const AssignSalaryModal: React.FC<AssignSalaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefillCtc,
  prefillIsAnnual = true,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [inputType, setInputType] = useState<"annual" | "monthly">("annual");
  const [ctcValue, setCtcValue] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [previewResult, setPreviewResult] = useState<SalaryBreakupResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingEmps, setIsLoadingEmps] = useState<boolean>(true);

  // Set initial effective date to 1st of current month
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    setEffectiveDate(`${y}-${m}-01`);
  }, []);

  // Set prefill CTC if passed
  useEffect(() => {
    if (prefillCtc && prefillCtc > 0) {
      setInputType(prefillIsAnnual ? "annual" : "monthly");
      setCtcValue(prefillCtc.toString());
    } else if (!ctcValue) {
      setCtcValue("858660"); // Default spreadsheet sample
    }
  }, [prefillCtc, prefillIsAnnual, isOpen]);

  // Load employees list
  useEffect(() => {
    if (isOpen) {
      setIsLoadingEmps(true);
      getEmployees()
        .then((emps) => {
          setEmployees(emps);
          if (emps.length > 0 && !selectedUserId) {
            setSelectedUserId(emps[0].id);
          }
        })
        .catch(() => toast.show("Failed to load employee list", "error"))
        .finally(() => setIsLoadingEmps(false));
    }
  }, [isOpen]);

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

    setIsSubmitting(true);
    try {
      const payload: any = {
        userId: userIdNum,
        effectiveDate,
      };
      if (inputType === "annual") {
        payload.annualCtc = num;
      } else {
        payload.monthlyCtc = num;
      }

      const res = await assignEmployeeSalary(payload);
      if (res.success) {
        toast.show("Employee salary structure assigned successfully!", "success");
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

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const monthly = previewResult?.monthly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign Salary Structure (CTC)</h3>
              <p className="text-xs text-slate-500">
                Setup employee CTC with dynamic Indian statutory components
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Mode Switcher & Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Cost to Company (CTC) <span className="text-rose-500">*</span>
              </label>
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
                    inputType === "annual" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
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
                    inputType === "monthly" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
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
                onChange={(e) => setCtcValue(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 858660"
                className="w-full pl-8 pr-20 py-2.5 text-base font-extrabold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                required
              />
              <span className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400">
                {inputType === "annual" ? "/ year" : "/ month"}
              </span>
            </div>
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Effective Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              required
            />
          </div>

          {/* Live Preview Pill Card */}
          {monthly && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-2">
                <span>Calculated Breakup Preview:</span>
                <span className="text-brand-primary">{formatCurrency(monthly.ctc)} / mo</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-slate-600">
                  Basic Pay (50%): <span className="font-semibold text-slate-900">{formatCurrency(monthly.basicPay)}</span>
                </div>
                <div className="text-slate-600">
                  Gross Salary: <span className="font-semibold text-slate-900">{formatCurrency(monthly.grossSalary)}</span>
                </div>
                <div className="text-slate-600">
                  EPF Employee: <span className="font-semibold text-rose-600">-{formatCurrency(monthly.employeePf)}</span>
                </div>
                <div className="text-slate-600">
                  ESI + PT: <span className="font-semibold text-rose-600">-{formatCurrency(monthly.employeeEsi + monthly.professionalTax)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
                <span className="text-emerald-700">Net Monthly In-Hand:</span>
                <span className="text-emerald-700 text-sm font-black">{formatCurrency(monthly.netSalary)} / mo</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Assign Structure"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
