"use client";

import React from "react";
import { UnifiedApprovalItem } from "../types/approvals.types";
import { X, Calendar, User, FileText, CheckCircle2, XCircle, Clock, Receipt, Download } from "lucide-react";

interface ApprovalDetailsModalProps {
  isOpen: boolean;
  item: UnifiedApprovalItem | null;
  onClose: () => void;
  onApprove?: (item: UnifiedApprovalItem) => void;
  onReject?: (item: UnifiedApprovalItem) => void;
}

export const ApprovalDetailsModal: React.FC<ApprovalDetailsModalProps> = ({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !item) return null;

  const isPending = item.status === "PENDING" || item.status === "UNDER_REVIEW";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-sm shadow-xs">
              {item.employeeName.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {item.employeeName} · Applied on {item.requestDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-50/70 border-slate-200/80">
            <div className="flex items-center gap-2">
              {item.status === "APPROVED" || item.status === "PAID" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : item.status === "REJECTED" ? (
                <XCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
              <span className="font-bold text-slate-700">Status</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full font-black text-[10px] tracking-wider uppercase ${
                item.status === "APPROVED" || item.status === "PAID"
                  ? "bg-emerald-100 text-emerald-800"
                  : item.status === "REJECTED"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {item.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">Module</span>
              <span className="font-extrabold text-slate-900 capitalize">
                {item.moduleType.toLowerCase()}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">Type</span>
              <span className="font-extrabold text-slate-900">{item.category}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">Value</span>
              <span className="font-extrabold text-brand-primary text-sm">
                {item.amountOrDays}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">Date / Period</span>
              <span className="font-extrabold text-slate-900">{item.periodOrDate}</span>
            </div>
          </div>

          {/* Reason Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-slate-500 font-bold block mb-1">Reason / Description</span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {item.reason}
            </p>
          </div>

          {/* Rejection / Remarks if available */}
          {item.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <span className="text-rose-700 font-bold block mb-1">Rejection Reason</span>
              <p className="text-rose-900 font-medium">{item.rejectionReason}</p>
            </div>
          )}

          {item.remarks && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-slate-500 font-bold block mb-1">Remarks</span>
              <p className="text-slate-700 font-medium">{item.remarks}</p>
            </div>
          )}

          {/* Bills / Attachments */}
          {item.bills && item.bills.length > 0 && (
            <div className="space-y-2">
              <span className="text-slate-700 font-bold block">Attached Receipts & Bills</span>
              <div className="space-y-1.5">
                {item.bills.map((bill) => (
                  <div
                    key={bill.billId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Receipt className="w-4 h-4 text-brand-primary shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {bill.fileName || `Bill #${bill.billId}`}
                      </span>
                    </div>
                    <span className="font-extrabold text-brand-primary shrink-0 ml-2">
                      ₹{Number(bill.billAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          {isPending && onReject && (
            <button
              onClick={() => {
                onClose();
                onReject(item);
              }}
              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
            >
              Reject
            </button>
          )}
          {isPending && onApprove && (
            <button
              onClick={() => {
                onClose();
                onApprove(item);
              }}
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
