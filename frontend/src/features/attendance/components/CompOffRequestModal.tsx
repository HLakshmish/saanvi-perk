"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  Coffee,
} from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import { createCompOffRequest } from "../api/attendance.api";
import { getHolidays, HolidayRecord } from "@/features/organization/api/calendar.api";

function toYMD(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    const parts = dateInput.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(parts)) return parts;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface CompOffRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: Date | string | null;
  initialHolidayOrWeekOffName?: string | null;
}

export const CompOffRequestModal: React.FC<CompOffRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialHolidayOrWeekOffName,
}) => {
  const [workDate, setWorkDate] = useState<string>(() => {
    return initialDate ? toYMD(initialDate) : toYMD(new Date());
  });
  const [reason, setReason] = useState<string>("");
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setWorkDate(toYMD(initialDate));
      } else {
        setWorkDate(toYMD(new Date()));
      }
      setReason("");
      getHolidays()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setHolidays(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialDate]);

  if (!isOpen || !mounted) return null;

  // Determine date type (Holiday / Week-Off / Regular)
  const dateObj = workDate ? new Date(`${workDate}T00:00:00`) : new Date();
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const matchedHoliday = holidays.find((h) => {
    const startStr = toYMD(h.startDate);
    const endStr = toYMD(h.endDate || h.startDate);
    return workDate >= startStr && workDate <= endStr;
  });

  const isHoliday = !!matchedHoliday;
  const isEligible = isHoliday || isWeekend;

  const requestType = isHoliday ? "HOLIDAY" : isWeekend ? "WEEK_OFF" : "OTHER";
  const holidayOrWeekOffName = isHoliday
    ? matchedHoliday.holidayName
    : isWeekend
    ? dayOfWeek === 0
      ? "Sunday (Week-Off)"
      : "Saturday (Week-Off)"
    : initialHolidayOrWeekOffName || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workDate) {
      toast.error("Please select a date to work on.");
      return;
    }

    if (!isEligible) {
      toast.error("Comp-Off can only be requested for Holidays and Week-Off days.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for working on this off-day.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCompOffRequest({
        workDate,
        requestType,
        holidayOrWeekOffName: holidayOrWeekOffName || undefined,
        reason: reason.trim(),
      });

      if (res.success) {
        toast.success(res.message || "Comp-Off work permission request submitted successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to submit request.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Request Comp-Off Work Permission
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Request manager approval before working on a Holiday or Week-Off
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Work Date Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Work Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Off-Day Status Banner */}
          {workDate && (
            <div>
              {isHoliday ? (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Company Holiday: {matchedHoliday?.holidayName}</span>
                    <span className="text-[11px] text-purple-700 font-medium">
                      This date is an official company holiday. You will be eligible for Comp-Off after manager approval and attendance completion.
                    </span>
                  </div>
                </div>
              ) : isWeekend ? (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{dayOfWeek === 0 ? "Sunday" : "Saturday"} Week-Off</span>
                    <span className="text-[11px] text-blue-700 font-medium">
                      This date is an official weekend / week-off. You will be eligible for Comp-Off after manager approval and attendance completion.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Regular Working Day</span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Comp-Off requests are only valid for Holidays or Week-Off days. Please choose an off-day.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reason for Working */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Reason for Working <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the urgent deliverable, maintenance, or business requirement requiring work on this off-day..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
            />
          </div>

          {/* Helpful Policy Note */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-700 block">Approval & Credit Process:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
              <li>Your Reporting Manager must approve this request before you work.</li>
              <li>Approval alone does not grant Comp-Off. You must complete check-in and check-out on this date.</li>
              <li>Comp-Off balance is automatically credited after valid attendance check-out.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isEligible}
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-brand-btn-text text-xs font-bold hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
