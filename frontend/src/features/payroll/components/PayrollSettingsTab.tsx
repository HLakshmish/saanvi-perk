"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  ShieldCheck,
  Building2,
  Percent,
  DollarSign,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Calendar,
  History,
  Clock,
  ArrowRight,
  Eye,
  Trash2,
} from "lucide-react";
import { PayrollSettings, PayrollSettingsHistoryItem } from "../types/payroll.types";
import {
  getPayrollSettings,
  getPayrollSettingsHistory,
  updatePayrollSettings,
  deletePayrollSettingsVersion,
} from "../api/payroll.api";
import { snackbar as toast } from "@/components/ui/snackbar";

export const PayrollSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<PayrollSettings>({
    basicPercentage: 50.0,
    hraPercentage: 25.0,
    otherAllowancesPercentage: 25.0,
    employeePfRate: 12.0,
    employeeEsiRate: 0.75,
    professionalTax: 200.0,
    employerPfRate: 13.0,
    employerEsiRate: 3.25,
    gratuityRate: 4.81,
    statutoryPfWageLimit: 15000.0,
    usePfWageCeiling: true,
    statutoryEsiGrossLimit: 21000.0,
  });

  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [versionRemarks, setVersionRemarks] = useState<string>("");
  const [historyList, setHistoryList] = useState<PayrollSettingsHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [selectedHistoryVersion, setSelectedHistoryVersion] = useState<PayrollSettingsHistoryItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
    loadHistory();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await getPayrollSettings();
      if (res.success && res.data) {
        setSettings(res.data);
        if (res.data.effectiveFrom) {
          setEffectiveFrom(res.data.effectiveFrom);
        }
      }
    } catch {
      toast.show("Could not load current payroll settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getPayrollSettingsHistory();
      if (res.success && res.data) {
        setHistoryList(res.data);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteVersion = async (id?: number, dateStr?: string) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to delete the policy version effective ${dateStr}?`)) {
      return;
    }
    try {
      const res = await deletePayrollSettingsVersion(id);
      if (res.success) {
        toast.show("Policy version deleted successfully", "success");
        loadSettings();
        loadHistory();
      } else {
        toast.show(res.error || "Failed to delete policy version", "error");
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to delete policy version", "error");
    }
  };

  const handleChange = (key: keyof PayrollSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveFrom) {
      toast.show("Please specify an Effective From date for this policy", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<PayrollSettings> = {
        ...settings,
        effectiveFrom,
        remarks: versionRemarks.trim() || undefined,
        versionName: versionRemarks.trim() || `Policy effective from ${effectiveFrom}`,
      };

      const res = await updatePayrollSettings(payload);
      if (res.success && res.data) {
        setSettings(res.data);
        setHasChanges(false);
        setVersionRemarks("");
        toast.show(
          `Payroll settings effective from ${effectiveFrom} saved successfully! Previous dates will remain unaffected.`,
          "success"
        );
        loadHistory();
      } else {
        toast.show(res.error || "Failed to update payroll settings", "error");
      }
    } catch (err: any) {
      toast.show(err.message || "Network error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      basicPercentage: 50.0,
      hraPercentage: 25.0,
      otherAllowancesPercentage: 25.0,
      employeePfRate: 12.0,
      employeeEsiRate: 0.75,
      professionalTax: 200.0,
      employerPfRate: 13.0,
      employerEsiRate: 3.25,
      gratuityRate: 4.81,
      statutoryPfWageLimit: 15000.0,
      usePfWageCeiling: true,
      statutoryEsiGrossLimit: 21000.0,
    });
    setHasChanges(true);
    toast.show("Reset to Indian statutory defaults. Click 'Save Policies' to apply.", "info");
  };

  const handleSetQuickDate = (type: "today" | "this_month" | "next_month") => {
    const now = new Date();
    if (type === "today") {
      setEffectiveFrom(now.toISOString().split("T")[0]);
    } else if (type === "this_month") {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      setEffectiveFrom(`${y}-${m}-01`);
    } else if (type === "next_month") {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const y = nextMonth.getFullYear();
      const m = String(nextMonth.getMonth() + 1).padStart(2, "0");
      setEffectiveFrom(`${y}-${m}-01`);
    }
    setHasChanges(true);
  };

  // Quick live simulator for ₹71,555 monthly CTC
  const sampleCtc = 71555;
  const simBasic = Math.round(sampleCtc * (settings.basicPercentage / 100));
  const simPfWage = simBasic > 15000 ? 15000 : simBasic;
  const simEmpPf = simBasic > 15000 ? 1800 : Math.round(simBasic * (settings.employeePfRate / 100));
  const simEsiLimit = Number(settings.statutoryEsiGrossLimit || 21000);
  const simEmpEsi = simBasic > simEsiLimit ? 0 : Math.round(simBasic * (settings.employeeEsiRate / 100));
  const simPt = Number(settings.professionalTax || 0);
  const simEmployerPf = Math.round(simPfWage * (settings.employerPfRate / 100));
  const simEmployerEsi = simBasic > simEsiLimit ? 0 : Math.round(simBasic * (settings.employerEsiRate / 100));
  const simGratuity = Math.round(simBasic * (settings.gratuityRate / 100));
  const simTotalEmployer = simEmployerPf + simEmployerEsi + simGratuity;
  const simGross = sampleCtc - simTotalEmployer;
  const simDeductions = simEmpPf + simEmpEsi + simPt;
  const simNet = simGross - simDeductions;

  return (
    <div className="space-y-6">
      {/* Header with Title and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-primary flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            <span>Date-Based Payroll Statutory Rates & Percentages</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store and manage company salary formula percentages with effective date ranges. Any changes apply only from the selected Effective Date onward and never affect previous payroll cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Statutory Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`px-5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
              hasChanges
                ? "bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 shadow-sm"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Policies"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: All Dynamic Percentages */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* Card 0: Policy Effective Date & Range (The Core Requirement) */}
          <div className="bg-gradient-to-r from-brand-primary/5 via-indigo-50/50 to-blue-50/30 rounded-2xl border-2 border-brand-primary/20 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Policy Effective Period & Date Activation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control which date range these percentages apply to
                  </p>
                </div>
              </div>

              {settings.effectiveFrom && (
                <div className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                  Active from:{" "}
                  <span className="font-extrabold text-slate-900">
                    {new Date(settings.effectiveFrom).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>{" "}
                  {settings.effectiveTo ? (
                    <>
                      to{" "}
                      <span className="font-extrabold text-slate-900">
                        {new Date(settings.effectiveTo).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </>
                  ) : (
                    <span>➔ Till next changes</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Effective From Date</span>
                    <span className="text-rose-500">*</span>
                  </label>

                  {/* Quick helper date chips */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate("today")}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate("this_month")}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
                    >
                      1st of Mo
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => {
                      setEffectiveFrom(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white cursor-pointer"
                    required
                  />
                </div>
                {historyList.some((v) => v.effectiveFrom === effectiveFrom) ? (
                  <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Existing policy found for this date. Saving will update these rates without creating duplicate overlapping versions.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    New policy version will activate from this date onward. Past versions will close automatically to prevent date overlap.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Revision Reason / Version Label (Optional)
                </label>
                <input
                  type="text"
                  value={versionRemarks}
                  onChange={(e) => {
                    setVersionRemarks(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="e.g. Revised PF % from 05/04/2025"
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Identifies this policy version in your audit logs and timeline.
                </p>
              </div>
            </div>
          </div>

          {/* Card 1: Basic Pay & Allowances Breakup */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Basic Salary & Allowances Ratio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Determines what % of CTC or Gross forms Basic Pay + DA + RA
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Basic Pay + DA + RA (% of CTC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="100"
                    value={settings.basicPercentage}
                    onChange={(e) => handleChange("basicPercentage", parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default 50.00% as requested</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HRA & Other Allowances Ratio
                </label>
                <div className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
                  Allocated automatically from the remaining Gross balance (approx. 50% HRA, 50%
                  Other).
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Employee Deductions Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Employee Deductions (Dynamic %)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory deductions subtracted from monthly gross salary
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  EPF Contribution Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.employeePfRate}
                    onChange={(e) => handleChange("employeePfRate", parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">12.00% if Basic ≤ ₹15,000; fixed ₹1,800 if Basic &gt; ₹15,000</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ESI Contribution Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.employeeEsiRate}
                    onChange={(e) => handleChange("employeeEsiRate", parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default 0.75% on Basic Pay (₹0 if Basic &gt; ₹21,000/mo)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Professional Tax (PT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={settings.professionalTax}
                    onChange={(e) => handleChange("professionalTax", parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default ₹200 / month</p>
              </div>
            </div>
          </div>

          {/* Card 3: Employer Contributions & Gratuity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Employer Contributions & Gratuity (Dynamic %)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Company costs included in Total Cost to Company (CTC)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employer PF Rate (w/ Admin)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.employerPfRate}
                    onChange={(e) => handleChange("employerPfRate", parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default 13.00% (with admin chg)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employer ESI Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.employerEsiRate}
                    onChange={(e) => handleChange("employerEsiRate", parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default 3.25% on Basic Pay (₹0 if Basic &gt; ₹21,000/mo)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gratuity Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.gratuityRate}
                    onChange={(e) => handleChange("gratuityRate", parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default 4.81% (15/26 days)</p>
              </div>
            </div>
          </div>

          {/* Card 4: Statutory Wage Limits & Ceiling Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Statutory PF Wage Ceiling Rule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Indian EPFO standard ₹15,000 wage ceiling limit rule
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Enforce Statutory PF Wage Ceiling
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Caps EPF to ₹1,800/mo when Basic exceeds ₹15,000 (12% applies only if Basic ≤ ₹15,000)
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.usePfWageCeiling}
                    onChange={(e) => handleChange("usePfWageCeiling", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Statutory PF Wage Limit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={settings.statutoryPfWageLimit}
                    disabled={!settings.usePfWageCeiling}
                    onChange={(e) => handleChange("statutoryPfWageLimit", parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Statutory ESI Wage Ceiling Rule */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Statutory ESI Wage Ceiling Rule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Indian statutory ESI threshold: ₹21,000/month wage limit rule
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-800">
                  ESI Exemption Above Threshold
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  If base amount (Basic Pay) exceeds ₹21,000/mo, both Employee ESI and Employer ESI contributions are set to ₹0.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Statutory ESI Wage Limit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={settings.statutoryEsiGrossLimit}
                    onChange={(e) => handleChange("statutoryEsiGrossLimit", parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Standard statutory limit: ₹21,000 / month</p>
              </div>
            </div>
          </div>
        </form>

        {/* Right Sidebar: Live Preview & Policy Version Timeline */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Simulator Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Policy Simulator
              </span>
              <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-semibold">
                ₹71,555 CTC Sample
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Basic Pay ({settings.basicPercentage}%)</span>
                <span className="font-bold text-white">₹{simBasic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Employee PF ({settings.employeePfRate}%)</span>
                <span className="font-bold text-rose-300">₹{simEmpPf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Employee ESI ({settings.employeeEsiRate}%)</span>
                <span className="font-bold text-rose-300">
                  {simEmpEsi === 0 ? "₹0 (Exempt > ₹21k)" : `₹${simEmpEsi.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Professional Tax (PT)</span>
                <span className="font-bold text-rose-300">₹{simPt.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-slate-300 font-semibold">
                <span>Gross Salary</span>
                <span className="text-indigo-300">₹{simGross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>Total Deductions</span>
                <span className="text-rose-400">₹{simDeductions.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-white/15 flex justify-between items-center">
                <span className="font-extrabold text-emerald-400 uppercase text-[11px]">
                  Net Take-Home
                </span>
                <span className="font-black text-emerald-400 text-base">
                  ₹{simNet.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white">Employer Costs Included in CTC:</div>
              <div className="flex justify-between">
                <span>PF ({settings.employerPfRate}%)</span>
                <span>₹{simEmployerPf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ESI ({settings.employerEsiRate}%)</span>
                <span>₹{simEmployerEsi.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Gratuity ({settings.gratuityRate}%)</span>
                <span>₹{simGratuity.toLocaleString()}</span>
              </div>
              <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-blue-300">
                <span>Total Contribution</span>
                <span>₹{simTotalEmployer.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Policy Version Timeline Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-brand-primary" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Policy Date Timeline
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {
                  [...historyList].filter(
                    (ver, idx, arr) => arr.findIndex((x) => x.effectiveFrom === ver.effectiveFrom) === idx
                  ).length
                }{" "}
                Version
                {
                  [...historyList].filter(
                    (ver, idx, arr) => arr.findIndex((x) => x.effectiveFrom === ver.effectiveFrom) === idx
                  ).length === 1
                    ? ""
                    : "s"
                }
              </span>
            </div>

            {isLoadingHistory ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading policy history...
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No policy revisions saved yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(() => {
                  // Deduplicate and strictly sort by effectiveFrom DESC so no duplicate or overlapping dates appear
                  const uniqueHistory = [...historyList]
                    .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())
                    .filter((ver, idx, arr) => arr.findIndex((x) => x.effectiveFrom === ver.effectiveFrom) === idx);

                  return uniqueHistory.map((ver, idx) => {
                    // Strictly ONLY the single latest version (idx === 0) is Active! All older versions are Historical.
                    const isCurrent = idx === 0;

                    let toDateDisplay = "Present";
                    if (!isCurrent) {
                      if (ver.effectiveTo) {
                        toDateDisplay = new Date(ver.effectiveTo).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      } else if (uniqueHistory[idx - 1]) {
                        const prevEff = new Date(uniqueHistory[idx - 1].effectiveFrom);
                        const dayBefore = new Date(prevEff.getTime() - 86400000);
                        toDateDisplay = dayBefore.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      }
                    } else if (ver.effectiveTo) {
                      toDateDisplay = new Date(ver.effectiveTo).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                    }

                    return (
                      <div
                        key={ver.id || `${ver.effectiveFrom}-${idx}`}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          isCurrent
                            ? "bg-indigo-50/60 border-indigo-200 ring-1 ring-indigo-200/50"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-indigo-600" />
                            <span>
                              {new Date(ver.effectiveFrom).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-slate-400">➔</span>
                            <span>{toDateDisplay}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isCurrent
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {isCurrent ? "Active" : "Historical"}
                            </span>

                            {uniqueHistory.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteVersion(ver.id, ver.effectiveFrom)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                                title="Delete policy version"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {ver.remarks && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">
                            &quot;{ver.remarks}&quot;
                          </p>
                        )}

                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Basic: <strong className="text-slate-800">{ver.basicPercentage}%</strong> | PF:{" "}
                            <strong className="text-slate-800">{ver.employeePfRate}%</strong> | ESI:{" "}
                            <strong className="text-slate-800">{ver.employeeEsiRate}%</strong>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setSettings(ver);
                              if (ver.effectiveFrom) setEffectiveFrom(ver.effectiveFrom);
                              toast.show(
                                `Loaded rates from policy effective ${ver.effectiveFrom}`,
                                "info"
                              );
                            }}
                            className="text-brand-primary hover:text-brand-primary/80 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Compliance Immuntability Note */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Date-Based Policy Protection</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Updating percentages only affects cycles starting from the specified Effective Date. Prior months, past payslips, and historical records remain 100% frozen with their original calculations for accounting compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
