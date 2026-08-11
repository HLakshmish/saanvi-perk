import React, { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { CompOffInput } from "../types/leaves.types";

interface RequestCompOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompOffInput) => void;
}

export const RequestCompOffModal: React.FC<RequestCompOffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [compensateDate, setCompensateDate] = useState("01 Aug 2026");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      compensateDate,
      reason: reason || "Worked on Republic Day",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[540px] overflow-hidden flex flex-col relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#013e37] tracking-tight">
            Request Comp-Off balance
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Your Comp-off balance will be added to leave balance after this request is approved.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Compensate for Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              <span className="text-rose-500 mr-1">*</span>Compensate for
            </label>
            <div className="relative">
              <input
                type="text"
                value={compensateDate}
                onChange={(e) => setCompensateDate(e.target.value)}
                placeholder="01 Aug 2026"
                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all"
              />
              <CalendarIcon className="w-4 h-4 text-[#013e37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Worked on Republic Day"
              className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 bg-white hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
