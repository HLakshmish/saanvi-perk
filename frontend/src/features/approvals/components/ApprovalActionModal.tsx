"use client";

import React, { useState } from "react";
import { UnifiedApprovalItem } from "../types/approvals.types";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateApprovalStatus } from "../api/approvals.api";

interface ApprovalActionModalProps {
  isOpen: boolean;
  item: UnifiedApprovalItem | null;
  actionType: "APPROVE" | "REJECT";
  onClose: () => void;
  onSuccess: () => void;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  isOpen,
  item,
  actionType,
  onClose,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const isApprove = actionType === "APPROVE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isApprove && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateApprovalStatus(item, {
        status: isApprove ? "APPROVED" : "REJECTED",
        remarks: remarks.trim() || undefined,
        rejectionReason: !isApprove ? rejectionReason.trim() : undefined,
      });

      if (res.success) {
        toast.success(
          isApprove
            ? `${item.category} approved successfully!`
            : `${item.category} request rejected.`
        );
        onSuccess();
        onClose();
        setRemarks("");
        setRejectionReason("");
      } else {
        toast.error(res.error || "Failed to update approval status.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`p-5 flex items-center gap-3.5 border-b ${
            isApprove
              ? "bg-emerald-50/70 border-emerald-100 text-emerald-950"
              : "bg-rose-50/70 border-rose-100 text-rose-950"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${
              isApprove
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {isApprove ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-base leading-tight">
              {isApprove ? "Approve Request" : "Reject Request"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {item.employeeName} · {item.category}
            </p>
          </div>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Request Type:</span>
              <span className="font-bold text-slate-900">{item.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Value / Duration:</span>
              <span className="font-extrabold text-brand-primary">
                {item.amountOrDays}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Period / Date:</span>
              <span className="font-bold text-slate-900">{item.periodOrDate}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-xs">
              <span className="text-slate-500 font-semibold block mb-0.5">Reason:</span>
              <p className="text-slate-700 font-medium italic line-clamp-2">
                &ldquo;{item.reason}&rdquo;
              </p>
            </div>
          </div>

          {!isApprove && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Specify why this request is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none shadow-2xs font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="Add any additional notes for the employee..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-extrabold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isApprove
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isApprove ? "Confirm Approval" : "Confirm Rejection"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
