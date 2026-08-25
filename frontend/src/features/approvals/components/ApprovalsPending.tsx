"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, CheckCircle2, XCircle, Clock, Eye, Calendar, User, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { UnifiedApprovalItem } from "../types/approvals.types";
import { fetchAllApprovals } from "../api/approvals.api";
import { ApprovalActionModal } from "./ApprovalActionModal";
import { ApprovalDetailsModal } from "./ApprovalDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";

interface ApprovalsPendingProps {
  onDataChanged?: () => void;
}

export const ApprovalsPending: React.FC<ApprovalsPendingProps> = ({ onDataChanged }) => {
  const [items, setItems] = useState<UnifiedApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "LEAVE" | "REIMBURSEMENT">("ALL");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

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
      // Filter for actionable pending items
      setItems(res.data.filter((i) => i.status === "PENDING" || i.status === "UNDER_REVIEW"));
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

  const handleRowClick = (item: UnifiedApprovalItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (typeFilter !== "ALL" && item.moduleType !== typeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.employeeName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, typeFilter, searchQuery]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-brand-primary">Pending Approvals</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Review and approve leave applications and reimbursement claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh list"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-primary" : ""}`} />
          </button>

          {/* Type Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-2 text-xs font-bold border border-slate-300 rounded-xl px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
            >
              <span>{typeFilter === "ALL" ? "All Types" : typeFilter === "LEAVE" ? "Leaves Only" : "Reimbursements"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showTypeDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                {[
                  { key: "ALL", label: "All Types" },
                  { key: "LEAVE", label: "Leaves Only" },
                  { key: "REIMBURSEMENT", label: "Reimbursements" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTypeFilter(t.key as any);
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${
                      typeFilter === t.key ? "text-brand-primary bg-brand-primary-light" : "text-slate-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by employee, category or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs font-medium"
        />
      </div>

      {/* Main List Table / Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 animate-pulse flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-36" />
                  <div className="h-2.5 bg-slate-200 rounded w-24" />
                </div>
              </div>
              <div className="h-8 bg-slate-200 rounded-xl w-32" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-50/40">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary-light border border-brand-primary/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">All caught up!</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm">
            {searchQuery || typeFilter !== "ALL"
              ? "No pending approvals match your search criteria."
              : "There are no pending approval requests waiting for your review."}
          </p>
        </div>
      ) : (
        /* Request Cards List */
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {filteredItems.length} Request{filteredItems.length !== 1 ? "s" : ""} Pending
          </p>

          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                onClick={() => handleRowClick(item)}
              >
                {/* Left: Employee and Basic Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                    {item.employeeName.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-brand-primary transition-colors">
                        {item.employeeName}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          item.moduleType === "LEAVE"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.moduleType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                      <span className="font-bold text-slate-700">{item.category}</span>
                      <span>·</span>
                      <span className="font-extrabold text-brand-primary">{item.amountOrDays}</span>
                      <span>·</span>
                      <span>{item.periodOrDate}</span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-1 italic text-slate-600">
                      &ldquo;{item.reason}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div
                  className="flex items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleRowClick(item)}
                    title="View Details"
                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary-light rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleActionClick(item, "REJECT")}
                    className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => handleActionClick(item, "APPROVE")}
                    className="px-4 py-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal (Approve / Reject) */}
      <ApprovalActionModal
        isOpen={isActionModalOpen}
        item={actionItem}
        actionType={actionType}
        onClose={() => {
          setIsActionModalOpen(false);
          setActionItem(null);
        }}
        onSuccess={() => {
          loadData();
          onDataChanged?.();
        }}
      />

      {/* Details Modal */}
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
