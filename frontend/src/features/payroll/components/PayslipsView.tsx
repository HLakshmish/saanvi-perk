"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Play,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  FileText,
  DollarSign,
  CreditCard,
  Building2,
  Search,
  Filter,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Payslip } from "../types/payroll.types";
import { getPayslips, generateMonthlyPayroll, updatePayslipStatus } from "../api/payroll.api";
import { PayslipModal } from "./PayslipModal";
import { snackbar as toast } from "@/components/ui/snackbar";

interface PayslipsViewProps {
  currentRole?: string;
  currentUserId?: number;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const PayslipsView: React.FC<PayslipsViewProps> = ({
  currentRole = "admin",
  currentUserId,
}) => {
  const isEmployee = currentRole === "employee";
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activePayslip, setActivePayslip] = useState<Payslip | null>(null);

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        month: selectedMonth,
        year: selectedYear,
      };
      if (statusFilter !== "All") {
        filters.status = statusFilter;
      }
      if (isEmployee && currentUserId) {
        filters.userId = currentUserId;
      }

      const res = await getPayslips(filters);
      if (res.success && res.data) {
        setPayslips(res.data);
      } else {
        setPayslips([]);
      }
    } catch {
      toast.show("Failed to fetch payslips", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [selectedMonth, selectedYear, statusFilter, isEmployee, currentUserId]);

  const handleGeneratePayroll = async () => {
    if (
      !confirm(
        `Are you sure you want to run monthly payroll for ${
          MONTHS.find((m) => m.value === selectedMonth)?.label
        } ${selectedYear}? This will generate and store payslips in the database for all active employees.`
      )
    ) {
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateMonthlyPayroll({
        month: selectedMonth,
        year: selectedYear,
      });

      if (res.success) {
        toast.show(
          `Successfully generated ${res.data?.count || 0} payslips for this cycle!`,
          "success"
        );
        fetchPayslips();
      } else {
        toast.show(res.error || "Failed to generate monthly payroll", "error");
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to run payroll", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsPaid = async (payslipId: number) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await updatePayslipStatus(payslipId, "PAID", today);
      if (res.success) {
        toast.show("Payslip marked as PAID successfully!", "success");
        fetchPayslips();
      } else {
        toast.show(res.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to update status", "error");
    }
  };

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

  // Summary Metrics
  const totalGross = payslips.reduce((acc, p) => acc + (parseFloat(String(p.gross_earned)) || 0), 0);
  const totalDeductions = payslips.reduce((acc, p) => acc + (parseFloat(String(p.total_deductions)) || 0), 0);
  const totalNet = payslips.reduce((acc, p) => acc + (parseFloat(String(p.net_pay)) || 0), 0);

  const filteredPayslips = payslips.filter((p) => {
    if (!searchQuery) return true;
    const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    const code = (p.employee_code || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Month, Year & Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-brand-primary" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="GENERATED">Generated</option>
              <option value="PAID">Paid</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
        </div>

        {/* Action Button: Run Payroll (Admin/SuperAdmin only) */}
        {!isEmployee && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePayroll}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isGenerating ? "Processing Payroll..." : "Run Monthly Payroll"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Metric Cards (Admin/HR view) */}
      {!isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Total Gross Disbursed</span>
              <DollarSign className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(totalGross)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{payslips.length} Employees Processed</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Statutory Deductions</span>
              <CreditCard className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-rose-600 mt-2">{formatCurrency(totalDeductions)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">EPF, ESI & Professional Tax</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-100">
              <span>Total Net Disbursed</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xl font-black text-white mt-2">{formatCurrency(totalNet)}</div>
            <div className="text-[11px] text-emerald-100 mt-0.5">Actual Bank Transfer Total</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Payroll Status</span>
              <Clock className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {payslips.filter((p) => p.payment_status === "PAID").length} / {payslips.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Disbursed Successfully</div>
          </div>
        </div>
      )}

      {/* Payslips Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">
            Payslips — {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-xs">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4 text-center">Paid Days</th>
                <th className="py-3 px-4 text-right">Gross Earned</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right font-black text-emerald-700">Net Pay</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Loading payslips...
                  </td>
                </tr>
              ) : filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-600 font-semibold text-sm">No payslips found for this period</p>
                    {!isEmployee && (
                      <p className="text-slate-400 text-xs mt-1">
                        Click &quot;Run Monthly Payroll&quot; to generate payslips for all active employees.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((p) => {
                  const empName =
                    `${p.first_name || ""} ${p.last_name || ""}`.trim() || `User #${p.user_id}`;
                  const isPaid = p.payment_status === "PAID";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">{empName}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.employee_code || "EMP"} • {p.official_email || "N/A"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {p.designation_name || "Employee"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {p.paid_days} / {p.working_days}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(p.gross_earned)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                        -{formatCurrency(p.total_deductions)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                        {formatCurrency(p.net_pay)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActivePayslip(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-brand-primary hover:text-white transition-all text-slate-700 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Payslip</span>
                          </button>

                          {!isEmployee && !isPaid && (
                            <button
                              onClick={() => handleMarkAsPaid(p.id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all text-emerald-700 border border-emerald-200 cursor-pointer"
                              title="Mark Disbursed as Paid"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Payslip Modal */}
      <PayslipModal payslip={activePayslip} onClose={() => setActivePayslip(null)} />
    </div>
  );
};
