"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { UnifiedApprovalItem } from "../types/approvals.types";
import { fetchAllApprovals } from "../api/approvals.api";
import { ApprovalDetailsModal } from "./ApprovalDetailsModal";

interface ApprovalsCompletedProps {
  onFilterClick?: () => void;
}

export const ApprovalsCompleted: React.FC<ApprovalsCompletedProps> = ({
  onFilterClick,
}) => {
  const [items, setItems] = useState<UnifiedApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState<"All" | "LEAVE" | "REIMBURSEMENT" | "ATTENDANCE">("All");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Select Date");
  const [selectedItem, setSelectedItem] = useState<UnifiedApprovalItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const approvalTypes: Array<"All" | "LEAVE" | "REIMBURSEMENT" | "ATTENDANCE"> = [
    "All",
    "LEAVE",
    "REIMBURSEMENT",
    "ATTENDANCE",
  ];

  const loadData = async () => {
    setIsLoading(true);
    const res = await fetchAllApprovals();
    if (res.success && res.data) {
      // Completed items
      setItems(
        res.data.filter(
          (i) =>
            i.status === "APPROVED" ||
            i.status === "REJECTED" ||
            i.status === "PAID" ||
            i.status === "CANCELLED"
        )
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type
      if (selectedType !== "All" && item.moduleType !== selectedType) {
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
  }, [items, selectedType, searchQuery]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6 min-h-[500px] flex flex-col">
      {/* Header Titles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-brand-primary">Completed Approvals</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Audit history of approved and rejected requests.
          </p>
        </div>

        <button
          onClick={loadData}
          title="Refresh list"
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-primary" : ""}`} />
        </button>
      </div>

      {/* Filter Row controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Name / Code input */}
        <div className="relative min-w-[220px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, category or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs font-medium"
          />
        </div>

        {/* Select Date button */}
        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 bg-white hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>{dateRange}</span>
        </button>

        {/* Filter button if available */}
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 bg-white hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        )}

        {/* Type Select Dropdown */}
        <div className="relative min-w-[150px]">
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="w-full flex items-center justify-between px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <span>{selectedType === "All" ? "All Modules" : selectedType}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showTypeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40">
              {approvalTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setShowTypeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${
                    selectedType === type ? "text-brand-primary bg-brand-primary-light" : "text-slate-700"
                  }`}
                >
                  {type === "All" ? "All Modules" : type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main List */}
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
              <div className="h-6 bg-slate-200 rounded-full w-20" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/40 rounded-2xl border border-slate-200/80">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">No completed approvals</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {searchQuery || selectedType !== "All"
              ? "No history matches your selected filter criteria."
              : "Completed approval actions will be archived and displayed here."}
          </p>
        </div>
      ) : (
        /* Table / History List */
        <div className="space-y-3 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {filteredItems.length} Record{filteredItems.length !== 1 ? "s" : ""}
          </p>

          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setIsDetailsOpen(true);
                }}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
              >
                {/* Left: Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm shadow-2xs shrink-0 group-hover:bg-brand-primary group-hover:text-brand-btn-text transition-colors">
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
                            : item.moduleType === "ATTENDANCE"
                            ? "bg-amber-100 text-amber-800"
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

                    {item.remarks && (
                      <p className="text-xs text-slate-500 font-medium mt-1 italic">
                        Remarks: &ldquo;{item.remarks}&rdquo;
                      </p>
                    )}
                    {item.rejectionReason && (
                      <p className="text-xs text-rose-600 font-medium mt-1 italic">
                        Reason: &ldquo;{item.rejectionReason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Status Pill & Date */}
                <div className="flex items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <div className="text-right text-[11px] text-slate-400 font-semibold">
                    <span>{item.approvedAt ? `Processed on ${item.approvedAt}` : `Requested on ${item.requestDate}`}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full font-black text-[10px] tracking-wider uppercase shrink-0 ${
                      item.status === "APPROVED" || item.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                        : item.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800 border border-rose-200/60"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.status}
                  </span>

                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={(range) => setDateRange(range)}
      />

      {/* Details Modal */}
      <ApprovalDetailsModal
        isOpen={isDetailsOpen}
        item={selectedItem}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
};
