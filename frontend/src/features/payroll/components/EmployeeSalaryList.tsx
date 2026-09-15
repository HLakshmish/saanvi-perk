"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  DollarSign,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { EmployeeSalaryStructure } from "../types/payroll.types";
import { getAllSalaryStructures } from "../api/payroll.api";
import { AssignSalaryModal } from "./AssignSalaryModal";
import { snackbar as toast } from "@/components/ui/snackbar";

interface EmployeeSalaryListProps {
  onOpenCalculator?: () => void;
}

export const EmployeeSalaryList: React.FC<EmployeeSalaryListProps> = ({
  onOpenCalculator,
}) => {
  const [salaries, setSalaries] = useState<EmployeeSalaryStructure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedStructure, setSelectedStructure] = useState<EmployeeSalaryStructure | null>(null);

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const res = await getAllSalaryStructures(searchQuery);
      if (res.success && res.data) {
        setSalaries(res.data);
      } else {
        setSalaries([]);
      }
    } catch {
      toast.show("Failed to fetch employee salary structures", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSalaries();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null) return "₹0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(num));
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employee name, code, department..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {onOpenCalculator && (
            <button
              onClick={onOpenCalculator}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-brand-primary" />
              <span>Open Calculator</span>
            </button>
          )}

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Salary (CTC)</span>
          </button>
        </div>
      </div>

      {/* Salary Structures Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-xs">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4 text-right">Annual CTC</th>
                <th className="py-3.5 px-4 text-right">Monthly Gross</th>
                <th className="py-3.5 px-4 text-right">Monthly Deductions</th>
                <th className="py-3.5 px-4 text-right font-black text-emerald-700">Net Take-Home</th>
                <th className="py-3.5 px-4 text-center">Effective Date</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Loading salary records...
                  </td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-600 font-semibold text-sm">
                      No salary structures found
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Assign a CTC to an employee using the button above.
                    </p>
                  </td>
                </tr>
              ) : (
                salaries.map((sal) => {
                  const empName = `${sal.first_name || ""} ${sal.last_name || ""}`.trim() || `User #${sal.user_id}`;
                  return (
                    <tr key={sal.id || sal.user_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">{empName}</div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {sal.employee_code || "EMP"} • {sal.official_email || "N/A"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{sal.designation_name || "Employee"}</div>
                        <div className="text-[11px] text-slate-400">{sal.department_name || "General"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(sal.annual_ctc)}
                        <div className="text-[11px] text-slate-400 font-normal">
                          {formatCurrency(sal.monthly_ctc)} / mo
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-indigo-900">
                        {formatCurrency(sal.monthly_gross)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                        -{formatCurrency(sal.total_deductions_monthly)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                        {formatCurrency(sal.net_salary_monthly)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                        {sal.effective_date
                          ? new Date(sal.effective_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Current"}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => setSelectedStructure(sal)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-brand-primary hover:text-white transition-all text-slate-700 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Breakup</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Breakup Modal for Selected Employee */}
      {selectedStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Salary Breakup — {selectedStructure.first_name} {selectedStructure.last_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStructure.employee_code} • {selectedStructure.designation_name || "Employee"} •{" "}
                  {selectedStructure.department_name || "General"}
                </p>
              </div>
              <button
                onClick={() => setSelectedStructure(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-4 text-left">Component</th>
                    <th className="py-2.5 px-4 text-right">Monthly (₹)</th>
                    <th className="py-2.5 px-4 text-right">Annually (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Earnings */}
                  <tr className="bg-slate-50 font-bold text-brand-primary">
                    <td colSpan={3} className="py-2 px-4 uppercase text-[11px]">
                      A. Earnings
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">(A) Basic Pay + DA + RA (50%)</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.basic_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.basic_annual)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">(B) HRA</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.hra_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.hra_annual)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">(C) Other Allowances</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.other_allowances_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.other_allowances_annual)}</td>
                  </tr>
                  <tr className="bg-indigo-50 font-bold text-indigo-900">
                    <td className="py-2 px-4">Gross Salary</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(selectedStructure.monthly_gross)}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(selectedStructure.annual_gross)}</td>
                  </tr>

                  {/* Deductions */}
                  <tr className="bg-slate-50 font-bold text-rose-700">
                    <td colSpan={3} className="py-2 px-4 uppercase text-[11px]">
                      B. Deductions
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">EPF Contribution by Employee</td>
                    <td className="py-2 px-4 text-right font-semibold text-rose-600">{formatCurrency(selectedStructure.employee_pf_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold text-rose-600">{formatCurrency(selectedStructure.employee_pf_annual)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">ESI Contribution by Employee</td>
                    <td className="py-2 px-4 text-right font-semibold text-rose-600">{formatCurrency(selectedStructure.employee_esi_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold text-rose-600">{formatCurrency(selectedStructure.employee_esi_annual)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Professional Tax (PT)</td>
                    <td className="py-2 px-4 text-right font-semibold text-rose-600">{formatCurrency(selectedStructure.professional_tax_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold text-rose-600">{formatCurrency(selectedStructure.professional_tax_annual)}</td>
                  </tr>
                  <tr className="bg-rose-50 font-bold text-rose-900">
                    <td className="py-2 px-4">Total Deductions</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(selectedStructure.total_deductions_monthly)}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(selectedStructure.total_deductions_annual)}</td>
                  </tr>

                  {/* Net Salary */}
                  <tr className="bg-emerald-100 font-black text-emerald-950 text-sm">
                    <td className="py-3 px-4 uppercase">Net Take-Home Salary</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(selectedStructure.net_salary_monthly)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(selectedStructure.net_salary_annual)}</td>
                  </tr>

                  {/* Employer Share */}
                  <tr className="bg-slate-50 font-bold text-blue-700">
                    <td colSpan={3} className="py-2 px-4 uppercase text-[11px]">
                      C. Employer Contributions
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Employer PF (13%)</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.employer_pf_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.employer_pf_annual)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Employer ESI (3.25%)</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.employer_esi_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.employer_esi_annual)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Gratuity (4.81%)</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.gratuity_monthly)}</td>
                    <td className="py-2 px-4 text-right font-semibold">{formatCurrency(selectedStructure.gratuity_annual)}</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-black">
                    <td className="py-3 px-4 text-amber-300 uppercase">Cost to Company (CTC)</td>
                    <td className="py-3 px-4 text-right text-amber-300 text-sm">{formatCurrency(selectedStructure.monthly_ctc)}</td>
                    <td className="py-3 px-4 text-right text-amber-300 text-sm">{formatCurrency(selectedStructure.annual_ctc)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStructure(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer"
              >
                Close Breakup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Salary Modal */}
      <AssignSalaryModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          fetchSalaries();
        }}
      />
    </div>
  );
};
