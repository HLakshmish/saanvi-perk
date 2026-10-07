"use client";

import React, { useState, useEffect } from "react";
import {
  Banknote,
  Download,
  Eye,
  Calendar,
  Filter,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Payslip } from "../types/payroll.types";
import { getPayslips } from "../api/payroll.api";
import { downloadPayslipPdf } from "../utils/payslipPdf";
import { PayslipModal } from "./PayslipModal";
import { snackbar as toast } from "@/components/ui/snackbar";

interface EmployeePayslipsViewProps {
  currentUserId?: number;
  currentUserName?: string;
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

export const EmployeePayslipsView: React.FC<EmployeePayslipsViewProps> = ({
  currentUserId,
  currentUserName,
}) => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePayslip, setActivePayslip] = useState<Payslip | null>(null);

  const fetchMyPayslips = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (currentUserId) {
        filters.userId = currentUserId;
      }
      if (selectedYear !== "all") {
        filters.year = Number(selectedYear);
      }
      if (selectedMonth !== "all") {
        filters.month = Number(selectedMonth);
      }

      const res = await getPayslips(filters);
      if (res.success && res.data) {
        setPayslips(res.data);
      } else {
        setPayslips([]);
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to load payslips", "error");
      setPayslips([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPayslips();
  }, [currentUserId, selectedYear, selectedMonth]);

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

  const filteredPayslips = payslips.filter((p) => {
    if (!searchQuery) return true;
    const monthName = (MONTHS.find((m) => m.value === p.month)?.label || "").toLowerCase();
    const yearStr = String(p.year);
    const query = searchQuery.toLowerCase().trim();
    return monthName.includes(query) || yearStr.includes(query);
  });

  const latestPayslip = payslips.length > 0 ? payslips[0] : null;

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-primary/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight">
              My Payslips
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              View your monthly salary statements and download official signed payslips in PDF format.
            </p>
          </div>
        </div>

        <button
          onClick={fetchMyPayslips}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
          title="Refresh payslip records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-primary" : "text-slate-500"}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Spotlight: Latest Payslip Card (if available) */}
      {latestPayslip && (
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary/5 via-white to-slate-50 border border-brand-primary/20 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-primary text-brand-btn-text">
                  Latest Available Payslip
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    latestPayslip.payment_status === "PAID"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {latestPayslip.payment_status || "GENERATED"}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {MONTHS.find((m) => m.value === latestPayslip.month)?.label} {latestPayslip.year}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                <span>
                  Gross: <strong className="text-slate-900">{formatCurrency(latestPayslip.gross_earned)}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Deductions: <strong className="text-rose-600">-{formatCurrency(latestPayslip.total_deductions)}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Paid Days: <strong className="text-slate-900">{latestPayslip.paid_days} / {latestPayslip.working_days}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right sm:pr-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Take Home Pay
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {formatCurrency(latestPayslip.net_pay)}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActivePayslip(latestPayslip)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => downloadPayslipPdf(latestPayslip)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-brand-btn-text font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Years</option>
              {[2027, 2026, 2025, 2024].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Filter className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search month or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Payslips History List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">
            Payslip History ({filteredPayslips.length})
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Sorted by most recent
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-brand-primary" />
            <p className="text-xs font-semibold">Loading your payslip records...</p>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Payslips Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No payslips have been generated for the selected period yet. Payslips are released at the end of each payroll cycle once processed by HR.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                  <th className="py-3.5 px-6">Salary Month</th>
                  <th className="py-3.5 px-4 text-center">Attendance</th>
                  <th className="py-3.5 px-4 text-right">Gross Earned</th>
                  <th className="py-3.5 px-4 text-right">Deductions</th>
                  <th className="py-3.5 px-4 text-right">Net Take Home</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayslips.map((p) => {
                  const monthName = MONTHS.find((m) => m.value === p.month)?.label || `Month ${p.month}`;
                  const isPaid = p.payment_status === "PAID";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {monthName} {p.year}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.designation_name || "Employee"} • {p.company_name || "NextGen Software"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        {p.paid_days} / {p.working_days} days
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(p.gross_earned)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-rose-600">
                        -{formatCurrency(p.total_deductions)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-emerald-700 text-sm">
                        {formatCurrency(p.net_pay)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {p.payment_status || "GENERATED"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActivePayslip(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 transition-all text-slate-700 cursor-pointer shadow-2xs"
                            title="View payslip on screen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => downloadPayslipPdf(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all text-indigo-700 border border-indigo-200 cursor-pointer shadow-2xs"
                            title="Download official payslip PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Detailed Modal View */}
      {activePayslip && (
        <PayslipModal
          payslip={activePayslip}
          onClose={() => setActivePayslip(null)}
        />
      )}
    </div>
  );
};
