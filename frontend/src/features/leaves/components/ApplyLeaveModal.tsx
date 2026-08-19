import React, { useState } from "react";
import { Calendar as CalendarIcon, Loader2, Search, X } from "lucide-react";
import { ApplyLeaveInput } from "../types/leaves.types";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplyLeaveInput) => Promise<boolean>;
  leaveTypes?: any[];
  employees?: any[];
}

interface LeaveType {
  leaveTypeId: number;
  leaveName: string;
  leaveCode: string;
}

function getUserRoleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
  return match ? match[1] : null;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveTypes = [],
  employees = [],
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const userRole = getUserRoleCookie();
  const isAdminOrSuperAdmin = userRole === "superadmin" || userRole === "admin";

  const [leaveTypeId, setLeaveTypeId] = useState<number>(0);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [reason, setReason] = useState("");


  // Employee Selection (for Apply on Behalf)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mappedEmployees = employees.map((emp: any) => ({
    id: Number(emp.id),
    name: emp.name,
  }));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole === "superadmin" && selectedEmployeeId === 0) {
      setErrorMsg("SuperAdmin must select a target employee to apply leave on behalf of.");
      return;
    }

    if (!leaveTypeId) {
      setErrorMsg("Please select a valid leave type.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setErrorMsg("From date cannot be after to date.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await onSubmit({
      leaveTypeId,
      isHalfDay,
      fromDate,
      toDate,
      reason: reason.trim() || "Personal Reason",
      userId: selectedEmployeeId > 0 ? selectedEmployeeId : undefined,
    });

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setLeaveTypeId(0);
      setSelectedEmployeeId(0);
      setIsHalfDay(false);
      setFromDate(todayStr);
      setToDate(todayStr);
      setReason("");
      onClose();
    } else {
      setErrorMsg("Failed to submit leave request. Please check validation rules.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[640px] overflow-hidden flex flex-col relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1 rounded-full text-rose-500 hover:bg-rose-50 transition-all cursor-pointer z-10 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-brand-primary tracking-tight">
            Apply Leave
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Fill out details to initiate your leave application.
          </p>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Employee Selector for Admin/SuperAdmin */}
          {isAdminOrSuperAdmin && (
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <label className="text-xs font-semibold text-slate-700 block">
                Apply on Behalf of (Employee) {userRole === "superadmin" && <span className="text-rose-500">*</span>}
              </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all cursor-pointer disabled:bg-slate-50"
                >
                  <option value="0">Select Employee</option>
                  {mappedEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Leave Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Leave Type
                </label>
                  <select
                    value={leaveTypeId}
                    onChange={(e) => setLeaveTypeId(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all cursor-pointer disabled:bg-slate-50"
                  >
                    <option value="0">Select Leave Type</option>
                    {leaveTypes.filter((t) => t.status !== false).map((t) => (
                      <option key={t.leaveTypeId} value={t.leaveTypeId}>
                        {t.leaveName} ({t.leaveCode})
                      </option>
                    ))}
                  </select>
              </div>

              {/* Half Day Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 cursor-pointer disabled:opacity-50"
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
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all disabled:bg-slate-50"
                  />
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
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter leave reason..."
                  disabled={isSubmitting}
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all placeholder:text-slate-400"
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
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>


            </div>
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
              className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-btn-text" />}
              <span>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
