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
  Building2,
  Search,
  Filter,
  AlertCircle,
  TrendingUp,
  User,
  Trash2,
  Sparkles,
  Download,
} from "lucide-react";
import { Payslip, EmployeeSalaryStructure } from "../types/payroll.types";
import { downloadPayslipPdf } from "../utils/payslipPdf";
import {
  getPayslips,
  generateMonthlyPayroll,
  updatePayslipStatus,
  deletePayslip,
  getAllSalaryStructures,
} from "../api/payroll.api";
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
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  // Default to the last completed payroll month (e.g., September if current is October)
  const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const defaultYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [employees, setEmployees] = useState<EmployeeSalaryStructure[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Payslips are NOT displayed before the user selects employee, month, year, and clicks Generate
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  const isCurrentOrFutureMonth =
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedMonth >= currentMonth);
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activePayslip, setActivePayslip] = useState<Payslip | null>(null);

  // Load employee list for dropdown selection
  useEffect(() => {
    if (!isEmployee) {
      const loadEmployees = async () => {
        try {
          const res = await getAllSalaryStructures();
          if (res.success && res.data) {
            // Deduplicate users
            const unique = (res.data || []).filter(
              (emp, idx, arr) => arr.findIndex((x) => x.user_id === emp.user_id) === idx
            );
            setEmployees(unique);
          }
        } catch (err) {
          console.error("Failed to load employee list:", err);
        }
      };
      loadEmployees();
    }
  }, [isEmployee]);

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
      } else if (selectedEmployeeId && selectedEmployeeId !== "all") {
        filters.userId = Number(selectedEmployeeId);
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

  const handleGeneratePayroll = async () => {
    if (!isEmployee && !selectedEmployeeId) {
      toast.show("Please select an employee first (or choose 'All Employees').", "warning");
      return;
    }

    if (isCurrentOrFutureMonth) {
      toast.show(
        `Current month (${MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}) payslips cannot be generated. Payroll can only be generated for completed past months.`,
        "warning"
      );
      return;
    }

    const selectedEmp = employees.find((e) => String(e.user_id) === String(selectedEmployeeId));
    const targetLabel =
      selectedEmployeeId === "all"
        ? "all active employees"
        : selectedEmp
        ? `${selectedEmp.first_name} ${selectedEmp.last_name || ""}`.trim()
        : "the selected employee";

    const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label;

    if (
      !confirm(
        `Are you sure you want to generate payslip for ${targetLabel} for ${monthLabel} ${selectedYear}?`
      )
    ) {
      return;
    }

    setIsGenerating(true);
    try {
      const payload: any = {
        month: selectedMonth,
        year: selectedYear,
      };
      if (!isEmployee && selectedEmployeeId && selectedEmployeeId !== "all") {
        payload.userIds = [Number(selectedEmployeeId)];
      }

      const res = await generateMonthlyPayroll(payload);

      if (res.success) {
        if ((res.data?.count || 0) > 0) {
          toast.show(
            res.data?.message || `Successfully generated payslip for this cycle!`,
            "success"
          );
        } else {
          toast.show(
            res.data?.message ||
              "No payslips generated: Please check employee joining date or salary assignment.",
            "warning"
          );
        }
        setHasGenerated(true);
        fetchPayslips();
      } else {
        toast.show(res.error || "Failed to generate monthly payroll", "error");
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to generate payroll", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewRecords = () => {
    if (!isEmployee && !selectedEmployeeId) {
      toast.show("Please select an employee first (or choose 'All Employees').", "warning");
      return;
    }
    setHasGenerated(true);
    fetchPayslips();
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

  const handleDeletePayslip = async (payslipId: number, empName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the payslip for ${empName}? This will remove it from the system.`
      )
    ) {
      return;
    }

    try {
      const res = await deletePayslip(payslipId);
      if (res.success) {
        toast.show("Payslip deleted successfully", "success");
        fetchPayslips();
      } else {
        toast.show(res.error || "Failed to delete payslip", "error");
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to delete payslip", "error");
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

  const filteredPayslips = payslips.filter((p) => {
    if (!searchQuery) return true;
    const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    const code = (p.employee_code || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
  });

  const selectedEmpObj = employees.find((e) => String(e.user_id) === String(selectedEmployeeId));
  const selectedEmpLabel =
    selectedEmployeeId === "all"
      ? "All Employees"
      : selectedEmpObj
      ? `${selectedEmpObj.first_name} ${selectedEmpObj.last_name || ""}`.trim()
      : "";

  return (
    <div className="space-y-6">
      {/* Month, Year & Employee Selection Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Employee Dropdown (Admin / HR view) */}
          {!isEmployee && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <User className="w-4 h-4 text-brand-primary shrink-0" />
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setHasGenerated(false);
                }}
                className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="">-- Select Employee --</option>
                <option value="all">All Employees</option>
                {employees.map((emp) => {
                  const name = `${emp.first_name} ${emp.last_name || ""}`.trim();
                  const code = emp.employee_code ? `(${emp.employee_code})` : "";
                  return (
                    <option key={emp.user_id} value={emp.user_id}>
                      {name} {code}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Month Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setHasGenerated(false);
              }}
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
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setHasGenerated(false);
              }}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (visible only after generation/fetching) */}
          {hasGenerated && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  fetchPayslips();
                }}
                className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="GENERATED">Generated</option>
                <option value="PAID">Paid</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons: Generate Payslip / View Records */}
        <div className="flex items-center gap-2">
          {isCurrentOrFutureMonth ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Current Month in Progress</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGeneratePayroll}
                disabled={isGenerating || (!isEmployee && !selectedEmployeeId)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={!selectedEmployeeId && !isEmployee ? "Please select an employee first" : "Generate payslip"}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isGenerating ? "Generating..." : "Generate Payslip"}</span>
              </button>

              <button
                onClick={handleViewRecords}
                disabled={isLoading || (!isEmployee && !selectedEmployeeId)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="View existing records without regenerating"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>View</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STATE 1: DO NOT DISPLAY BEFORE SELECTION & GENERATE */}
      {!hasGenerated ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Generate Employee Payslip
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Please select an <span className="font-semibold text-slate-700">Employee</span>,{" "}
            <span className="font-semibold text-slate-700">Month</span>, and{" "}
            <span className="font-semibold text-slate-700">Year</span> from the options above, then click{" "}
            <span className="font-semibold text-brand-primary">&quot;Generate Payslip&quot;</span> to create and display the payslip.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleGeneratePayroll}
              disabled={isGenerating || (!isEmployee && !selectedEmployeeId)}
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isGenerating ? "Generating..." : "Generate Payslip"}</span>
            </button>

            <button
              onClick={handleViewRecords}
              disabled={isLoading || (!isEmployee && !selectedEmployeeId)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>View Existing Records</span>
            </button>
          </div>
        </div>
      ) : (
        /* STATE 2: DISPLAY AFTER SELECTION & GENERATE */
        <>
          {/* Payslips Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">
                  Payslips — {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </div>
                {selectedEmpLabel && (
                  <div className="text-xs text-brand-primary font-semibold mt-0.5">
                    Filter: {selectedEmpLabel}
                  </div>
                )}
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
                        {isCurrentOrFutureMonth ? (
                          <div>
                            <Clock className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                            <p className="text-slate-800 font-bold text-sm">
                              {isCurrentMonth ? "Current Month in Progress" : "Future Period"} —{" "}
                              {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                            </p>
                            <p className="text-slate-500 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
                              Payslips do not generate for the current ongoing month. Monthly payroll calculations are generated only after the month concludes.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                            <p className="text-slate-800 font-bold text-sm">
                              No payslip generated yet for {selectedEmpLabel || "this selection"} ({MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear})
                            </p>
                            <p className="text-slate-500 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
                              Payslips are only eligible from each employee&apos;s official joining date onwards, and require an assigned salary structure.
                            </p>
                            {!isEmployee && (
                              <div className="mt-4 flex items-center justify-center gap-2.5">
                                <button
                                  onClick={handleGeneratePayroll}
                                  disabled={isGenerating || (!isEmployee && !selectedEmployeeId)}
                                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-btn-text rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>{isGenerating ? "Generating..." : "Generate Payslip Now"}</span>
                                </button>
                              </div>
                            )}
                          </div>
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
                              {p.joining_date && (
                                <span className="ml-1 text-slate-500">
                                  • Joined:{" "}
                                  {new Date(p.joining_date).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
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
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Payslip Modal */}
                              <button
                                onClick={() => setActivePayslip(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-brand-primary hover:text-brand-btn-text transition-all text-slate-700 cursor-pointer"
                                title="View detailed payslip"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Payslip</span>
                              </button>

                              {/* Download PDF */}
                              <button
                                onClick={() => downloadPayslipPdf(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all text-indigo-700 border border-indigo-200 cursor-pointer shadow-2xs"
                                title="Download Payslip as PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>

                              {/* Mark Paid (Admin only) */}
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

                              {/* Delete Payslip (Admin only) */}
                              {!isEmployee && (
                                <button
                                  onClick={() => handleDeletePayslip(p.id, empName)}
                                  className="inline-flex items-center p-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
                                  title="Delete payslip"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
        </>
      )}

      {/* Formal Payslip Modal */}
      <PayslipModal payslip={activePayslip} onClose={() => setActivePayslip(null)} />
    </div>
  );
};
