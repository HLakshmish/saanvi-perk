import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, Calendar, User } from "lucide-react";
import { LeaveRequest } from "../types/leaves.types";

interface LeavesCalendarTabProps {
  requests: LeaveRequest[];
  onRowClick?: (id: string) => void;
}

export const LeavesCalendarTab: React.FC<LeavesCalendarTabProps> = ({
  requests,
  onRowClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedCellLeaves, setSelectedCellLeaves] = useState<LeaveRequest[] | null>(null);
  const [selectedCellDate, setSelectedCellDate] = useState<string>("");

  useEffect(() => {
    if (selectedCellLeaves) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCellLeaves]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-indexed

  // Helper to parse "dd-mm-yyyy" to a local Date object
  const parseDDMMYYYY = (str: string): Date => {
    if (!str) return new Date(NaN);
    const parts = str.split("-");
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(str);
  };

  // Helper to check if a specific calendar date is within a leave request range
  const isDateWithinRange = (date: Date, fromStr: string, toStr: string): boolean => {
    if (!fromStr || !toStr) return false;
    const fromDate = parseDDMMYYYY(fromStr);
    const toDate = parseDDMMYYYY(toStr);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;

    const checkTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const fromTime = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()).getTime();
    const toTime = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()).getTime();

    return checkTime >= fromTime && checkTime <= toTime;
  };

  const isWeekend = (d: Date) => {
    const day = d.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  const getInitials = (name: string): string => {
    if (!name) return "EE";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getLeaveTypeCode = (typeName: string): string => {
    if (!typeName) return "L";
    const name = typeName.toLowerCase();
    if (name.includes("sick") && name.includes("casual")) return "SL+CL";
    if (name.includes("sick")) return "SL";
    if (name.includes("casual")) return "CL";
    if (name.includes("earned")) return "EL";
    if (name.includes("loss") || name.includes("lop")) return "LOP";
    if (name.includes("comp")) return "COFF";
    return typeName.slice(0, 3).toUpperCase();
  };

  // Calendar math
  const startDay = new Date(year, month, 1).getDay(); // Weekday of 1st day (0 = Sun, 6 = Sat)
  const currentMonthDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Create grid cells
  const cells: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= currentMonthDays; i++) {
    cells.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid rows
  const totalCells = Math.ceil(cells.length / 7) * 7;
  const nextDaysCount = totalCells - cells.length;
  for (let i = 1; i <= nextDaysCount; i++) {
    cells.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const nextDate = new Date(prev);
      if (direction === "prev") {
        nextDate.setMonth(nextDate.getMonth() - 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      return nextDate;
    });
  };

  // Dynamic overview metric calculations
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const monthRequests = requests.filter(req => {
    const fromDate = parseDDMMYYYY(req.fromDate);
    const toDate = parseDDMMYYYY(req.toDate);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;
    return fromDate <= monthEnd && toDate >= monthStart;
  });

  const totalCount = monthRequests.length;
  const pendingCount = monthRequests.filter(r => r.status === "Pending").length;
  const approvedCount = monthRequests.filter(r => r.status === "Approved").length;
  const rejectedCount = monthRequests.filter(r => r.status === "Rejected").length;

  const getLightStatusStyles = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50/70 text-emerald-800 border-emerald-200/60 hover:bg-emerald-100/80";
      case "Pending":
        return "bg-amber-50/70 text-amber-800 border-amber-200/60 hover:bg-amber-100/80";
      case "Rejected":
        return "bg-rose-50/70 text-rose-800 border-rose-200/60 hover:bg-rose-100/80";
      case "Cancelled":
        return "bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100";
    }
  };

  const getEventBorderColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "border-l-[3px] border-emerald-500";
      case "Pending":
        return "border-l-[3px] border-amber-500";
      case "Rejected":
        return "border-l-[3px] border-rose-500";
      case "Cancelled":
        return "border-l-[3px] border-slate-400";
      default:
        return "border-l-[3px] border-slate-500";
    }
  };

  const handleCellClick = (cellDate: Date, leaves: LeaveRequest[]) => {
    if (leaves.length === 0) return;
    if (leaves.length === 1) {
      onRowClick?.(leaves[0].id);
    } else {
      setSelectedCellLeaves(leaves);
      setSelectedCellDate(cellDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }));
    }
  };

  const today = new Date();
  const isToday = (d: Date) => {
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 text-brand-primary shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Leave Overview
            </p>
          </div>
        </div>

        {/* Center / Navigation Controls */}
        <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 shadow-3xs rounded-2xl p-1 shrink-0 self-start md:self-auto">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-xl hover:bg-white hover:shadow-3xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-3xs border border-slate-250/50 hover:shadow-2xs transition-all cursor-pointer"
          >
            Today
          </button>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-xl hover:bg-white hover:shadow-3xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leave Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/60 border border-slate-200/60 p-3 rounded-3xl shadow-3xs">
        {/* Total Requests */}
        <div className="bg-white border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between shadow-3xs transition-shadow hover:shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Requests</span>
            <span className="text-xl font-black text-slate-800 block leading-none">{totalCount}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between shadow-3xs transition-shadow hover:shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-xl font-black text-amber-600 block leading-none">{pendingCount}</span>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 block animate-pulse" />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between shadow-3xs transition-shadow hover:shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Approved</span>
            <span className="text-xl font-black text-emerald-600 block leading-none">{approvedCount}</span>
          </div>
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between shadow-3xs transition-shadow hover:shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Rejected</span>
            <span className="text-xl font-black text-rose-600 block leading-none">{rejectedCount}</span>
          </div>
          <div className="p-2 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
            <span className="w-2 h-2 rounded-full bg-rose-500 block" />
          </div>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="w-full">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 pb-2 mb-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((dayName) => (
              <div
                key={dayName}
                className="text-center text-[10px] font-extrabold text-slate-400 tracking-wider uppercase"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {cells.map(({ date, isCurrentMonth }, idx) => {
              const cellLeaves = requests.filter(req =>
                isDateWithinRange(date, req.fromDate, req.toDate)
              );

              const cellHasLeaves = cellLeaves.length > 0;
              const cellIsToday = isToday(date);
              const cellIsWeekend = isWeekend(date);

              // Render up to 2 leaves on the cell grid, collapse the rest
              const displayedLeaves = cellLeaves.slice(0, 2);
              const remainingCount = cellLeaves.length - 2;

              return (
                <div
                  key={idx}
                  onClick={() => handleCellClick(date, cellLeaves)}
                  className={`min-h-[85px] sm:min-h-[105px] rounded-2xl border p-1.5 sm:p-2.5 flex flex-col justify-between transition-all select-none relative group duration-200 cursor-pointer ${isCurrentMonth
                      ? cellIsWeekend
                        ? "bg-slate-50/40 border-slate-200/50"
                        : "bg-white border-slate-200/80"
                      : "bg-slate-100/10 border-slate-100 text-slate-400"
                    } ${cellIsToday
                      ? "ring-2 ring-brand-primary/80 border-brand-primary"
                      : ""
                    } ${cellHasLeaves
                      ? "hover:bg-slate-50/70 hover:shadow-md hover:border-slate-350"
                      : "hover:bg-slate-50/20"
                    }`}
                >
                  {/* Day Number Row */}
                  <div className="flex justify-between items-center w-full mb-1">
                    <span
                      className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 ${isCurrentMonth
                          ? cellIsToday
                            ? "bg-brand-primary text-brand-btn-text shadow-2xs font-extrabold border border-brand-primary"
                            : "text-slate-800 font-bold group-hover:text-brand-primary"
                          : "text-slate-400 font-semibold"
                        }`}
                    >
                      {date.getDate()}
                    </span>
                    {cellIsToday && (
                      <span className="text-[8px] font-black text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90">
                        Today
                      </span>
                    )}
                  </div>

                  {/* List of Leaves */}
                  <div className="flex flex-col gap-1 w-full mt-auto">
                    {displayedLeaves.map((req) => (
                      <div
                        key={req.id}
                        title={`${req.employeeName || 'Employee'}: ${req.rawLeaveType || req.leaveType} (${req.status})`}
                        className={`w-full p-1 pl-1.5 rounded-lg border text-[9px] font-semibold truncate tracking-wide shadow-3xs flex items-center justify-between gap-1 hover:shadow-2xs transition-shadow duration-150 ${getLightStatusStyles(req.status)} ${getEventBorderColor(req.status)}`}
                      >
                        <span className="font-bold truncate max-w-[50px]">
                          {req.employeeName ? req.employeeName.split(' ')[0] : 'User'}
                        </span>
                        <span className="text-[8px] opacity-80 uppercase font-black shrink-0">
                          {getLeaveTypeCode(req.rawLeaveType || req.leaveType)}
                        </span>
                      </div>
                    ))}

                    {/* +X more items indicator */}
                    {remainingCount > 0 && (
                      <div className="text-[9px] font-bold text-slate-500 text-center py-0.5 bg-slate-50 border border-slate-200/60 rounded-md shadow-3xs mt-0.5">
                        +{remainingCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 border border-amber-300 shadow-3xs" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-300 shadow-3xs" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 border border-rose-300 shadow-3xs" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 border border-slate-300 shadow-3xs" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Multiple Leaves Selection Modal Overlay */}
      {selectedCellLeaves && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[480px] overflow-hidden flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl shrink-0 shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    {selectedCellDate}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                    {selectedCellLeaves.length} Leave {selectedCellLeaves.length === 1 ? "Request" : "Requests"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCellLeaves(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer border border-slate-200/50 bg-white shadow-3xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Leaves */}
            <div className="p-4 space-y-2.5 max-h-[350px] overflow-y-auto bg-slate-50/50">
              {selectedCellLeaves.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    onRowClick?.(req.id);
                    setSelectedCellLeaves(null);
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-3xs hover:shadow-2xs transition-all cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-black shadow-3xs shrink-0">
                        {getInitials(req.employeeName || "")}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-800 block leading-tight">
                          {req.employeeName || "Employee"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {req.rawLeaveType || req.leaveType}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-3xs ${getLightStatusStyles(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-2">
                    <span>
                      {req.fromDate} to {req.toDate}
                    </span>
                    <span className="text-slate-600 font-bold">
                      {req.days} {req.days === 1 ? "Day" : "Days"}
                    </span>
                  </div>

                  {req.remarks && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50/50 rounded-xl p-2.5 border border-slate-100 truncate">
                      &ldquo;{req.remarks}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => setSelectedCellLeaves(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
