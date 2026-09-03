import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, Loader2, Search, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { ApplyLeaveInput } from "../types/leaves.types";
import { getCurrentUserId } from "../api/leaves.api";
import { getHolidays, HolidayRecord } from "@/features/organization/api/calendar.api";
import {
  getAssignedWeekOffs,
  getWeekOffs,
} from "@/features/settings/api/weekOff.api";
import {
  WeekOffRecord,
  WeekOffAssignRecord,
} from "@/features/settings/types/weekOff.types";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplyLeaveInput) => Promise<boolean>;
  leaveTypes?: any[];
  employees?: any[];
  getUserBalances?: (userId: number) => {
    sick: number;
    comp: number;
    earned: number;
    lop: number;
  };
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
  getUserBalances,
}) => {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayString();
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

  // Holiday and Week-Off Metadata
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [assignedWeekOffs, setAssignedWeekOffs] = useState<WeekOffAssignRecord[]>([]);
  const [globalWeekOffs, setGlobalWeekOffs] = useState<WeekOffRecord[]>([]);

  const mappedEmployees = employees.map((emp: any) => ({
    id: Number(emp.id),
    name: emp.name,
  }));

  // Load Holiday & Week-Off Metadata
  useEffect(() => {
    if (!isOpen) return;
    const fetchMetadata = async () => {
      try {
        const targetUserId =
          isAdminOrSuperAdmin && Number(selectedEmployeeId) > 0
            ? Number(selectedEmployeeId)
            : (getCurrentUserId() || 0);

        const [holRes, assignRes, weekOffRes] = await Promise.all([
          getHolidays().catch(() => ({ success: false, data: [] as HolidayRecord[] })),
          getAssignedWeekOffs(targetUserId || undefined).catch(() => ({ success: false, data: [] as WeekOffAssignRecord[] })),
          getWeekOffs().catch(() => ({ success: false, data: [] as WeekOffRecord[] })),
        ]);

        if (holRes.success && Array.isArray(holRes.data)) {
          setHolidays(holRes.data);
        }
        if (assignRes.success && Array.isArray(assignRes.data)) {
          setAssignedWeekOffs(assignRes.data);
        }
        if (weekOffRes.success && Array.isArray(weekOffRes.data)) {
          setGlobalWeekOffs(weekOffRes.data);
        }
      } catch (err) {
        console.warn("Could not load leave calendar metadata:", err);
      }
    };
    fetchMetadata();
  }, [isOpen, selectedEmployeeId, isAdminOrSuperAdmin]);

  // Helper: Check if date is a Holiday
  const getDateHoliday = (dateStr: string): HolidayRecord | null => {
    if (!dateStr || !holidays.length) return null;
    const targetTime = new Date(dateStr + "T00:00:00").getTime();
    if (isNaN(targetTime)) return null;

    const match = holidays.find((h) => {
      if (h.status === false) return false;
      if (h.holidayType === "WEEK_OFF") return false;
      const start = new Date(
        h.startDate.includes("T") ? h.startDate.split("T")[0] + "T00:00:00" : h.startDate + "T00:00:00"
      ).getTime();
      const end = new Date(
        h.endDate.includes("T") ? h.endDate.split("T")[0] + "T23:59:59" : h.endDate + "T23:59:59"
      ).getTime();
      return targetTime >= start && targetTime <= end;
    });
    return match || null;
  };

  // Helper: Check if date is a Week Off
  const getDateWeekOff = (dateStr: string): { isWeekOff: boolean; label?: string } | null => {
    if (!dateStr) return null;
    const dateObj = new Date(dateStr + "T00:00:00");
    if (isNaN(dateObj.getTime())) return null;

    const targetTime = dateObj.getTime();

    // 1. Check holiday record with holidayType === "WEEK_OFF"
    const weekOffHoliday = holidays.find((h) => {
      if (h.status === false || h.holidayType !== "WEEK_OFF") return false;
      const start = new Date(
        h.startDate.includes("T") ? h.startDate.split("T")[0] + "T00:00:00" : h.startDate + "T00:00:00"
      ).getTime();
      const end = new Date(
        h.endDate.includes("T") ? h.endDate.split("T")[0] + "T23:59:59" : h.endDate + "T23:59:59"
      ).getTime();
      return targetTime >= start && targetTime <= end;
    });
    if (weekOffHoliday) {
      return { isWeekOff: true, label: weekOffHoliday.holidayName || "Weekly Off" };
    }

    // 2. Check assigned or global week-off rules
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = daysOfWeek[dateObj.getDay()];

    let activeRules: Array<{ frequency: string; dayOfWeek: string; duration: string }> = [];

    if (assignedWeekOffs.length > 0 && assignedWeekOffs[0].weekOff?.rules) {
      activeRules = assignedWeekOffs[0].weekOff.rules;
    } else if (globalWeekOffs.length > 0 && globalWeekOffs[0].rules) {
      activeRules = globalWeekOffs[0].rules;
    }

    if (activeRules.length > 0) {
      const match = activeRules.find((rule) => {
        if (rule.dayOfWeek.toLowerCase() !== dayName.toLowerCase()) return false;
        if (rule.frequency === "Every") return true;

        const dom = dateObj.getDate();
        const nth = Math.ceil(dom / 7);
        if (rule.frequency === "First" && nth === 1) return true;
        if (rule.frequency === "Second" && nth === 2) return true;
        if (rule.frequency === "Third" && nth === 3) return true;
        if (rule.frequency === "Fourth" && nth === 4) return true;
        if (rule.frequency === "Fifth" && nth === 5) return true;

        return false;
      });

      if (match) {
        return { isWeekOff: true, label: `${dayName} Weekly Off` };
      }
    } else {
      // Standard default week-off (Sunday & Saturday)
      if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
        return { isWeekOff: true, label: `${dayName} Weekly Off` };
      }
    }

    return null;
  };

  const getRequestedDaysCount = (): number => {
    const start = new Date(fromDate + "T00:00:00");
    const end = new Date(toDate + "T00:00:00");
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

    let workingDays = 0;
    let current = new Date(start);

    while (current <= end) {
      const currStr = current.toISOString().slice(0, 10);
      const isHol = Boolean(getDateHoliday(currStr));
      const isWo = Boolean(getDateWeekOff(currStr));

      if (!isHol && !isWo) {
        workingDays += isHalfDay ? 0.5 : 1;
      }

      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  };

  const renderDateStatusBadge = (dateStr: string) => {
    if (!dateStr) return null;
    const hol = getDateHoliday(dateStr);
    if (hol) {
      return (
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
          <span>🌴</span>
          <span>Holiday: {hol.holidayName}</span>
        </div>
      );
    }
    const wo = getDateWeekOff(dateStr);
    if (wo?.isWeekOff) {
      return (
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
          <span>🗓️</span>
          <span>{wo.label || "Weekly Off"}</span>
        </div>
      );
    }
    return (
      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Working Day</span>
      </div>
    );
  };

  const getSelectedLeaveBalance = () => {
    const selectedType = leaveTypes.find((t) => Number(t.leaveTypeId) === Number(leaveTypeId));
    if (!selectedType) return { balance: 0, categoryName: "" };

    const targetUserId =
      isAdminOrSuperAdmin && Number(selectedEmployeeId) > 0
        ? Number(selectedEmployeeId)
        : (getCurrentUserId() || 0);

    const balances = getUserBalances ? getUserBalances(targetUserId) : { sick: 12, comp: 0, earned: 0, lop: 0 };
    const name = selectedType.leaveName.toLowerCase();
    const code = selectedType.leaveCode.toLowerCase();

    if (name.includes("sick") || name.includes("casual") || code.includes("sl") || code.includes("cl")) {
      return { balance: balances.sick, categoryName: "Sick Leave/Casual Leave" };
    } else if (name.includes("comp") || code.includes("comp")) {
      return { balance: balances.comp, categoryName: "Comp-Off" };
    } else if (name.includes("earned") || code.includes("el")) {
      return { balance: balances.earned, categoryName: "Earned Leave" };
    } else if (name.includes("loss") || name.includes("lop") || code.includes("lop")) {
      return { balance: balances.lop, categoryName: "Loss of Pay" };
    }

    return { balance: 0, categoryName: "Leave" };
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

  useEffect(() => {
    if (!isOpen) {
      setLeaveTypeId(0);
      setSelectedEmployeeId(0);
      setIsHalfDay(false);
      setFromDate(todayStr);
      setToDate(todayStr);
      setReason("");
      setErrorMsg(null);
    }
  }, [isOpen, todayStr]);

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

    const start = new Date(fromDate + "T00:00:00");
    const end = new Date(toDate + "T00:00:00");

    if (isNaN(start.getTime())) {
      setErrorMsg("Please select a valid From Date.");
      return;
    }

    if (isNaN(end.getTime())) {
      setErrorMsg("Please select a valid To Date.");
      return;
    }

    if (start > end) {
      setErrorMsg("To Date cannot be before From Date.");
      return;
    }

    if (fromDate < todayStr) {
      setErrorMsg("Leave cannot be applied for past dates. Please select today or a future date.");
      return;
    }

    if (toDate < todayStr) {
      setErrorMsg("Leave cannot be applied for past dates. Please select today or a future date.");
      return;
    }

    const fromHoliday = getDateHoliday(fromDate);
    const fromWeekOff = getDateWeekOff(fromDate);
    if (fromHoliday || fromWeekOff?.isWeekOff) {
      const reasonStr = fromHoliday ? `Holiday (${fromHoliday.holidayName})` : (fromWeekOff?.label || "Weekly Off");
      setErrorMsg(`Leave cannot be applied for holidays or weekly-off days. From Date is a ${reasonStr}.`);
      return;
    }

    const toHoliday = getDateHoliday(toDate);
    const toWeekOff = getDateWeekOff(toDate);
    if (toHoliday || toWeekOff?.isWeekOff) {
      const reasonStr = toHoliday ? `Holiday (${toHoliday.holidayName})` : (toWeekOff?.label || "Weekly Off");
      setErrorMsg(`Leave cannot be applied for holidays or weekly-off days. To Date is a ${reasonStr}.`);
      return;
    }

    const requestedDays = getRequestedDaysCount();
    if (requestedDays === 0) {
      setErrorMsg("Leave cannot be applied for holidays or weekly-off days. The selected date range contains no working days.");
      return;
    }

    const { balance, categoryName } = getSelectedLeaveBalance();

    if (requestedDays > balance) {
      setErrorMsg(
        `Insufficient balance. The request is for ${requestedDays} ${requestedDays === 1 ? "day" : "days"} but there are only ${balance} ${balance === 1 ? "day" : "days"} remaining for ${categoryName}.`
      );
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

  return typeof document !== "undefined" ? createPortal(
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

        {leaveTypes.length === 0 ? (
          <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-bold text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>No active leave types are configured in the system. You cannot apply for leave.</span>
          </div>
        ) : errorMsg ? (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

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
                  {leaveTypeId > 0 && (
                    <div className="mt-1.5 flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Available Balance:
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                        getSelectedLeaveBalance().balance > 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {getSelectedLeaveBalance().balance} {getSelectedLeaveBalance().balance === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                  )}
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
                    min={todayStr}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all disabled:bg-slate-50"
                  />
                </div>
                {renderDateStatusBadge(fromDate)}
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
                    min={fromDate && fromDate > todayStr ? fromDate : todayStr}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all disabled:bg-slate-50"
                  />
                </div>
                {renderDateStatusBadge(toDate)}
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
              disabled={isSubmitting || leaveTypes.length === 0}
              className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-btn-text" />}
              <span>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};
