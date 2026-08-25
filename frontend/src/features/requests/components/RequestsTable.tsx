"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// API Helpers
import { fetchAttendanceRequests } from "@/features/attendance/api/attendance.api";
import { fetchLeaveRequests } from "@/features/leaves/api/leaves.api";
import { fetchReimbursementClaims, getCompanyIdCookie, getCurrentUserId } from "@/features/expenses/api/expenses.api";

export interface RequestHistoryItem {
  id: string; // "source-id", e.g., "attendance-5"
  requestDate: string; // "DD-MM-YYYY"
  requestType: "Attendance" | "Leave" | "Reimbursement";
  lastActionTakenBy: string;
  status: string;
  source: "attendance" | "leave" | "reimbursement";
  rawDate: Date; // Keep raw Date for chronological sorting
}

interface RequestsTableProps {
  onRowClick: (id: string) => void;
}

// Utility: Format Date string to DD-MM-YYYY
const formatDateToDDMMYYYY = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "";
  }
};

// Utility: Safe Approver ID mapping placeholders
const formatApproverName = (approvedBy: number | string | null | undefined): string => {
  if (!approvedBy) return "—";
  // Placeholder/lookup helper to map user IDs to names
  return "—"; 
};

export const RequestsTable: React.FC<RequestsTableProps> = ({ onRowClick }) => {
  const [data, setData] = useState<RequestHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsgs, setErrorMsgs] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState("01 May 2026 - 31 Aug 2026");
  const [currentPage, setCurrentPage] = useState(1);

  // Status mapping
  const normalizeStatus = (statusStr: string | null | undefined): string => {
    const s = String(statusStr || "PENDING").toUpperCase();
    if (s === "APPROVED" || s === "PAID") return "Approved";
    if (s === "REJECTED") return "Rejected";
    if (s === "CANCELLED") return "Cancelled";
    return "Pending"; // fallback for SUBMITTED, UNDER_REVIEW, DRAFT, PENDING, etc.
  };

  // Status style helper
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-emerald-700 bg-emerald-50 border-emerald-200/50";
      case "Rejected":
        return "text-rose-700 bg-rose-50 border-rose-200/50";
      case "Cancelled":
        return "text-slate-600 bg-slate-100 border-slate-200/50";
      case "Pending":
      default:
        return "text-amber-700 bg-amber-50 border-amber-200/50";
    }
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMsgs([]);

      const companyId = getCompanyIdCookie();
      const userId = getCurrentUserId();

      // Retrieve user role from cookie or localStorage
      let userRole: string | null = null;
      if (typeof window !== "undefined") {
        userRole = document.cookie.match(/(?:^|; )user_role=([^;]*)/)?.[1] || localStorage.getItem("user_role");
      }

      const isAdminOrSuperAdmin = userRole === "admin" || userRole === "superadmin" || userRole === "owner";
      const filterUserId = isAdminOrSuperAdmin ? undefined : (userId || undefined);

      if (!companyId && userRole !== "owner") {
        if (active) {
          setErrorMsgs(["Session expired. Please log in again."]);
          setIsLoading(false);
        }
        return;
      }

      // Fetch all three sources concurrently
      const results = await Promise.allSettled([
        fetchAttendanceRequests(filterUserId).catch((err) => {
          throw new Error(`Attendance: ${err.message || err}`);
        }),
        fetchLeaveRequests(filterUserId).catch((err) => {
          throw new Error(`Leave: ${err.message || err}`);
        }),
        fetchReimbursementClaims(companyId || 0, filterUserId).catch((err) => {
          throw new Error(`Reimbursement: ${err.message || err}`);
        }),
      ]);

      if (!active) return;

      const normalizedItems: RequestHistoryItem[] = [];
      const errorsList: string[] = [];

      // Process Attendance Requests
      const attRes = results[0];
      if (attRes.status === "fulfilled") {
        const val = attRes.value;
        if (val.success && Array.isArray(val.data)) {
          val.data.forEach((req: any) => {
            let lastAction = "—";
            if (req.approvedUser) {
              lastAction = `${req.approvedUser.firstName} ${req.approvedUser.lastName || ""}`.trim();
            } else if (req.approvedBy) {
              lastAction = formatApproverName(req.approvedBy);
            }
            normalizedItems.push({
              id: `attendance-${req.requestId}`,
              requestDate: formatDateToDDMMYYYY(req.shiftDate),
              requestType: "Attendance",
              lastActionTakenBy: lastAction,
              status: normalizeStatus(req.status),
              source: "attendance",
              rawDate: req.shiftDate ? new Date(req.shiftDate) : new Date(req.createdAt || Date.now()),
            });
          });
        } else if (val.success === false) {
          errorsList.push(val.message || "Failed to fetch attendance requests.");
        }
      } else {
        errorsList.push(attRes.reason?.message || "Failed to fetch attendance requests.");
      }

      // Process Leave Requests
      const leaveRes = results[1];
      if (leaveRes.status === "fulfilled") {
        const val = leaveRes.value;
        if (val.success && Array.isArray(val.data)) {
          val.data.forEach((req: any) => {
            let lastAction = "—";
            if (req.approvedBy) {
              lastAction = formatApproverName(req.approvedBy);
            }
            normalizedItems.push({
              id: `leave-${req.leaveRequestId}`,
              requestDate: formatDateToDDMMYYYY(req.createdAt || req.fromDate),
              requestType: "Leave",
              lastActionTakenBy: lastAction,
              status: normalizeStatus(req.status),
              source: "leave",
              rawDate: req.createdAt ? new Date(req.createdAt) : new Date(req.fromDate || Date.now()),
            });
          });
        } else if (val.success === false) {
          errorsList.push(val.error || "Failed to fetch leave requests.");
        }
      } else {
        errorsList.push(leaveRes.reason?.message || "Failed to fetch leave requests.");
      }

      // Process Reimbursement Claims
      const claimRes = results[2];
      if (claimRes.status === "fulfilled") {
        const val = claimRes.value;
        if (val.success && Array.isArray(val.data)) {
          val.data.forEach((req: any) => {
            let lastAction = "—";
            if (req.approvedBy) {
              lastAction = formatApproverName(req.approvedBy);
            }
            normalizedItems.push({
              id: `reimbursement-${req.claimId}`,
              requestDate: formatDateToDDMMYYYY(req.claimDate || req.submittedAt || req.createdAt),
              requestType: "Reimbursement",
              lastActionTakenBy: lastAction,
              status: normalizeStatus(req.status),
              source: "reimbursement",
              rawDate: req.claimDate ? new Date(req.claimDate) : new Date(req.createdAt || Date.now()),
            });
          });
        } else if (val.success === false) {
          errorsList.push(val.message || "Failed to fetch reimbursement claims.");
        }
      } else {
        errorsList.push(claimRes.reason?.message || "Failed to fetch reimbursement claims.");
      }

      // Sort by newest requests first
      normalizedItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      setData(normalizedItems);
      if (errorsList.length > 0) {
        setErrorMsgs(errorsList);
      }
      setIsLoading(false);
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Utility to parse DD-MM-YYYY into Date
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  // Utility to check if a date is within range
  const isWithinRange = (dateStr: string, rangeStr: string): boolean => {
    if (!rangeStr) return true;
    const rangeParts = rangeStr.split(" - ");
    if (rangeParts.length !== 2) return true;
    const startDate = parseDate(rangeParts[0]);
    const endDate = parseDate(rangeParts[1]);
    const itemDate = parseDate(dateStr);
    if (startDate && endDate && itemDate) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      itemDate.setHours(12, 0, 0, 0); // midday for safe comparison
      return itemDate >= startDate && itemDate <= endDate;
    }
    return true;
  };

  const filteredData = data.filter((row) => {
    // 1. Search Query Match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      row.requestType.toLowerCase().includes(q) ||
      row.lastActionTakenBy.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q) ||
      row.requestDate.toLowerCase().includes(q);

    // 2. Date Range Match
    const matchesDate = isWithinRange(row.requestDate, dateRange);

    return matchesSearch && matchesDate;
  });

  // Pagination calculations
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / showEntries) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * showEntries;
  const endIndex = Math.min(startIndex + showEntries, totalEntries);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs hover:shadow-xs transition-all min-h-[500px] flex flex-col justify-between relative">
      <div>
        {/* Filters Header */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table items"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 text-sm placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <button
            onClick={() => setIsDatePickerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        </div>

        {/* Dynamic API errors notification */}
        {errorMsgs.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-amber-800 text-xs font-semibold space-y-1.5 animate-in fade-in">
            <span className="font-bold block text-sm">Some request records could not be loaded:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {errorMsgs.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Data Table */}
        <TableContainer>
          <Table className="min-w-[800px]">
            <TableHeader>
              <tr>
                <TableHead>Request Date</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Last Action Taken By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Shimmer Loading States
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    <TableCell className="py-4">
                      <div className="h-4 bg-slate-100 animate-pulse rounded-md w-24" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-slate-100 animate-pulse rounded-md w-24" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-slate-100 animate-pulse rounded-md w-40" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-6 bg-slate-100 animate-pulse rounded-full w-20" />
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="h-4 bg-slate-100 animate-pulse rounded-md w-4 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.map((row) => (
                <TableRow key={row.id} onClick={() => onRowClick(row.id)}>
                  <TableCell className="font-semibold text-slate-900">
                    {row.requestDate}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">{row.requestType}</TableCell>
                  <TableCell className="font-medium text-slate-700">{row.lastActionTakenBy}</TableCell>
                  <TableCell>
                    <span className={`inline-block text-[11px] font-extrabold px-3 py-0.5 rounded-full border ${getStatusStyles(row.status)}`}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all inline-block" />
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No matching requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Custom Date Picker Modal */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={(range) => {
          setDateRange(range);
          setCurrentPage(1); // Reset to page 1 on date range changes
        }}
      />

      {/* Footer Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-8 text-xs text-slate-500 font-medium">
        <span>
          Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
        </span>

        {/* Entries select dropdown */}
        <div className="flex items-center gap-1.5">
          <span>Show</span>
          <div className="relative">
            <select
              value={showEntries}
              onChange={(e) => {
                setShowEntries(Number(e.target.value));
                setCurrentPage(1); // Reset to page 1 on page size change
              }}
              className="appearance-none border border-slate-300 rounded-lg bg-white pl-2.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>entries</span>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-400 cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-400 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 bg-brand-primary border border-brand-primary text-white font-bold rounded-lg flex items-center justify-center text-xs shadow-xs">
            {safeCurrentPage}
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-400 cursor-pointer"
          >
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-400 cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

