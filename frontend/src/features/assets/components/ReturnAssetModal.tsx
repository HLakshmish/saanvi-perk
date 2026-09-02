"use client";

import React, { useState, useEffect } from "react";
import { AssetAssignment, ReturnAssetInput } from "../types/assets.types";
import { updateAssignment, updateAsset } from "../api/assets.api";
import { X, RotateCcw, Check, Loader2 } from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";

interface ReturnAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignmentToReturn?: AssetAssignment | null;
}

export const ReturnAssetModal: React.FC<ReturnAssetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assignmentToReturn,
}) => {
  const [formData, setFormData] = useState<ReturnAssetInput>({
    returnedDate: new Date().toISOString().split("T")[0],
    conditionAtReturn: "Good Condition / Working",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsgState] = useState<string | null>(null);

  const setErrorMsg = (msg: string | null) => {
    setErrorMsgState(msg);
    if (msg) toast.error(msg);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        returnedDate: new Date().toISOString().split("T")[0],
        conditionAtReturn: "Good Condition / Working",
        remarks: "",
      });
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !assignmentToReturn) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.returnedDate && assignmentToReturn.assignedDate) {
      const assignDateStr = assignmentToReturn.assignedDate.includes("T")
        ? assignmentToReturn.assignedDate.split("T")[0]
        : assignmentToReturn.assignedDate;
      if (new Date(formData.returnedDate) < new Date(assignDateStr)) {
        const msg = `Return Date cannot be earlier than Assignment Date (${assignDateStr}).`;
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await updateAssignment(assignmentToReturn.assignmentId, formData);

      if (res.success) {
        const cond = formData.conditionAtReturn || "";
        if (cond.includes("Needs Repair") || cond.includes("Damaged")) {
          await updateAsset(assignmentToReturn.assetId, { assetStatus: "UNDER_REPAIR" });
        } else if (cond.includes("Defective") || cond.includes("Non-Functional")) {
          await updateAsset(assignmentToReturn.assetId, { assetStatus: "DAMAGED" });
        }

        toast.success("Asset return logged successfully!");
        onSuccess();
        onClose();
      } else {
        const msg = res.message || "Failed to process asset return";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred during asset return";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-primary">Return Asset</h2>
            <p className="text-xs text-slate-500 font-medium">
              Record return for <span className="font-bold text-slate-800">{assignmentToReturn.asset?.assetName || "Asset"}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Return Date */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Return Date *</label>
            <input
              type="date"
              required
              value={formData.returnedDate}
              onChange={(e) => setFormData({ ...formData, returnedDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          {/* Condition at Return */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Condition at Return *</label>
            <select
              required
              value={formData.conditionAtReturn || ""}
              onChange={(e) => setFormData({ ...formData, conditionAtReturn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
            >
              <option value="Good Condition / Working">Good Condition / Fully Working</option>
              <option value="Minor Wear / Scratches">Minor Wear / Cosmetic Scratches</option>
              <option value="Needs Repair / Damaged">Needs Repair / Damaged</option>
              <option value="Defective / Non-Functional">Defective / Non-Functional</option>
            </select>
          </div>

          {/* Return Remarks / Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Return Notes / Remarks</label>
            <textarea
              rows={3}
              value={formData.remarks || ""}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. All accessories (charger, mouse, cable) returned..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Check className="w-4 h-4 text-white" />
              )}
              <span>Confirm Return</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
