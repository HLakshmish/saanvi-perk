"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, XCircle, Clock, ArrowUpRight, Check, X, RefreshCw, Eye } from "lucide-react";
import { UnifiedApprovalItem, ApprovalStats } from "../types/approvals.types";
import { fetchAllApprovals } from "../api/approvals.api";
import { ApprovalActionModal } from "./ApprovalActionModal";
import { ApprovalDetailsModal } from "./ApprovalDetailsModal";

interface ApprovalsInsightsProps {
  onNavigateToTab?: (tab: "pending" | "completed") => void;
}

export const ApprovalsInsights: React.FC<ApprovalsInsightsProps> = ({ onNavigateToTab }) => {
  const [stats, setStats] = useState<ApprovalStats>({
    total: 0,
    pending: 0,
    completed: 0,
    approved: 0,
    rejected: 0,
    leavesPending: 0,
    reimbursementsPending: 0,
  });
  const [recentPending, setRecentPending] = useState<UnifiedApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<UnifiedApprovalItem | null>(null);
  const [actionItem, setActionItem] = useState<UnifiedApprovalItem | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const res = await fetchAllApprovals();
    if (res.success && res.data) {
      setStats(res.stats);
      setRecentPending(
        res.data.filter((i) => i.status === "PENDING" || i.status === "UNDER_REVIEW").slice(0, 5)
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActionClick = (item: UnifiedApprovalItem, type: "APPROVE" | "REJECT") => {
    setActionItem(item);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Row 1: 3 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Approvals */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Requests
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              All Time
            </span>
          </div>

          <div className="my-2">
            <span className="text-4xl sm:text-5xl font-black text-brand-primary">
              {isLoading ? "--" : stats.total}
            </span>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Total Approvals Received
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Pending
              </span>
              <span className="font-extrabold text-amber-600">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Completed
              </span>
              <span className="font-extrabold text-emerald-600">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Action
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              Awaiting Review
            </span>
          </div>

          <div className="my-2">
            <span className="text-4xl sm:text-5xl font-black text-amber-600">
              {isLoading ? "--" : stats.pending}
            </span>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Requires Manager / Admin Action
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Leave Applications:</span>
              <span className="font-bold text-slate-900">{stats.leavesPending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Expense Claims:</span>
              <span className="font-bold text-slate-900">{stats.reimbursementsPending}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Completion Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resolution Stats
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Processed
            </span>
          </div>

          <div className="my-2">
            <span className="text-4xl sm:text-5xl font-black text-emerald-600">
              {isLoading ? "--" : stats.completed}
            </span>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Total Decisions Recorded
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Approved
              </span>
              <span className="font-extrabold text-emerald-600">{stats.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                Rejected
              </span>
              <span className="font-extrabold text-rose-600">{stats.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Recent Pending Approvals Quick Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-primary">Quick Pending Queue</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review and act on urgent pending requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh"
              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-primary" : ""}`} />
            </button>

            {onNavigateToTab && stats.pending > 5 && (
              <button
                onClick={() => onNavigateToTab("pending")}
                className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({stats.pending})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 animate-pulse flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 rounded w-28" />
                    <div className="h-2 bg-slate-200 rounded w-20" />
                  </div>
                </div>
                <div className="h-7 bg-slate-200 rounded-xl w-24" />
              </div>
            ))}
          </div>
        ) : recentPending.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">No pending approvals</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              All employee leave and expense requests are up to date!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
            {recentPending.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setIsDetailsModalOpen(true);
                }}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                    {item.employeeName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-xs leading-tight group-hover:text-brand-primary transition-colors">
                        {item.employeeName}
                      </h4>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.moduleType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                      {item.category} · <span className="font-extrabold text-brand-primary">{item.amountOrDays}</span> · {item.periodOrDate}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 shrink-0 self-end sm:self-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailsModalOpen(true);
                    }}
                    title="View details"
                    className="p-1.5 text-slate-400 hover:text-brand-primary rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleActionClick(item, "REJECT")}
                    className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleActionClick(item, "APPROVE")}
                    className="px-3.5 py-1 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ApprovalActionModal
        isOpen={isActionModalOpen}
        item={actionItem}
        actionType={actionType}
        onClose={() => {
          setIsActionModalOpen(false);
          setActionItem(null);
        }}
        onSuccess={loadData}
      />

      <ApprovalDetailsModal
        isOpen={isDetailsModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedItem(null);
        }}
        onApprove={(item) => handleActionClick(item, "APPROVE")}
        onReject={(item) => handleActionClick(item, "REJECT")}
      />
    </div>
  );
};
