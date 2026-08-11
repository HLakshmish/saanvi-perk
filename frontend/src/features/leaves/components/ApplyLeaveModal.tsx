import React, { useState } from "react";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { ApplyLeaveInput } from "../types/leaves.types";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplyLeaveInput) => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [leaveType, setLeaveType] = useState("Sick Leave / Casual Leave");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [fromDate, setFromDate] = useState("05.08.2026");
  const [toDate, setToDate] = useState("05.08.2026");
  const [reason, setReason] = useState("");
  const [notifyOthers, setNotifyOthers] = useState("");
  const [reliever, setReliever] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      leaveType,
      isHalfDay,
      fromDate,
      toDate,
      reason: reason || "Personal Reason",
      notifyOthers,
      reliever,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[640px] overflow-hidden flex flex-col relative animate-scale-in">
        {/* Close Button with red/orange highlight */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-rose-500 hover:bg-rose-50 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#013e37] tracking-tight">
            Apply Leave
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Fill out details to initiate your leave application.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Leave Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all cursor-pointer"
                >
                  <option value="Sick Leave / Casual Leave">
                    Sick Leave / Casual Leave
                  </option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Comp-Off">Comp-Off</option>
                  <option value="Loss of Pay">Loss of Pay</option>
                </select>
              </div>

              {/* Half Day Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#013e37] focus:ring-[#013e37]/20 cursor-pointer"
                />
                <label
                  htmlFor="halfDay"
                  className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                >
                  Half Day
                </label>
              </div>

              {/* From Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  From Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all"
                  />
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Notify Others (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Notify Others (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={notifyOthers}
                    onChange={(e) => setNotifyOthers(e.target.value)}
                    placeholder="Search name..."
                    className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all placeholder:text-slate-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter leave reason..."
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Spacer for alignment with Half Day checkbox */}
              <div className="h-6 hidden md:block" />

              {/* To Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  To Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all"
                  />
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Reliever (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Reliever (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={reliever}
                    onChange={(e) => setReliever(e.target.value)}
                    placeholder="Search reliever..."
                    className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs transition-all placeholder:text-slate-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
