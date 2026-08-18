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

  // ==========================================
  // 1. EMPLOYEE PERSONAL ATTENDANCE VIEW
  // ==========================================
  if (isEmployee) {
    return (
      <div className="space-y-6 animate-fade-in text-slate-800 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#013e37] tracking-tight">
              My Attendance Logs
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              View your check-in, check-out, and total working hours history.
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:text-[#013e37] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Assigned Shift Summary Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-[#013e37]" />
            <h3 className="text-sm font-extrabold text-[#013e37]">Assigned Shift Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Shift Schedule
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1">09:30 AM – 06:30 PM</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                General Shift
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Working Days
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1">Monday – Friday</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                5 Days / Week
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Weekly Offs
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1">Saturday, Sunday</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                Weekend Off
              </span>
            </div>
          </div>
        </div>

        {/* Attendance Log History Table (No GPS locations shown to employees) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#013e37]">Recent Punch Logs</h3>
            <span className="text-xs font-bold text-slate-400 font-mono">
              {filteredRows.length} {filteredRows.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[#013e37] animate-spin" />
              <span className="text-xs text-slate-400 font-bold">Loading your attendance logs...</span>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Attendance History Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your daily check-in and check-out logs will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f4fbf7] text-[#013e37] font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-4 sm:px-6">Date</th>
                    <th className="py-3.5 px-4">Check In</th>
                    <th className="py-3.5 px-4">Check Out</th>
                    <th className="py-3.5 px-4">Working Hours</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRows.map((row) => {
                    const workingHrs = row.workingMinutes
                      ? `${Math.floor(row.workingMinutes / 60)}h ${row.workingMinutes % 60}m`
                      : row.checkInTime && !row.checkOutTime
                      ? "In Progress"
                      : "--";

                    return (
                      <tr key={row.attendanceId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                          {formatDate(row.attendanceDate)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatTime(row.checkInTime)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {row.checkOutTime ? (
                            formatTime(row.checkOutTime)
                          ) : (
                            <span className="text-amber-600 text-[11px] font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                              Active Shift
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-[#013e37] whitespace-nowrap">
                          {workingHrs}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#013e37] tracking-tight flex items-center gap-2">
            <span>Attendance & Location Records</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitor real-time employee check-in times, punch-out logs, and verified GPS coordinates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-[#013e37]" />
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
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-[#013e37] hover:border-[#013e37]/30 rounded-xl transition-all shadow-2xs cursor-pointer"
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
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#013e37] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#013e37] mt-2">
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
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#013e37]"
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
                  ? "bg-[#013e37] text-[#ffefb3] shadow-xs"
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
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-[#013e37] animate-spin" />
            <span className="text-xs text-slate-400 font-bold">Loading attendance records...</span>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f4fbf7] text-[#013e37] font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <th className="py-3.5 px-4 sm:px-6">Employee</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check-In GPS Location</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Check-Out GPS Location</th>
                  <th className="py-3.5 px-4">Total Worked</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
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
                    <tr key={row.attendanceId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Employee Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#013e37] text-[#ffefb3] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
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
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {formatDate(row.attendanceDate)}
                      </td>

                      {/* Check-In Time */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatTime(row.checkInTime)}
                      </td>

                      {/* Check-In GPS Coordinates & Maps Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      </td>

                      {/* Check-Out Time */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {row.checkOutTime ? formatTime(row.checkOutTime) : (
                          <span className="text-amber-600 text-[11px] font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Check-Out GPS Coordinates & Maps Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      </td>

                      {/* Total Duration */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#013e37] whitespace-nowrap">
                        {workingHrs}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
