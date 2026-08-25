"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  ExternalLink,
  Loader2,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";
import { getAttendances } from "../api/attendance.api";
import { AttendanceRegularizeModal } from "./AttendanceRegularizeModal";
import { getEmployees } from "@/features/employees/api/employees.api";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";
import { getHolidays, HolidayRecord } from "@/features/organization/api/calendar.api";
import { Employee } from "@/features/employees/types/employees.types";
import { UserRole } from "@/types/dashboard";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceViewProps {
  currentRole?: UserRole;
  currentUserName?: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentRole = "superadmin",
  currentUserName,
}) => {
  const isEmployee = currentRole === "employee";
  const [attendances, setAttendances] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected Month for Overview & Daily Logs (Default: current month)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  
  // Selected Single Date Filter for Admin table
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  // Attendance Regularize Modal State (for employee date clicks)
  const [regularizeLog, setRegularizeLog] = useState<any | null>(null);
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);

  const handleOpenRegularizeModal = (log: any) => {
    setRegularizeLog(log);
    setIsRegularizeModalOpen(true);
  };

  const loggedInUserId = getCurrentUserId();

  // Load Attendances, Holidays, and Employees list
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isEmployee) {
        // Employees: load their attendance logs + company holidays
        const [attRes, holRes] = await Promise.all([
          getAttendances({
            userId: loggedInUserId || undefined,
          }).catch((err) => {
            console.error("Error loading personal attendance:", err);
            return { success: false, data: [] };
          }),
          getHolidays().catch(() => ({ success: false, data: [] })),
        ]);

        const attList = Array.isArray(attRes?.data)
          ? attRes.data
          : Array.isArray(attRes)
          ? attRes
          : [];
        setAttendances(attList);
        if (holRes.success && holRes.data) {
          setHolidays(holRes.data);
        }
      } else {
        // SuperAdmin / Admin: load all records, holidays, and employees list
        const [attRes, empRes, holRes] = await Promise.all([
          getAttendances().catch((err) => {
            console.error("Error loading attendances:", err);
            return { success: false, data: [] };
          }),
          getEmployees().catch((err) => {
            console.error("Error loading employees:", err);
            return [];
          }),
          getHolidays().catch(() => ({ success: false, data: [] })),
        ]);

        const attList = Array.isArray(attRes?.data)
          ? attRes.data
          : Array.isArray(attRes)
          ? attRes
          : [];
        setAttendances(attList);
        setEmployees(Array.isArray(empRes) ? empRes : []);
        if (holRes.success && holRes.data) {
          setHolidays(holRes.data);
        }
      }
    } catch (err) {
      console.error("Error loading attendance view data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isEmployee]);

  // Format Helper for Time (hh:mm AM/PM)
  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "--:--";
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (e) {
      // ignore
    }
    return timeStr;
  };

  // Format Helper for Date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "--";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Format Helper for Card Date Header (e.g. "Wed, 19 Aug 2026")
  const formatCardDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Check if date is today
  const isTodayDate = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Check if currentMonthDate is the current or a future month
  const isCurrentOrFutureMonth = useMemo(() => {
    const today = new Date();
    return (
      currentMonthDate.getFullYear() > today.getFullYear() ||
      (currentMonthDate.getFullYear() === today.getFullYear() &&
        currentMonthDate.getMonth() >= today.getMonth())
    );
  }, [currentMonthDate]);

  // Month navigation (cannot go forward beyond the current month)
  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "next" && isCurrentOrFutureMonth) return;
    setCurrentMonthDate((prev) => {
      const nextDate = new Date(prev);
      if (direction === "prev") {
        nextDate.setMonth(nextDate.getMonth() - 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      return nextDate;
    });
  };

  // Safe calculation for daily working minutes (prevents runaway numbers if date parsing fallback occurs)
  const computeDayWorkingMinutes = (matchedPunch?: any, isToday?: boolean): number => {
    if (!matchedPunch || !matchedPunch.checkInTime) return 0;

    // 1. Direct workingMinutes from database (if valid and capped)
    if (
      matchedPunch.workingMinutes !== null &&
      matchedPunch.workingMinutes !== undefined &&
      !isNaN(Number(matchedPunch.workingMinutes)) &&
      Number(matchedPunch.workingMinutes) > 0
    ) {
      return Math.min(Number(matchedPunch.workingMinutes), 1440); // Cap to 24h per day
    }

    // 2. Calculated from checkInTime and checkOutTime
    if (matchedPunch.checkInTime && matchedPunch.checkOutTime) {
      try {
        const inDate = new Date(matchedPunch.checkInTime);
        const outDate = new Date(matchedPunch.checkOutTime);
        if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime())) {
          const diffMs = outDate.getTime() - inDate.getTime();
          if (diffMs > 0 && diffMs <= 86400000) {
            return Math.floor(diffMs / 60000);
          }
        }
      } catch {
        // ignore
      }
    }

    // 3. If today and actively clocked in (no checkout yet, cap to 12h)
    if (isToday && matchedPunch.checkInTime && !matchedPunch.checkOutTime) {
      try {
        const inDate = new Date(matchedPunch.checkInTime);
        if (!isNaN(inDate.getTime())) {
          const now = new Date();
          const diffMs = now.getTime() - inDate.getTime();
          if (diffMs > 0 && diffMs <= 43200000) {
            return Math.floor(diffMs / 60000);
          }
        }
      } catch {
        // ignore
      }
    }

    return 0;
  };

  // =========================================================================
  // Full Date-wise Month Generator (Latest Date at Top, Saturdays & Sundays as WO)
  // =========================================================================
  const employeeMonthLogs = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;
    const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;

    const logs: Array<{
      date: Date;
      dateKey: string; // YYYY-MM-DD
      displayDate: string;
      isToday: boolean;
      isWeekend: boolean;
      dayOfWeek: string;
      status: "PRESENT" | "HALF_DAY" | "WO" | "HOLIDAY" | "ABSENT" | "NOT_CLOCKED_IN";
      statusLabel: string;
      checkInTime?: string | null;
      checkOutTime?: string | null;
      workingMinutes?: number | null;
      workingHoursStr: string;
      holidayName?: string;
      rawAttendance?: any;
    }> = [];

    // Loop from maxDay down to 1 (Latest Date at the Top)
    for (let day = maxDay; day >= 1; day--) {
      const cellDate = new Date(year, month, day);
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayOfWeekIdx = cellDate.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;
      const isToday = isTodayDate(cellDate);

      // Check if employee has a raw attendance punch for this date
      const matchedPunch = attendances.find((att) => {
        const attDateStr = att.attendanceDate
          ? new Date(att.attendanceDate).toISOString().split("T")[0]
          : att.checkInTime
          ? new Date(att.checkInTime).toISOString().split("T")[0]
          : "";
        return attDateStr === dateKey;
      });

      // Check if holiday
      const matchedHoliday = holidays.find((h) => {
        if (h.holidayType === "WEEK_OFF") return false;
        const checkTime = new Date(year, month, day).getTime();
        const start = new Date(h.startDate);
        const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const end = new Date(h.endDate || h.startDate);
        const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
        return checkTime >= startTime && checkTime <= endTime;
      });

      if (matchedPunch && matchedPunch.checkInTime) {
        // Employee worked on this day (whether weekday or weekend) -> Determine status by hours
        const mins = computeDayWorkingMinutes(matchedPunch, isToday);
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        const workStr = mins > 0 ? `${hrs}h ${remMins}m` : "--";

        // Directly use attendanceStatus calculated and returned from backend
        const rawStatus = String(matchedPunch.attendanceStatus || "PRESENT").toUpperCase();
        let dayStatus: "PRESENT" | "HALF_DAY" | "ABSENT" = "PRESENT";
        let dayStatusLabel = isWeekend ? "Present (WO Worked)" : "Present";

        if (rawStatus === "HALF_DAY") {
          dayStatus = "HALF_DAY";
          dayStatusLabel = "Half Day";
        } else if (rawStatus === "ABSENT") {
          dayStatus = "ABSENT";
          dayStatusLabel = "Absent";
        } else {
          dayStatus = "PRESENT";
          dayStatusLabel = isWeekend ? "Present (WO Worked)" : "Present";
        }

        logs.push({
          date: cellDate,
          dateKey,
          displayDate: formatCardDate(cellDate),
          isToday,
          isWeekend,
          dayOfWeek: cellDate.toLocaleDateString("en-US", { weekday: "short" }),
          status: dayStatus,
          statusLabel: dayStatusLabel,
          checkInTime: matchedPunch.checkInTime,
          checkOutTime: matchedPunch.checkOutTime,
          workingMinutes: mins,
          workingHoursStr: workStr,
          rawAttendance: matchedPunch,
        });
      } else if (isWeekend) {
        // Saturday or Sunday without punch -> SHOW AS WEEK-OFF (WO)
        logs.push({
          date: cellDate,
          dateKey,
          displayDate: formatCardDate(cellDate),
          isToday,
          isWeekend: true,
          dayOfWeek: cellDate.toLocaleDateString("en-US", { weekday: "short" }),
          status: "WO",
          statusLabel: "Week-Off",
          checkInTime: null,
          checkOutTime: null,
          workingMinutes: 0,
          workingHoursStr: "--",
        });
      } else if (matchedHoliday) {
        // Holiday
        logs.push({
          date: cellDate,
          dateKey,
          displayDate: formatCardDate(cellDate),
          isToday,
          isWeekend: false,
          dayOfWeek: cellDate.toLocaleDateString("en-US", { weekday: "short" }),
          status: "HOLIDAY",
          statusLabel: "Holiday",
          holidayName: matchedHoliday.holidayName,
          checkInTime: null,
          checkOutTime: null,
          workingMinutes: 0,
          workingHoursStr: "--",
        });
      } else if (isToday) {
        // Today weekday, not yet clocked in
        logs.push({
          date: cellDate,
          dateKey,
          displayDate: formatCardDate(cellDate),
          isToday: true,
          isWeekend: false,
          dayOfWeek: cellDate.toLocaleDateString("en-US", { weekday: "short" }),
          status: "NOT_CLOCKED_IN",
          statusLabel: "--",
          checkInTime: null,
          checkOutTime: null,
          workingMinutes: 0,
          workingHoursStr: "--",
        });
      } else {
        // Past weekday without punch -> Absent
        logs.push({
          date: cellDate,
          dateKey,
          displayDate: formatCardDate(cellDate),
          isToday: false,
          isWeekend: false,
          dayOfWeek: cellDate.toLocaleDateString("en-US", { weekday: "short" }),
          status: "ABSENT",
          statusLabel: "Absent",
          checkInTime: null,
          checkOutTime: null,
          workingMinutes: 0,
          workingHoursStr: "--",
        });
      }
    }

    return logs;
  }, [currentMonthDate, attendances, holidays]);

  // Month-wise Overview Stats
  const monthOverviewStats = useMemo(() => {
    let presentCount = 0;
    let weekOffCount = 0;
    let holidayCount = 0;
    let absentCount = 0;
    let totalMinutes = 0;

    employeeMonthLogs.forEach((log) => {
      if (log.status === "PRESENT") {
        presentCount++;
        if (log.workingMinutes) totalMinutes += log.workingMinutes;
      } else if (log.status === "HALF_DAY") {
        presentCount++; // Count as a worked day for avg calculation
        if (log.workingMinutes) totalMinutes += log.workingMinutes;
      } else if (log.status === "WO") {
        weekOffCount++;
      } else if (log.status === "HOLIDAY") {
        holidayCount++;
      } else if (log.status === "ABSENT") {
        absentCount++;
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remMins = totalMinutes % 60;
    const avgMins = presentCount > 0 ? Math.round(totalMinutes / presentCount) : 0;
    const avgHrs = Math.floor(avgMins / 60);
    const avgRemMins = avgMins % 60;

    return {
      totalLoggedDays: employeeMonthLogs.length,
      presentCount,
      weekOffCount,
      holidayCount,
      absentCount,
      totalWorkingHoursStr: `${totalHours}h ${remMins}m`,
      avgDailyHoursStr: `${avgHrs}h ${avgRemMins}m`,
    };
  }, [employeeMonthLogs]);

  // Filtered employee logs by search / status
  const filteredEmployeeLogs = useMemo(() => {
    return employeeMonthLogs.filter((log) => {
      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "PRESENT" && log.status !== "PRESENT") return false;
        if (statusFilter === "WO" && log.status !== "WO") return false;
        if (statusFilter === "HOLIDAY" && log.status !== "HOLIDAY") return false;
        if (statusFilter === "ABSENT" && log.status !== "ABSENT") return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.displayDate.toLowerCase().includes(q) ||
          log.statusLabel.toLowerCase().includes(q) ||
          (log.holidayName && log.holidayName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [employeeMonthLogs, statusFilter, searchQuery]);

  // Combine attendance records with employee details for Admin view
  const attendanceRows = useMemo(() => {
    return attendances.map((att) => {
      const emp = employees.find(
        (e) => String(e.id) === String(att.userId) || Number(e.id) === Number(att.userId)
      );

      const isRowToday = att.attendanceDate
        ? isTodayDate(new Date(att.attendanceDate))
        : att.checkInTime
        ? isTodayDate(new Date(att.checkInTime))
        : false;
      const mins = computeDayWorkingMinutes(att, isRowToday);

      // Directly use attendanceStatus calculated and returned from backend
      const rawStatus = String(att.attendanceStatus || "PRESENT").toUpperCase();
      let computedStatus: "PRESENT" | "HALF_DAY" | "ABSENT" = "PRESENT";
      let computedStatusLabel = "Present";

      if (rawStatus === "HALF_DAY") {
        computedStatus = "HALF_DAY";
        computedStatusLabel = "Half Day";
      } else if (rawStatus === "ABSENT") {
        computedStatus = "ABSENT";
        computedStatusLabel = "Absent";
      } else {
        computedStatus = "PRESENT";
        computedStatusLabel = "Present";
      }

      return {
        ...att,
        employeeName: emp?.name || currentUserName || `Employee #${att.userId}`,
        employeeCode: emp?.employeeCode || "N/A",
        department: emp?.department || "General",
        designation: emp?.designation || "Staff",
        profilePic: emp?.profilePic,
        computedStatus,
        computedStatusLabel,
        computedMins: mins,
      };
    });
  }, [attendances, employees, currentUserName]);

  // Filtered rows for Admin Table
  const filteredAdminRows = useMemo(() => {
    return attendanceRows.filter((row) => {
      const rowDate = row.attendanceDate
        ? new Date(row.attendanceDate).toISOString().split("T")[0]
        : "";
      const matchesDate = !selectedDate || rowDate === selectedDate;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        row.employeeName.toLowerCase().includes(q) ||
        row.employeeCode.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        row.computedStatus === statusFilter;

      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [attendanceRows, selectedDate, searchQuery, statusFilter]);

  // Admin KPI Metrics
  const adminMetrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = attendanceRows.filter((r) => {
      const d = r.attendanceDate ? new Date(r.attendanceDate).toISOString().split("T")[0] : "";
      return d === today;
    });

    const presentCount = todayRecords.length;
    const currentlyActive = todayRecords.filter((r) => r.checkInTime && !r.checkOutTime).length;
    const completedShifts = todayRecords.filter((r) => r.checkInTime && r.checkOutTime).length;

    return {
      present: presentCount,
      active: currentlyActive,
      completed: completedShifts,
      totalEmployees: employees.length,
    };
  }, [attendanceRows, employees]);

  // ==========================================
  // 1. EMPLOYEE PERSONAL ATTENDANCE VIEW (Date-wise with WO, Latest at Top, Month Overview)
  // ==========================================
  if (isEmployee) {
    return (
      <div className="space-y-6 animate-fade-in text-slate-800 pb-10">
        {/* Header & Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div>
            <h1 className="text-xl font-bold text-brand-primary tracking-tight">
              My Attendance Logs
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Daily date-wise attendance records with latest dates at the top.
            </p>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 rounded-2xl p-1 shrink-0 self-start sm:self-auto shadow-3xs">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1.5 rounded-xl hover:bg-white hover:shadow-3xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-extrabold text-xs text-slate-800 min-w-[130px] text-center">
              {currentMonthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>

            <button
              onClick={() => navigateMonth("next")}
              disabled={isCurrentOrFutureMonth}
              className={`p-1.5 rounded-xl transition-all ${
                isCurrentOrFutureMonth
                  ? "opacity-25 cursor-not-allowed text-slate-400"
                  : "hover:bg-white hover:shadow-3xs text-slate-600 hover:text-slate-900 cursor-pointer"
              }`}
              aria-label="Next Month"
              title={isCurrentOrFutureMonth ? "Cannot navigate to future months" : "Next Month"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month-Wise Attendance Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Total Working Hours */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider block">
              Total Working Hours
            </span>
            <p className="text-2xl font-black text-brand-primary">
              {monthOverviewStats.totalWorkingHoursStr}
            </p>
          </div>

          {/* Avg Daily */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Avg Daily Hours
            </span>
            <p className="text-2xl font-black text-slate-800">
              {monthOverviewStats.avgDailyHoursStr}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Date-wise Attendance Logs (Latest Date at Top) */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 animate-pulse flex items-center justify-between"
              >
                <div className="h-4 bg-slate-200 rounded w-36" />
                <div className="h-6 bg-slate-200 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : filteredEmployeeLogs.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Logs for Selected Month</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Attendance records for this month will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile Card Grid (Visible on mobile/tablet screens: md:hidden) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
              {filteredEmployeeLogs.map((log) => {
                const isWO = log.status === "WO";
                const isHoliday = log.status === "HOLIDAY";
                const isPresent = log.status === "PRESENT";
                const isHalfDay = log.status === "HALF_DAY";
                const isAbsent = log.status === "ABSENT";

                return (
                  <div
                    key={log.dateKey}
                    onClick={() => handleOpenRegularizeModal(log)}
                    className={`p-4 rounded-2xl border shadow-2xs transition-all space-y-3 cursor-pointer hover:shadow-md hover:border-brand-primary/50 group bg-white ${
                      isWO
                        ? "border-slate-200/70 bg-slate-50/40 hover:bg-slate-50/80"
                        : isHoliday
                        ? "border-purple-200/80 bg-purple-50/20 hover:bg-purple-50/40"
                        : "border-slate-200/80"
                    }`}
                    title="Click to request attendance correction"
                  >
                    {/* Top Header: Date & Status */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isPresent
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isHalfDay
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : isWO
                              ? "bg-slate-100 text-slate-500 border border-slate-200"
                              : isHoliday
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                            {log.displayDate}
                          </span>
                          {log.holidayName && (
                            <span className="text-[10px] font-bold text-purple-700 block mt-0.5">
                              ✨ {log.holidayName}
                            </span>
                          )}
                        </div>
                      </div>

                      {log.statusLabel !== "--" && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isPresent
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isHalfDay
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : isWO
                              ? "bg-slate-100 text-slate-700 border border-slate-300 font-extrabold"
                              : isHoliday
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : isAbsent
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {log.statusLabel}
                        </span>
                      )}
                    </div>

                    {/* Punches Grid: Check In & Check Out */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>Check In</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {formatTime(log.checkInTime)}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          <Clock className="w-3 h-3 text-rose-500" />
                          <span>Check Out</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {formatTime(log.checkOutTime)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Bar: Total Worked */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Worked
                      </span>
                      <span className="font-extrabold text-brand-primary">
                        {log.workingHoursStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden on mobile, visible md and up) */}
            <div className="hidden md:block">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="sm:px-6">Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Total Worked</TableHead>
                      <TableHead className="text-center sm:pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployeeLogs.map((log) => {
                      const isWO = log.status === "WO";
                      const isHoliday = log.status === "HOLIDAY";
                      const isPresent = log.status === "PRESENT";
                      const isHalfDay = log.status === "HALF_DAY";
                      const isAbsent = log.status === "ABSENT";

                      return (
                        <TableRow
                          key={log.dateKey}
                          onClick={() => handleOpenRegularizeModal(log)}
                          className={`transition-colors cursor-pointer hover:bg-brand-primary-light/40 group ${
                            isWO
                              ? "bg-slate-50/30 text-slate-500 hover:bg-slate-100/70"
                              : isHoliday
                              ? "bg-purple-50/20 hover:bg-purple-50/50"
                              : log.isToday
                              ? "bg-brand-primary-light/40 hover:bg-brand-primary-light/60"
                              : ""
                          }`}
                          title="Click row to request attendance correction"
                        >
                          {/* Date Column */}
                          <TableCell className="sm:px-6">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isPresent
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isHalfDay
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : isWO
                                    ? "bg-slate-100 text-slate-500 border border-slate-200"
                                    : isHoliday
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 text-xs">
                                    {log.displayDate}
                                  </span>
                                </div>
                                {log.holidayName && (
                                  <span className="text-[10px] font-bold text-purple-700 block mt-0.5">
                                    ✨ {log.holidayName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Check In */}
                          <TableCell className="font-mono font-bold text-slate-800">
                            {log.checkInTime ? (
                              <span className="text-emerald-700 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                {formatTime(log.checkInTime)}
                              </span>
                            ) : (
                              <span className="text-slate-400">--:--</span>
                            )}
                          </TableCell>

                          {/* Check Out */}
                          <TableCell className="font-mono font-bold text-slate-800">
                            {log.checkOutTime ? (
                              <span className="text-slate-800 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                {formatTime(log.checkOutTime)}
                              </span>
                            ) : (
                              <span className="text-slate-400">--:--</span>
                            )}
                          </TableCell>

                          {/* Total Worked */}
                          <TableCell className="font-bold text-brand-primary">
                            {log.workingHoursStr}
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell className="text-center sm:pr-6">
                            {log.statusLabel !== "--" && (
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                                  isPresent
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : isHalfDay
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : isWO
                                    ? "bg-slate-100 text-slate-700 border border-slate-300 font-extrabold"
                                    : isHoliday
                                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                                    : isAbsent
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {log.statusLabel}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        )}

        {/* Attendance Regularize Request Modal */}
        <AttendanceRegularizeModal
          isOpen={isRegularizeModalOpen}
          onClose={() => setIsRegularizeModalOpen(false)}
          onSuccess={() => loadData()}
          selectedDate={regularizeLog?.date || null}
          currentCheckIn={regularizeLog?.checkInTime}
          currentCheckOut={regularizeLog?.checkOutTime}
          currentStatusLabel={regularizeLog?.statusLabel}
        />
      </div>
    );
  }

  // ==========================================
  // 2. SUPERADMIN / ADMIN ATTENDANCE VIEW
  // ==========================================
  return (
    <div className="space-y-6 animate-fade-in text-slate-800 pb-10">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight flex items-center gap-2">
            <span>Attendance & Location Records</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitor real-time employee check-in times, punch-out logs, and verified GPS coordinates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
            />
          </div>

          <button
            onClick={loadData}
            title="Refresh logs"
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
              Present Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {adminMetrics.present}
            <span className="text-xs font-medium text-slate-400 ml-1">/ {adminMetrics.totalEmployees}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
              Currently Clocked In
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-brand-primary flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-brand-primary mt-2">
            {adminMetrics.active}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
              Completed Shift
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {adminMetrics.completed}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
              Not Clocked In
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {Math.max(0, adminMetrics.totalEmployees - adminMetrics.present)}
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employee, code, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto">
          {["ALL", "PRESENT", "HALF_DAY", "ABSENT"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                statusFilter === status
                  ? "bg-brand-primary text-brand-btn-text shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "ALL"
                ? "All Logs"
                : status === "PRESENT"
                ? "Present"
                : status === "HALF_DAY"
                ? "Half Day"
                : "Absent"}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Attendance Records Table */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-none">
                <div className="flex items-center gap-3 w-48">
                  <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 font-mono" />
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-4 w-16 font-mono" />
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredAdminRows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs py-20 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Attendance Records Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No employee punches were recorded for the selected date ({formatDate(selectedDate)}).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Admin Mobile Card Grid (md:hidden) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
              {filteredAdminRows.map((row) => {
                const checkInLat = row.checkInLatitude ? Number(row.checkInLatitude) : null;
                const checkInLng = row.checkInLongitude ? Number(row.checkInLongitude) : null;
                const checkOutLat = row.checkOutLatitude ? Number(row.checkOutLatitude) : null;
                const checkOutLng = row.checkOutLongitude ? Number(row.checkOutLongitude) : null;

                const hasCheckInLocation = checkInLat !== null && checkInLng !== null;
                const hasCheckOutLocation = checkOutLat !== null && checkOutLng !== null;

                const isRowToday = row.attendanceDate
                  ? isTodayDate(new Date(row.attendanceDate))
                  : row.checkInTime
                  ? isTodayDate(new Date(row.checkInTime))
                  : false;
                const rowMins = computeDayWorkingMinutes(row, isRowToday);
                const workingHrs =
                  rowMins > 0
                    ? `${Math.floor(rowMins / 60)}h ${rowMins % 60}m`
                    : "--";

                return (
                  <div
                    key={row.attendanceId}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-3"
                  >
                    {/* Header: Employee Profile & Status */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-xs shrink-0">
                          {row.employeeName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                            {row.employeeName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {row.employeeCode} · {row.department}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          row.computedStatus === "PRESENT"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : row.computedStatus === "HALF_DAY"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {row.computedStatusLabel}
                      </span>
                    </div>

                    {/* Punches Grid: Check In & Check Out with Location */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Check In */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>Check In</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs block">
                          {formatTime(row.checkInTime)}
                        </span>
                        {hasCheckInLocation && (
                          <a
                            href={`https://www.google.com/maps?q=${checkInLat},${checkInLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold hover:underline mt-0.5"
                          >
                            <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>GPS Location</span>
                          </a>
                        )}
                      </div>

                      {/* Check Out */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          <Clock className="w-3 h-3 text-rose-500" />
                          <span>Check Out</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs block">
                          {formatTime(row.checkOutTime)}
                        </span>
                        {hasCheckOutLocation && (
                          <a
                            href={`https://www.google.com/maps?q=${checkOutLat},${checkOutLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-semibold hover:underline mt-0.5"
                          >
                            <MapPin className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                            <span>GPS Location</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Date & Total Worked */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold text-[11px]">
                        {formatDate(row.attendanceDate || row.checkInTime)}
                      </span>
                      <span className="font-extrabold text-brand-primary">
                        {workingHrs}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Desktop Table (hidden md:block) */}
            <div className="hidden md:block">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="sm:px-6">Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check-In GPS Location</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Check-Out GPS Location</TableHead>
                      <TableHead>Total Worked</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdminRows.map((row) => {
                      const checkInLat = row.checkInLatitude ? Number(row.checkInLatitude) : null;
                      const checkInLng = row.checkInLongitude ? Number(row.checkInLongitude) : null;
                      const checkOutLat = row.checkOutLatitude ? Number(row.checkOutLatitude) : null;
                      const checkOutLng = row.checkOutLongitude ? Number(row.checkOutLongitude) : null;

                      const hasCheckInLocation = checkInLat !== null && checkInLng !== null;
                      const hasCheckOutLocation = checkOutLat !== null && checkOutLng !== null;

                      const isRowToday = row.attendanceDate
                        ? isTodayDate(new Date(row.attendanceDate))
                        : row.checkInTime
                        ? isTodayDate(new Date(row.checkInTime))
                        : false;
                      const rowMins = computeDayWorkingMinutes(row, isRowToday);
                      const workingHrs =
                        rowMins > 0
                          ? `${Math.floor(rowMins / 60)}h ${rowMins % 60}m`
                          : "--";

                      return (
                        <TableRow key={row.attendanceId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Employee Column */}
                          <TableCell className="sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-xs shrink-0">
                                {row.employeeName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-tight">
                                  {row.employeeName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {row.employeeCode} · {row.department}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Date */}
                          <TableCell className="font-semibold text-slate-800">
                            {formatDate(row.attendanceDate || row.checkInTime)}
                          </TableCell>

                          {/* Check In Time */}
                          <TableCell className="font-mono font-bold text-slate-900">
                            {formatTime(row.checkInTime)}
                          </TableCell>

                          {/* Check In Location */}
                          <TableCell>
                            {hasCheckInLocation ? (
                              <a
                                href={`https://www.google.com/maps?q=${checkInLat},${checkInLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold hover:bg-emerald-100 transition-colors"
                              >
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{checkInLat?.toFixed(4)}, {checkInLng?.toFixed(4)}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">No GPS Log</span>
                            )}
                          </TableCell>

                          {/* Check Out Time */}
                          <TableCell className="font-mono font-bold text-slate-900">
                            {formatTime(row.checkOutTime)}
                          </TableCell>

                          {/* Check Out Location */}
                          <TableCell>
                            {hasCheckOutLocation ? (
                              <a
                                href={`https://www.google.com/maps?q=${checkOutLat},${checkOutLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100 transition-colors"
                              >
                                <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>{checkOutLat?.toFixed(4)}, {checkOutLng?.toFixed(4)}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">No GPS Log</span>
                            )}
                          </TableCell>

                          {/* Total Worked */}
                          <TableCell className="font-bold text-brand-primary font-mono">
                            {workingHrs}
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell className="text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                row.computedStatus === "PRESENT"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : row.computedStatus === "HALF_DAY"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {row.computedStatusLabel}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
