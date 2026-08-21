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
} from "lucide-react";
import { getAttendances } from "../api/attendance.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const loggedInUserId = getCurrentUserId();

  // Load Attendances and Employees list
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isEmployee) {
        // Employees: only load their own attendance logs
        const attRes = await getAttendances({
          userId: loggedInUserId || undefined,
        }).catch((err) => {
          console.error("Error loading personal attendance:", err);
          return { success: false, data: [] };
        });

        const attList = Array.isArray(attRes?.data)
          ? attRes.data
          : Array.isArray(attRes)
          ? attRes
          : [];
        setAttendances(attList);
      } else {
        // SuperAdmin / Admin: load all records and employees list
        const [attRes, empRes] = await Promise.all([
          getAttendances().catch((err) => {
            console.error("Error loading attendances:", err);
            return { success: false, data: [] };
          }),
          getEmployees().catch((err) => {
            console.error("Error loading employees:", err);
            return [];
          }),
        ]);

        const attList = Array.isArray(attRes?.data)
          ? attRes.data
          : Array.isArray(attRes)
          ? attRes
          : [];
        setAttendances(attList);
        setEmployees(Array.isArray(empRes) ? empRes : []);
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
    if (!timeStr) return "--:-- --";
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

  // Combine attendance records with employee details
  const attendanceRows = useMemo(() => {
    return attendances.map((att) => {
      const emp = employees.find(
        (e) => String(e.id) === String(att.userId) || Number(e.id) === Number(att.userId)
      );

      return {
        ...att,
        employeeName: emp?.name || currentUserName || `Employee #${att.userId}`,
        employeeCode: emp?.employeeCode || "N/A",
        department: emp?.department || "General",
        designation: emp?.designation || "Staff",
        profilePic: emp?.profilePic,
      };
    });
  }, [attendances, employees, currentUserName]);

  // Filtered rows by search and date
  const filteredRows = useMemo(() => {
    return attendanceRows.filter((row) => {
      // For employee view, don't strictly require date filter to let them see their recent history
      const rowDate = row.attendanceDate
        ? new Date(row.attendanceDate).toISOString().split("T")[0]
        : "";
      const matchesDate = isEmployee || !selectedDate || rowDate === selectedDate;

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        row.employeeName.toLowerCase().includes(q) ||
        row.employeeCode.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q);

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" ||
        row.attendanceStatus?.toUpperCase() === statusFilter.toUpperCase();

      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [attendanceRows, selectedDate, searchQuery, statusFilter, isEmployee]);

  // Admin KPI Metrics
  const metrics = useMemo(() => {
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

  // Format Helper for Card Date Header (e.g. "Wed, 19 Aug 2026")
  const formatCardDate = (dateStr?: string | null) => {
    if (!dateStr) return "--";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Check if date string is today
  const isTodayDate = (dateStr?: string | null) => {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      const today = new Date();
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    } catch {
      return false;
    }
  };

  // Sorted employee rows (newest first)
  const sortedEmployeeRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const da = new Date(a.attendanceDate || a.checkInTime || 0).getTime();
      const db = new Date(b.attendanceDate || b.checkInTime || 0).getTime();
      return db - da;
    });
  }, [filteredRows]);

  // Employee aggregate stats
  const employeeStats = useMemo(() => {
    let totalMinutes = 0;
    let daysCount = sortedEmployeeRows.length;

    sortedEmployeeRows.forEach((r) => {
      if (r.workingMinutes) {
        totalMinutes += Number(r.workingMinutes);
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;
    const avgMinutes = daysCount > 0 ? Math.round(totalMinutes / daysCount) : 0;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgRemainingMins = avgMinutes % 60;

    return {
      daysCount,
      totalWorkingHours: `${totalHours}h ${remainingMins}m`,
      avgHours: `${avgHours}h ${avgRemainingMins}m`,
    };
  }, [sortedEmployeeRows]);

  // ==========================================
  // 1. EMPLOYEE PERSONAL ATTENDANCE VIEW (Date-wise Cards)
  // ==========================================
  if (isEmployee) {
    return (
      <div className="space-y-5 animate-fade-in text-slate-800 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-brand-primary tracking-tight">
              My Attendance Logs
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Daily date-wise check-in and check-out times.
            </p>
          </div>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xs">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Days
            </span>
            <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
              {employeeStats.daysCount} <span className="text-xs font-semibold text-slate-400">Days</span>
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xs">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Hours
            </span>
            <p className="text-base sm:text-xl font-extrabold text-brand-primary mt-1">
              {employeeStats.totalWorkingHours}
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xs">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Avg. Daily
            </span>
            <p className="text-base sm:text-xl font-extrabold text-emerald-700 mt-1">
              {employeeStats.avgHours}
            </p>
          </div>
        </div>

        {/* Date-wise Attendance Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedEmployeeRows.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Attendance Records Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your daily check-in and check-out cards will automatically appear here once you clock in.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {sortedEmployeeRows.map((row) => {
              const isToday = isTodayDate(row.attendanceDate || row.checkInTime);

              return (
                <div
                  key={row.attendanceId}
                  className="bg-white border border-slate-200/85 hover:border-brand-primary/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group"
                >
                  {/* Card Top: Date Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-brand-primary leading-tight">
                          {formatCardDate(row.attendanceDate || row.checkInTime)}
                        </p>
                        {isToday && (
                          <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md uppercase tracking-wider mt-0.5">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Center: Check-In & Check-Out Times */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Check In */}
                    <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2.5">
                      <div className="flex items-center gap-1 text-slate-400 mb-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Check In
                        </span>
                      </div>
                      <p className="font-mono text-xs sm:text-sm font-extrabold text-slate-900">
                        {formatTime(row.checkInTime)}
                      </p>
                    </div>

                    {/* Check Out */}
                    <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2.5">
                      <div className="flex items-center gap-1 text-slate-400 mb-1">
                        <Clock className="w-3 h-3 text-rose-500" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Check Out
                        </span>
                      </div>
                      <p className="font-mono text-xs sm:text-sm font-extrabold text-slate-900">
                        {row.checkOutTime ? formatTime(row.checkOutTime) : "--:--"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
            {metrics.present}
            <span className="text-xs font-medium text-slate-400 ml-1">/ {metrics.totalEmployees}</span>
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
            {metrics.active}
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
            {metrics.completed}
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
            {Math.max(0, metrics.totalEmployees - metrics.present)}
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
          {["ALL", "PRESENT", "HALF_DAY"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                statusFilter === status
                  ? "bg-brand-primary text-brand-btn-text shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "ALL" ? "All Logs" : status === "PRESENT" ? "Present" : "Half Day"}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Attendance Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-4">
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
        ) : filteredRows.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Attendance Records Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No employee punches were recorded for the selected date ({formatDate(selectedDate)}).
            </p>
          </div>
        ) : (
        <TableContainer className="rounded-2xl border-none shadow-none">
          <Table>
            <TableHeader>
              <tr>
                <TableHead className="sm:px-6">Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check-In GPS Location</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Check-Out GPS Location</TableHead>
                <TableHead>Total Worked</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
                {filteredRows.map((row) => {
                  const checkInLat = row.checkInLatitude ? Number(row.checkInLatitude) : null;
                  const checkInLng = row.checkInLongitude ? Number(row.checkInLongitude) : null;
                  const checkOutLat = row.checkOutLatitude ? Number(row.checkOutLatitude) : null;
                  const checkOutLng = row.checkOutLongitude ? Number(row.checkOutLongitude) : null;

                  const hasCheckInLocation = checkInLat !== null && checkInLng !== null;
                  const hasCheckOutLocation = checkOutLat !== null && checkOutLng !== null;

                  const workingHrs = row.workingMinutes
                    ? `${Math.floor(row.workingMinutes / 60)}h ${row.workingMinutes % 60}m`
                    : row.checkInTime && !row.checkOutTime
                    ? "In Progress"
                    : "--";

                  return (
                    <TableRow key={row.attendanceId}>
                      {/* Employee Column */}
                      <TableCell className="sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {row.profilePic ? (
                              <img
                                src={row.profilePic}
                                alt={row.employeeName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{row.employeeName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs leading-tight">
                              {row.employeeName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              <span className="font-mono text-slate-500 font-bold">{row.employeeCode}</span> • {row.designation}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="font-semibold text-slate-800 whitespace-nowrap">
                        {formatDate(row.attendanceDate)}
                      </TableCell>

                      {/* Check-In Time */}
                      <TableCell className="font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatTime(row.checkInTime)}
                      </TableCell>

                      {/* Check-In GPS Coordinates & Maps Link */}
                      <TableCell className="whitespace-nowrap">
                        {hasCheckInLocation ? (
                          <a
                            href={`https://www.google.com/maps?q=${checkInLat},${checkInLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-mono font-bold transition-colors"
                            title="Click to view exact punch location on Google Maps"
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>
                              {checkInLat?.toFixed(4)}, {checkInLng?.toFixed(4)}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 text-emerald-500 ml-0.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono italic">No GPS</span>
                        )}
                      </TableCell>

                      {/* Check-Out Time */}
                      <TableCell className="font-mono font-bold text-slate-900 whitespace-nowrap">
                        {row.checkOutTime ? formatTime(row.checkOutTime) : (
                          <span className="text-amber-600 text-[11px] font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </TableCell>

                      {/* Check-Out GPS Coordinates & Maps Link */}
                      <TableCell className="whitespace-nowrap">
                        {hasCheckOutLocation ? (
                          <a
                            href={`https://www.google.com/maps?q=${checkOutLat},${checkOutLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 text-[10px] font-mono font-bold transition-colors"
                            title="Click to view checkout location on Google Maps"
                          >
                            <MapPin className="w-3 h-3 text-sky-600" />
                            <span>
                              {checkOutLat?.toFixed(4)}, {checkOutLng?.toFixed(4)}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 text-sky-500 ml-0.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono italic">--</span>
                        )}
                      </TableCell>

                      {/* Total Duration */}
                      <TableCell className="font-mono font-extrabold text-brand-primary whitespace-nowrap">
                        {workingHrs}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            row.attendanceStatus === "PRESENT"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : row.attendanceStatus === "HALF_DAY"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {row.attendanceStatus || "PRESENT"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};
