"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import {
  createAttendanceRequest,
  AttendanceRequestPayload,
} from "../api/attendance.api";

interface AttendanceRegularizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: Date | null;
  currentCheckIn?: string | null;
  currentCheckOut?: string | null;
  currentStatusLabel?: string;
}

export const AttendanceRegularizeModal: React.FC<AttendanceRegularizeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  currentCheckIn,
  currentCheckOut,
  currentStatusLabel,
}) => {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState<
    "ON_DUTY" | "FORGOT_ID" | "BUSINESS_TOUR" | "NEW_JOINEE" | "OTHERS"
  >("FORGOT_ID");
  const [checkInTime, setCheckInTime] = useState("09:30");
  const [checkOutTime, setCheckOutTime] = useState("18:30");
  const [isNextDay, setIsNextDay] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form fields when opening modal
  useEffect(() => {
    if (isOpen && selectedDate) {
      if (currentCheckIn) {
        try {
          const d = new Date(currentCheckIn);
          if (!isNaN(d.getTime())) {
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            setCheckInTime(`${hh}:${mm}`);
          } else {
            setCheckInTime("09:30");
          }
        } catch {
          setCheckInTime("09:30");
        }
      } else {
        setCheckInTime("09:30");
      }

      if (currentCheckOut) {
        try {
          const d = new Date(currentCheckOut);
          if (!isNaN(d.getTime())) {
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            setCheckOutTime(`${hh}:${mm}`);
          } else {
            setCheckOutTime("18:30");
          }
        } catch {
          setCheckOutTime("18:30");
        }
      } else {
        setCheckOutTime("18:30");
      }

      setReason("FORGOT_ID");
      setIsNextDay(false);
      setRemarks("");
    }
  }, [isOpen, selectedDate, currentCheckIn, currentCheckOut]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !selectedDate) return null;

  const dateFormatted = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!remarks.trim()) {
      toast.error("Please enter a brief remark explaining the request.");
      return;
    }

    setIsSubmitting(true);
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      const [inH, inM] = checkInTime.split(":").map(Number);
      const [outH, outM] = checkOutTime.split(":").map(Number);

      // 1. Shift Date is a pure calendar date (set to UTC midnight so day never shifts):
      const shiftDateUtc = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

      // 2. Check-In & Check-Out times are constructed from local time inputs:
      const inDateLocal = new Date(year, month, day, inH || 9, inM || 0, 0, 0);
      const outDateLocal = new Date(year, month, isNextDay ? day + 1 : day, outH || 18, outM || 0, 0, 0);

      const payload: AttendanceRequestPayload = {
        shiftDate: shiftDateUtc.toISOString(),
        reason,
        checkInTime: inDateLocal.toISOString(),
        checkOutTime: outDateLocal.toISOString(),
        isNextDay,
        remarks: remarks.trim(),
      };

      const res = await createAttendanceRequest(payload);

      if (res.success) {
        toast.success("Attendance regularization request submitted successfully! Admin will review.");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || res.error || "Failed to submit attendance request.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred while submitting request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Regularize Attendance
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                Submit a correction request to your admin for approval
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Target Date Card */}
          <div className="p-3.5 rounded-2xl bg-brand-primary-light/40 border border-brand-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-primary block">
                  Selected Date
                </span>
                <span className="font-extrabold text-slate-900 text-xs">
                  {dateFormatted}
                </span>
              </div>
            </div>

            {currentStatusLabel && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700 shadow-2xs">
                Current: {currentStatusLabel}
              </span>
            )}
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Reason for Regularization <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e: any) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-brand-primary cursor-pointer text-xs"
            >
              <option value="FORGOT_ID">Forgot ID / Clock-In Tech Issue</option>
              <option value="ON_DUTY">On Duty / Client Visit</option>
              <option value="BUSINESS_TOUR">Business Tour / Official Travel</option>
              <option value="NEW_JOINEE">New Joinee Regularization</option>
              <option value="OTHERS">Other Reason</option>
            </select>
          </div>

          {/* Times Grid: Proposed Check In & Check Out */}
          <div className="grid grid-cols-2 gap-3">
            {/* Check In */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Proposed Check In <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-brand-primary text-xs cursor-pointer"
              />
            </div>

            {/* Check Out */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Proposed Check Out <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-brand-primary text-xs cursor-pointer"
              />
            </div>
          </div>

          {/* Next Day Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="isNextDay"
              checked={isNextDay}
              onChange={(e) => setIsNextDay(e.target.checked)}
              className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary cursor-pointer"
            />
            <label
              htmlFor="isNextDay"
              className="text-[11px] font-semibold text-slate-600 cursor-pointer select-none"
            >
              Check-out was on the next calendar day (Night Shift)
            </label>
          </div>

          {/* Remarks / Justification */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>
                Explanation / Note <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] font-normal text-slate-400">
                Required for admin approval
              </span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Worked at client location from 9:30 AM to 6:30 PM due to on-site sprint demo."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary text-xs resize-none"
            />
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-primary text-brand-btn-text hover:opacity-90 font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};
