"use client";

import React from "react";
import { ChevronRight, Plus, Loader2, ShieldAlert } from "lucide-react";
import { Expense } from "@/features/expenses/types/expenses.types";

interface ExpenseSummaryProps {
  isLoading: boolean;
  hasError: boolean;
  expensesStats: {
    submitted: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  expenses: Expense[];
  onViewExpenses: () => void;
  onSubmitExpense: () => void;
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  isLoading,
  hasError,
  expensesStats,
  expenses,
  onViewExpenses,
  onSubmitExpense,
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-250";
      default:
        return "bg-amber-50 text-amber-700 border-amber-250";
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#013e37] text-xs sm:text-sm">Expenses / Reimbursements</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Live claim totals for your profile</p>
        </div>
        {!hasError && (
          <button 
            onClick={onViewExpenses}
            className="text-[10px] font-bold text-[#013e37] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View Expenses</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-[#013e37] animate-spin" />
          <span className="text-[11px] text-slate-400 font-semibold">Loading stats...</span>
        </div>
      ) : hasError ? (
        <div className="py-8 px-4 border border-amber-100 rounded-xl bg-amber-50/45 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Reimbursements Restricted</h4>
            <p className="text-[10px] text-slate-500 max-w-[280px] leading-relaxed">
              Your account permissions do not permit viewing reimbursement summaries (missing `VIEW_REIMBURSEMENT`). Other dashboard features remain fully functional.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2.5 mb-5">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Submitted</p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">₹{expensesStats.submitted}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-center">
              <p className="text-[8px] sm:text-[9px] text-amber-600 font-bold uppercase tracking-wider">Pending</p>
              <p className="text-xs sm:text-sm font-extrabold text-amber-950 mt-1">₹{expensesStats.pending}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center">
              <p className="text-[8px] sm:text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Approved</p>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-1">₹{expensesStats.approved}</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-center">
              <p className="text-[8px] sm:text-[9px] text-rose-600 font-bold uppercase tracking-wider">Rejected</p>
              <p className="text-xs sm:text-sm font-extrabold text-rose-950 mt-1">₹{expensesStats.rejected}</p>
            </div>
          </div>

          {/* Recent Reimbursements */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-900 tracking-wide uppercase">Recent Claims</h4>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {expenses.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-[#013e37]/20 bg-slate-50/50 hover:bg-[#013e37]/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate">{item.category}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {item.submittedDate ? new Date(item.submittedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
                      {item.merchant ? ` • ${item.merchant}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-extrabold text-slate-900">₹{item.amount}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}

              {expenses.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                  No reimbursement claims found.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onSubmitExpense}
            className="w-full mt-4 py-2 border border-[#013e37]/20 text-[#013e37] hover:bg-[#013e37]/5 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Expense</span>
          </button>
        </>
      )}
    </div>
  );
};
