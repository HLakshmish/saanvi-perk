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
} from "lucide-react";
import { PayrollSettings } from "../types/payroll.types";
import { getPayrollSettings, updatePayrollSettings } from "../api/payroll.api";
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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await getPayrollSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch {
      toast.show("Could not load current payroll settings", "error");
    } finally {
      setIsLoading(false);
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
    setIsSaving(true);
    try {
      const res = await updatePayrollSettings(settings);
      if (res.success && res.data) {
        setSettings(res.data);
        setHasChanges(false);
        toast.show("Payroll settings & percentages updated successfully!", "success");
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
    toast.show("Reset to Indian statutory defaults. Click 'Save' to apply.", "info");
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
            <span>Dynamic Payroll Statutory Rates & Percentages</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store and manage company salary formula percentages in the database. All calculations
            throughout the system adapt dynamically to these values.
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

        {/* Right Sidebar: Live Preview for ₹71,555 Sample */}
        <div className="lg:col-span-4 space-y-4">
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

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Statutory Compliance Note</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Updates to these percentages will apply to newly generated salary breakups and monthly
              payroll runs. Previously finalized payslips remain immutable for accounting audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
