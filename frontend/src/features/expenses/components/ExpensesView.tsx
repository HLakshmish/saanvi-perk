"use client";

import React, { useState, useEffect } from "react";
import {
  getExpenses,
  createExpense,
  updateExpenseStatus,
  getExpenseStats,
  getCurrentUserId,
  downloadBill,
} from "../api/expenses.api";
import { snackbar as toast } from "@/components/ui/snackbar";
import { Expense, ExpenseStats, ExpenseStatus } from "../types/expenses.types";
import {
  Search,
  ChevronDown,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Plus,
  FileText,
  AlertCircle,
  HelpCircle,
  Eye,
  Check,
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface ExpensesViewProps {
  currentRole?: string;
  currentUserName?: string;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  currentRole = "employee",
  currentUserName = "Sharanya",
}) => {
  // Authentication states
  const isEmployee = currentRole === "employee";
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  // Data states
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  // Summary Card Period state
  const [cardPeriod, setCardPeriod] = useState("All");

  // Trend Chart sliding window offset state
  const [trendOffset, setTrendOffset] = useState(0);

  // Modal and details states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [actionComments, setActionComments] = useState("");
  const [isActioning, setIsActioning] = useState(false);

  // Form state for new claim
  const [formData, setFormData] = useState({
    amount: "",
    category: "Travel",
    merchant: "",
    submittedDate: new Date().toISOString().split("T")[0],
    description: "",
    receiptFile: null as File | null,
    receiptFileName: "",
  });
  const [formError, setFormErrorState] = useState<string | null>(null);
  const [formSuccess, setFormSuccessState] = useState<string | null>(null);

  const setFormError = (msg: string | null) => {
    setFormErrorState(msg);
    if (msg) toast.error(msg);
  };

  const setFormSuccess = (msg: string | null) => {
    setFormSuccessState(msg);
    if (msg) toast.success(msg);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load expenses and stats
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const filters = {
        search: searchQuery,
        category: filterCategory,
        status: filterStatus,
        period: filterPeriod,
      };

      const [listRes, statsRes] = await Promise.all([
        getExpenses(filters),
        getExpenseStats(cardPeriod, trendOffset),
      ]);

      // If user is employee, filter table lists to show only their claims
      const listData = isEmployee && currentUserId
        ? listRes.filter((e) => e.userId === currentUserId)
        : listRes;

      setExpenses(listData);
      setStats(statsRes);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch expense records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, filterPeriod, filterStatus, filterCategory, cardPeriod, trendOffset, currentRole, currentUserId]);

  // Handle Approve/Reject Actions
  const handleStatusUpdate = async (expenseId: string, status: ExpenseStatus) => {
    if (!actionComments.trim()) {
      toast.error("Please provide comments before updating the claim status.");
      return;
    }

    setIsActioning(true);
    try {
      const res = await updateExpenseStatus(
        expenseId,
        status,
        actionComments.trim(),
        currentUserName
      );

      if (res.success) {
        toast.success(`Claim ${status.toLowerCase()} successfully!`);
        setSelectedExpense(null);
        setActionComments("");
        loadData();
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsActioning(false);
    }
  };

  // Handle new claim submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const amt = Number(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Expense amount must be a positive number.");
      return;
    }
    if (!formData.merchant.trim()) {
      setFormError("Merchant or Vendor name is required.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Brief description of the expense is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createExpense(
        {
          category: formData.category,
          amount: amt,
          merchant: formData.merchant.trim(),
          submittedDate: formData.submittedDate,
          description: formData.description.trim(),
          receiptFile: formData.receiptFile,
        },
        { userId: currentUserId || 1, name: currentUserName }
      );

      if (res.success) {
        setFormSuccess("Expense claim submitted successfully!");
        setFormData({
          amount: "",
          category: "Travel",
          merchant: "",
          submittedDate: new Date().toISOString().split("T")[0],
          description: "",
          receiptFile: null,
          receiptFileName: "",
        });
        setIsModalOpen(false);
        loadData();
      } else {
        setFormError(res.error || "Submission failed.");
      }
    } catch (err) {
      setFormError("Failed to submit claim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadBill = async (expense: Expense) => {
    if (!expense.billId) {
      toast.error("No bill attachment ID found for this claim.");
      return;
    }
    try {
      const blob = await downloadBill(expense.billId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = expense.receiptUrl || `bill_${expense.billId}.bin`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || "Failed to download bill receipt file.");
    }
  };

  // Trend Chart Label helper
  const getTrendLabel = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseYear = 2026;
    const baseMonthIndex = 7; // Aug 2026
    
    const getMonthYear = (offset: number) => {
      const totalMonths = baseMonthIndex + offset;
      let monthIdx = totalMonths % 12;
      let yearOffset = Math.floor(totalMonths / 12);
      if (monthIdx < 0) {
        monthIdx += 12;
      }
      return `${monthNames[monthIdx]} ${baseYear + yearOffset}`;
    };

    return `${getMonthYear(trendOffset - 5)} - ${getMonthYear(trendOffset)}`;
  };

  // SVG Chart points calculator
  const renderTrendChart = () => {
    if (!stats || !stats.monthlyTrend || stats.monthlyTrend.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-slate-400">
          No trend data available
        </div>
      );
    }

    const amounts = stats.monthlyTrend.map((t) => t.amount);
    const maxAmount = Math.max(...amounts, 1000); // Prevent divide by zero

    // SVG configurations
    const width = 300;
    const height = 110;
    const padding = 15;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const points = stats.monthlyTrend.map((t, idx) => {
      const x = padding + (idx / (stats.monthlyTrend.length - 1)) * chartWidth;
      const y = height - padding - (t.amount / maxAmount) * chartHeight;
      return { x, y, month: t.month, amount: t.amount };
    });

    const pathData = points.reduce((acc, p, idx) => {
      return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, "");

    const areaData = pathData
      ? `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : "";

    return (
      <div className="relative w-full h-full flex flex-col justify-between">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#013e37" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#013e37" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

          {/* Area Fill */}
          {areaData && <path d={areaData} fill="url(#trendGradient)" />}

          {/* Path Stroke */}
          {pathData && <path d={pathData} fill="none" stroke="#013e37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Point Circles */}
          {points.map((p, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              <circle cx={p.x} cy={p.y} r="3" fill="#013e37" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={p.x} cy={p.y} r="8" fill="#013e37" fillOpacity="0" className="hover:fill-opacity-10 transition-all" />
              <title>{`${p.month}: ₹${p.amount.toLocaleString()}`}</title>
            </g>
          ))}
        </svg>

        {/* Labels Row */}
        <div className="flex justify-between px-2.5 text-[9px] font-bold text-slate-400 pt-1 border-t border-slate-100">
          {points.map((p, idx) => (
            <span key={idx}>{p.month}</span>
          ))}
        </div>
      </div>
    );
  };

  // Check if this is a permission restriction error
  const isForbidden = errorMsg?.includes("Forbidden") || errorMsg?.includes("permission");

  if (isForbidden) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-brand-primary/15 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-primary tracking-tight">Expenses</h1>
            <p className="text-xs text-slate-500 font-medium">Reimbursement management dashboard</p>
          </div>
        </div>
        <div className="py-16 flex flex-col items-center justify-center gap-4 bg-white border border-amber-200/60 rounded-2xl shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          </div>
          <div className="text-center space-y-1.5 max-w-sm">
            <h2 className="text-sm font-bold text-slate-800">Access Restricted</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your current role does not include the <span className="font-bold text-slate-700">VIEW_REIMBURSEMENT</span> permission required to access expense records. Please contact your administrator to request access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-brand-primary/15 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-primary tracking-tight">Expenses</h1>
          <p className="text-xs text-slate-500 font-medium">Reimbursement management dashboard</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer border border-brand-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Claim</span>
        </button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Reimbursed amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Expenses</h3>
            <select
              value={cardPeriod}
              onChange={(e) => setCardPeriod(e.target.value)}
              className="text-[11px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
            </select>
          </div>

          <div className="my-auto">
            {stats && stats.totalAmount > 0 ? (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{stats.totalAmount.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">INR</span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400 italic py-2">
                No approved expenses
              </div>
            )}
            <p className="text-[11px] font-semibold text-slate-400 mt-1">Reimbursements paid out</p>
          </div>
        </div>

        {/* Card 2: Overview Requests Counts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-h-[170px]">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Overview</h3>

          <div className="grid grid-cols-3 gap-2.5 my-auto">
            <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-2 text-center flex flex-col justify-center">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total</span>
              <span className="text-lg font-black text-slate-800 mt-0.5">
                {stats ? stats.totalRequests : 0}
              </span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-2 text-center flex flex-col justify-center">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block">Approved</span>
              <span className="text-lg font-black text-emerald-700 mt-0.5">
                {stats ? stats.approvedCount : 0}
              </span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-2 text-center flex flex-col justify-center">
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block">Pending</span>
              <span className="text-lg font-black text-amber-700 mt-0.5">
                {stats ? stats.pendingCount : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
              <span>Expense Trend</span>
            </h3>
            
            {/* Shift controls */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 select-none">
              <button 
                type="button"
                onClick={() => setTrendOffset((prev) => prev - 1)}
                className="hover:text-brand-primary transition-colors p-0.5 cursor-pointer"
                title="Previous 6 Months"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="uppercase tracking-wider">
                {getTrendLabel()}
              </span>
              <button 
                type="button"
                onClick={() => setTrendOffset((prev) => Math.min(0, prev + 1))}
                className="hover:text-brand-primary transition-colors p-0.5 cursor-pointer"
                title="Next 6 Months"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-28 w-full flex items-end">
            {renderTrendChart()}
          </div>
        </div>
      </div>

      {/* Filters & Data Block */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs hover:shadow-xs transition-all min-h-[460px] flex flex-col justify-between relative">
        <div>
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search Input */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, merchant or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 text-sm placeholder:text-slate-400 shadow-2xs transition-all"
              />
            </div>

            {/* Period Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-brand-primary/15 rounded-xl px-3.5 py-2 hover:border-brand-primary/40 transition-colors">
              <span className="text-slate-400">Period:</span>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="bg-transparent border-none text-brand-primary outline-none font-bold cursor-pointer"
              >
                <option value="All">All</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-brand-primary/15 rounded-xl px-3.5 py-2 hover:border-brand-primary/40 transition-colors">
              <span className="text-slate-400">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none text-brand-primary outline-none font-bold cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-brand-primary/15 rounded-xl px-3.5 py-2 hover:border-brand-primary/40 transition-colors">
              <span className="text-slate-400">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent border-none text-brand-primary outline-none font-bold cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Travel">Travel</option>
                <option value="Food & Meals">Food & Meals</option>
                <option value="Equipment">Equipment</option>
                <option value="Software">Software</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          {/* Table Area */}
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
              <div className="h-12 bg-slate-50/50 animate-pulse rounded-xl" />
              <div className="h-12 bg-slate-50/50 animate-pulse rounded-xl" />
              <div className="h-12 bg-slate-50/50 animate-pulse rounded-xl" />
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
              <p className="text-sm font-semibold">{errorMsg}</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No Expenses Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                {searchQuery || filterCategory !== "All" || filterStatus !== "All"
                  ? "Try resetting filters or changing the search query."
                  : "No reimbursement requests registered yet."}
              </p>
            </div>
          ) : (
            <TableContainer className="rounded-2xl border-none shadow-none">
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Expense ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Action</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow
                      key={exp.id}
                      onClick={() => setSelectedExpense(exp)}
                    >
                      <TableCell className="font-extrabold text-slate-900 text-xs">
                        {exp.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm">{exp.employeeName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">ID: {exp.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/50">
                          {exp.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-500">
                        {exp.submittedDate}
                      </TableCell>
                      <TableCell className="font-black text-slate-900">
                        ₹{exp.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            exp.status === "Approved"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : exp.status === "Rejected"
                              ? "text-rose-700 bg-rose-50 border-rose-200"
                              : "text-amber-700 bg-amber-50 border-amber-200"
                          }`}
                        >
                          {exp.status === "Approved" && <Check className="w-2.5 h-2.5" />}
                          {exp.status === "Rejected" && <X className="w-2.5 h-2.5" />}
                          {exp.status === "Pending" && <Clock className="w-2.5 h-2.5" />}
                          <span>{exp.status}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="p-1 rounded-lg text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </div>

      {/* Claim Detail / Action Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[500px] max-h-[85vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-primary/15 bg-slate-50/50 flex justify-between items-center flex-none">
              <div>
                <h3 className="text-base font-bold text-brand-primary">Expense details ({selectedExpense.id})</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Submitted by {selectedExpense.employeeName}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedExpense(null);
                  setActionComments("");
                }}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-primary transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="text-sm font-bold text-slate-800">{selectedExpense.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Merchant / Vendor</span>
                  <span className="text-sm font-bold text-slate-800">{selectedExpense.merchant}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Submitted Date</span>
                  <span className="text-sm font-bold text-slate-800">{selectedExpense.submittedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Amount</span>
                  <span className="text-base font-bold text-brand-primary">₹{selectedExpense.amount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Description</span>
                <p className="text-xs text-slate-600 mt-1 font-medium bg-slate-50 border border-slate-100/70 p-3 rounded-xl leading-relaxed">
                  {selectedExpense.description}
                </p>
              </div>

              {selectedExpense.receiptUrl && (
                <div className="flex items-center gap-2 p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span className="text-xs font-bold text-brand-primary flex-1 truncate">{selectedExpense.receiptUrl}</span>
                  <button
                    onClick={() => handleDownloadBill(selectedExpense)}
                    className="text-[10px] font-bold text-brand-primary bg-white border border-brand-primary/20 rounded-md px-2 py-1 hover:bg-brand-primary/10 transition-all cursor-pointer"
                  >
                    View Bill
                  </button>
                </div>
              )}

              {selectedExpense.status !== "Pending" ? (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Response</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        selectedExpense.status === "Approved"
                          ? "text-emerald-700 bg-emerald-100/50"
                          : "text-rose-700 bg-rose-100/50"
                      }`}
                    >
                      {selectedExpense.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Approver / Reviewer</span>
                    <span className="text-xs font-bold text-slate-700">{selectedExpense.approvedBy} on {selectedExpense.approvedDate}</span>
                  </div>
                  {selectedExpense.comments && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Review Comments</span>
                      <p className="text-xs text-slate-600 italic mt-0.5">"{selectedExpense.comments}"</p>
                    </div>
                  )}
                </div>
              ) : (
                !isEmployee && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider block">
                      Approver / Review Comments
                    </label>
                    <textarea
                      placeholder="Explain approval or reason for rejection..."
                      value={actionComments}
                      onChange={(e) => setActionComments(e.target.value)}
                      rows={2}
                      className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary placeholder:text-slate-400"
                    />
                  </div>
                )
              )}
            </div>

            {/* Fixed Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-xs flex-none">
              {selectedExpense.status === "Pending" && !isEmployee ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedExpense.id, "Rejected")}
                    disabled={isActioning}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Claim</span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedExpense.id, "Approved")}
                    disabled={isActioning}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Claim</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedExpense(null);
                    setActionComments("");
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[500px] overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-brand-primary/15 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-brand-primary font-sans">Submit Expense Claim</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Enter reimbursement details</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 font-sans">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="Enter claim amount"
                    value={formData.amount}
                    onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs placeholder:text-slate-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Food & Meals">Food & Meals</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Software">Software</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">Merchant / Vendor *</label>
                  <input
                    type="text"
                    placeholder="e.g. Uber, Amazon"
                    value={formData.merchant}
                    onChange={(e) => setFormData((p) => ({ ...p, merchant: e.target.value }))}
                    className="w-full text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs placeholder:text-slate-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">Expense Date *</label>
                  <input
                    type="date"
                    value={formData.submittedDate}
                    onChange={(e) => setFormData((p) => ({ ...p, submittedDate: e.target.value }))}
                    className="w-full text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">Description / Business Purpose *</label>
                <textarea
                  placeholder="Explain why this expense was incurred..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">Receipt Bill / Attachment (Optional)</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50/50 transition-colors">
                  <input
                    type="file"
                    id="receiptUpload"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData((p) => ({
                        ...p,
                        receiptFile: file,
                        receiptFileName: file ? file.name : "",
                      }));
                    }}
                    className="hidden"
                  />
                  <label htmlFor="receiptUpload" className="cursor-pointer block">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-brand-primary hover:underline">Click to upload bill receipt</span>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </label>
                  {formData.receiptFileName && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{formData.receiptFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
