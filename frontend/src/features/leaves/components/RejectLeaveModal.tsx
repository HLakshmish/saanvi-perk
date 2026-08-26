import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";

interface RejectLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rejectionReason: string, remarks: string) => Promise<boolean>;
}

export const RejectLeaveModal: React.FC<RejectLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsgState] = useState<string | null>(null);

  const setErrorMsg = (msg: string | null) => {
    setErrorMsgState(msg);
    if (msg) toast.error(msg);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setErrorMsg("Rejection reason is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const success = await onSubmit(rejectionReason.trim(), remarks.trim());
      if (success) {
        setRejectionReason("");
        setRemarks("");
        onClose();
      } else {
        setErrorMsg("Failed to update status. Make sure the role has MANAGE_LEAVE_REQUESTS permission.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[480px] overflow-hidden flex flex-col relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1 rounded-full text-rose-500 hover:bg-rose-50 transition-all cursor-pointer z-10 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-rose-800 tracking-tight">
            Reject Leave Request
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Specify why you are rejecting this employee's leave request.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Project critical delivery this week"
              disabled={isSubmitting}
              className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Remarks / Comments (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide any additional comments here..."
              rows={3}
              disabled={isSubmitting}
              className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs transition-all placeholder:text-slate-400 font-medium resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 bg-white hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
              <span>Reject Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};
