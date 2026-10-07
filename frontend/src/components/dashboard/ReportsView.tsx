"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Star,
  FileText,
  Loader2,
  Download,
  Users,
  Clock,
  DollarSign,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Filter,
} from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import { SearchBox } from "@/components/ui/search-box";
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

// APIs
import {
  getEmployees,
  getUsersReportView,
  downloadUsersReport,
  getDepartments,
} from "@/features/employees/api/employees.api";
import {
  getAttendanceReportView,
  downloadAttendanceReport,
  fetchAttendanceRequests,
} from "@/features/attendance/api/attendance.api";
import {
  getLeaveRequestReportView,
  downloadLeaveRequestReport,
  fetchLeaveTypes,
} from "@/features/leaves/api/leaves.api";
import {
  getPayslips,
  getAllSalaryStructures,
} from "@/features/payroll/api/payroll.api";
import { fetchLeaveAccumulations } from "@/features/settings/api/settings.api";

// Date range calculation utility on frontend
const isDateWithinRange = (dateStr: string, rangeStr: string): boolean => {
  if (!dateStr || dateStr === "--") return false;
  
  const onlyDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();
  const dateParts = onlyDate.split("-");
  let recordDate: Date;
  if (dateParts.length === 3) {
    const y = parseInt(dateParts[0], 10);
    const m = parseInt(dateParts[1], 10) - 1;
    const d = parseInt(dateParts[2], 10);
    recordDate = new Date(y, m, d);
  } else {
    recordDate = new Date(onlyDate);
  }
  
  if (isNaN(recordDate.getTime())) return false;
  recordDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (rangeStr === "Today") {
    return recordDate.getTime() === today.getTime();
  }
  if (rangeStr === "Yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return recordDate.getTime() === yesterday.getTime();
  }
  if (rangeStr === "Last 7 Days") {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return recordDate >= sevenDaysAgo && recordDate <= today;
  }
  if (rangeStr === "This Month") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return recordDate >= startOfMonth && recordDate <= endOfMonth;
  }
  if (rangeStr === "Last Month") {
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return recordDate >= startOfLastMonth && recordDate <= endOfLastMonth;
  }

  // Custom range check: "DD-MM-YYYY - DD-MM-YYYY"
  const customMatch = rangeStr.match(/^(\d{2})-(\d{2})-(\d{4})\s*-\s*(\d{2})-(\d{2})-(\d{4})$/);
  if (customMatch) {
    const startDay = parseInt(customMatch[1], 10);
    const startMonth = parseInt(customMatch[2], 10) - 1;
    const startYear = parseInt(customMatch[3], 10);
    
    const endDay = parseInt(customMatch[4], 10);
    const endMonth = parseInt(customMatch[5], 10) - 1;
    const endYear = parseInt(customMatch[6], 10);

    const startDate = new Date(startYear, startMonth, startDay);
    const endDate = new Date(endYear, endMonth, endDay);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return recordDate >= startDate && recordDate <= endDate;
  }

  // Fallback for "01 Aug 2026 To 25 Aug 2026"
  if (rangeStr.includes("To") || rangeStr.includes("TO")) {
    const parts = rangeStr.split(/To|TO/i);
    if (parts.length === 2) {
      const startDate = new Date(parts[0].trim());
      const endDate = new Date(parts[1].trim());
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        return recordDate >= startDate && recordDate <= endDate;
      }
    }
  }

  return true; // Default fallback if range is not recognized or "All Time"
};

type ReportTab = "time-attendance" | "leaves" | "payroll" | "taxes" | "others";
type ReportView =
  | "grid"
  | "daily-attendance"
  | "attendance-summary"
  | "weekly-hours"
  | "monthly-hours"
  | "attendance-requests"
  | "leave-requests"
  | "leave-balances"
  | "monthly-salary"
  | "individual-salary"
  | "tax-report"
  | "employee-summary"
  | "inactive-employees"
  | "yearly-report";

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>("time-attendance");
  const [activeView, setActiveView] = useState<ReportView>("grid");

  // Metadata loaded from DB
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [leaveTypesList, setLeaveTypesList] = useState<any[]>([]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Common Filters
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("ALL");

  // Real data state (Loaded from DB)
  const [rawAttendanceData, setRawAttendanceData] = useState<any[] | null>(null);
  const [rawLeaveData, setRawLeaveData] = useState<any[] | null>(null);
  const [rawAttRequests, setRawAttRequests] = useState<any[] | null>(null);
  const [rawPayslips, setRawPayslips] = useState<any[] | null>(null);
  const [rawSalaryStructures, setRawSalaryStructures] = useState<any[] | null>(null);
  const [rawUsersData, setRawUsersData] = useState<any[] | null>(null);
  const [rawAllocations, setRawAllocations] = useState<any[] | null>(null);

  // Loaders
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Tabs List
  const tabs = [
    { id: "time-attendance", label: "Time and Attendance" },
    { id: "leaves", label: "Leaves" },
    { id: "payroll", label: "Payroll" },
    { id: "taxes", label: "Taxes" },
    { id: "others", label: "Others" },
  ];

  function getCompanyIdCookie(): number | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(/(?:^|; )company_id=([^;]*)/);
    return match && !isNaN(Number(match[1])) ? Number(match[1]) : undefined;
  }

  // Load Metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const cid = getCompanyIdCookie();
        const [usersReport, empData, ltData, deptData, accsData] = await Promise.all([
          getUsersReportView(cid ? { companyId: cid } : {}).catch(() => ({ success: false, data: [] })),
          getEmployees().catch(() => []),
          fetchLeaveTypes().catch(() => ({ success: false, data: [] })),
          getDepartments().catch(() => []),
          fetchLeaveAccumulations().catch(() => ({ success: false, data: [] })),
        ]);

        if (usersReport.success && Array.isArray(usersReport.data)) {
          setEmployees(usersReport.data);
          setRawUsersData(usersReport.data);
        } else if (Array.isArray(empData)) {
          setEmployees(empData);
          setRawUsersData(empData);
        }

        if (ltData.success && ltData.data) {
          const arr = Array.isArray(ltData.data) ? ltData.data : [ltData.data];
          setLeaveTypesList(arr);
        }

        if (Array.isArray(deptData)) {
          setDepartments(deptData);
        }

        if (accsData?.success && Array.isArray(accsData.data)) {
          setRawAllocations(accsData.data);
        }
      } catch (err) {
        console.error("Failed to load metadata for reports:", err);
      }
    };
    loadMetadata();
  }, []);

  const handleDatePresetChange = (value: string) => {
    if (value === "custom") {
      setIsDatePickerOpen(true);
    } else {
      setSelectedDateRange(value);
    }
  };

  // Generate Report Action (Fetches fresh database data per report view)
  const handleGenerateReport = async (viewOverride?: ReportView) => {
    const targetView = viewOverride || activeView;
    setIsGenerating(true);
    const cid = getCompanyIdCookie();

    try {
      if (
        targetView === "daily-attendance" ||
        targetView === "attendance-summary" ||
        targetView === "weekly-hours" ||
        targetView === "monthly-hours" ||
        targetView === "yearly-report"
      ) {
        const res = await getAttendanceReportView({
          userId: selectedUserId ? Number(selectedUserId) : undefined,
        });

        if (res.success && Array.isArray(res.data)) {
          setRawAttendanceData(res.data);
        } else {
          setRawAttendanceData([]);
        }
      }

      if (targetView === "attendance-requests") {
        const reqRes = await fetchAttendanceRequests(selectedUserId ? Number(selectedUserId) : undefined);
        const reqList = Array.isArray(reqRes?.data) ? reqRes.data : Array.isArray(reqRes) ? reqRes : [];
        setRawAttRequests(reqList);
      }

      if (
        targetView === "leave-requests" ||
        targetView === "leave-balances" ||
        targetView === "yearly-report"
      ) {
        const res = await getLeaveRequestReportView({
          ...(cid ? { companyId: cid } : {}),
          userId: selectedUserId ? Number(selectedUserId) : undefined,
        });

        if (res.success && Array.isArray(res.data)) {
          setRawLeaveData(res.data);
        } else {
          setRawLeaveData([]);
        }
      }

      if (
        targetView === "monthly-salary" ||
        targetView === "tax-report" ||
        targetView === "yearly-report"
      ) {
        const payRes = await getPayslips(
          { userId: selectedUserId ? Number(selectedUserId) : undefined },
          cid
        );
        if (payRes.success && Array.isArray(payRes.data)) {
          setRawPayslips(payRes.data);
        } else {
          setRawPayslips([]);
        }
      }

      if (targetView === "individual-salary") {
        const salRes = await getAllSalaryStructures(undefined, cid);
        if (salRes.success && Array.isArray(salRes.data)) {
          setRawSalaryStructures(salRes.data);
        } else {
          setRawSalaryStructures([]);
        }
      }

      if (
        targetView === "employee-summary" ||
        targetView === "inactive-employees"
      ) {
        const userRes = await getUsersReportView(cid ? { companyId: cid } : {});
        if (userRes.success && Array.isArray(userRes.data)) {
          setRawUsersData(userRes.data);
        } else {
          setRawUsersData([]);
        }
      }

      toast.success("Report data refreshed from database!");
    } catch (err: any) {
      toast.error(err.message || "Failed to load report from database.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openReportView = (view: ReportView) => {
    setActiveView(view);
    setSearchQuery("");
    setStatusFilter("ALL");
    setGenderFilter("ALL");
    setDepartmentFilter("ALL");
    setSelectedUserId("");
    setLeaveTypeFilter("ALL");
    handleGenerateReport(view);
  };

  const downloadClientCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      if (activeView === "daily-attendance" || activeView === "attendance-summary") {
        const headers = ["Employee Code", "Employee Name", "Department", "Gender", "Date", "Check In", "Check Out", "Working Hours", "Status"];
        const rows = filteredAttendance.map((row: any) => {
          const u = row.user || {};
          const hrs = Math.floor((row.workingMinutes || 0) / 60);
          const mins = (row.workingMinutes || 0) % 60;
          return [
            u.employeeCode || row.employee_code || `ST00${row.userId}`,
            `${u.firstName || row.first_name || ""} ${u.lastName || row.last_name || ""}`.trim() || "Employee",
            u.department?.departmentName || row.departmentName || row.department_name || "General",
            u.personalInformation?.gender || u.gender || row.gender || "N/A",
            row.attendanceDate ? row.attendanceDate.split("T")[0] : "--",
            formatTimeStr(row.checkInTime),
            formatTimeStr(row.checkOutTime),
            row.workingMinutes ? `${hrs}h ${mins}m` : "--",
            row.attendanceStatus || "PRESENT"
          ];
        });
        downloadClientCSV("daily_attendance_report", headers, rows);
        toast.success("Attendance report downloaded successfully!");
      } else if (activeView === "weekly-hours") {
        const headers = ["Employee Code", "Employee Name", "Department", "Gender", "Days Worked", "Total Worked Hours"];
        const rows = weeklyHoursSummary.map((r: any) => [r.code, r.name, r.dept, r.gender, `${r.daysWorked} days`, r.totalHoursStr]);
        downloadClientCSV("weekly_worked_hours_report", headers, rows);
        toast.success("Weekly worked hours report downloaded successfully!");
      } else if (activeView === "monthly-hours") {
        const headers = ["Employee Code", "Employee Name", "Department", "Present Days", "Half Days", "Absent Days", "Cumulative Worked Hours"];
        const rows = monthlyHoursSummary.map((r: any) => [r.code, r.name, r.dept, r.presentCount, r.halfDayCount, r.absentCount, r.totalHoursStr]);
        downloadClientCSV("monthly_worked_hours_report", headers, rows);
        toast.success("Monthly worked hours report downloaded successfully!");
      } else if (activeView === "attendance-requests") {
        const headers = ["Request ID", "Employee Code", "Employee Name", "Shift Date", "Proposed Check In", "Proposed Check Out", "Reason/Remarks", "Status"];
        const rows = filteredAttRequests.map((row: any) => {
          const u = row.user || {};
          return [
            row.requestId,
            u.employeeCode || `ST00${row.userId}`,
            `${u.firstName || ""} ${u.lastName || ""}`.trim(),
            row.shiftDate ? row.shiftDate.split("T")[0] : "--",
            formatTimeStr(row.checkInTime),
            formatTimeStr(row.checkOutTime),
            row.reason || row.remarks || "--",
            row.status || "PENDING"
          ];
        });
        downloadClientCSV("attendance_regularization_requests_report", headers, rows);
        toast.success("Attendance requests report downloaded successfully!");
      } else if (activeView === "leave-requests") {
        const headers = ["Employee Code", "Employee Name", "Department", "Leave Type", "From Date", "To Date", "Days", "Status"];
        const rows = filteredLeaveRequests.map((row: any) => {
          const u = row.user || {};
          return [
            u.employeeCode || `ST00${row.userId}`,
            `${u.firstName || ""} ${u.lastName || ""}`.trim(),
            u.department?.departmentName || row.departmentName || row.department_name || "General",
            row.leaveType?.leaveName || "Leave",
            row.fromDate ? row.fromDate.split("T")[0] : "--",
            row.toDate ? row.toDate.split("T")[0] : "--",
            row.numberOfDays || 1,
            row.status || "PENDING"
          ];
        });
        downloadClientCSV("leave_requests_report", headers, rows);
        toast.success("Leave requests report downloaded successfully!");
      } else if (activeView === "leave-balances") {
        const headers = [
          "Employee Code", "Employee Name", "Department",
          ...(leaveTypesList || []).map((lt: any) => `${lt.leaveName} Balance`),
          "Total Used", "Total Remaining"
        ];
        const rows = leaveBalancesSummary.map((r: any) => {
          const ltCells = (leaveTypesList || []).map((lt: any) => {
            const info = r.leaveTypeMap[lt.leaveName];
            return info?.isAssigned
              ? `${info.remaining} days left (${info.used} used of ${info.quota})`
              : "Unassigned (0 days allocated)";
          });
          return [r.code, r.name, r.dept, ...ltCells, `${r.totalUsed} days`, `${r.totalRemaining} days left`];
        });
        downloadClientCSV("leave_balances_summary_report", headers, rows);
        toast.success("Leave balances summary report downloaded successfully!");
      } else if (activeView === "monthly-salary") {
        const headers = ["Employee Code", "Employee Name", "Month/Year", "Gross Salary", "Basic", "Allowances", "Deductions", "Net Pay", "Status"];
        const rows = filteredPayslips.map((p: any, idx: number) => {
          const u = p.user || {};
          const empCode = u.employeeCode || p.employee_code || p.employeeCode || `ST00${p.userId || p.user_id || idx + 1}`;
          const empName = `${u.firstName || p.first_name || p.firstName || ""} ${u.lastName || p.last_name || p.lastName || ""}`.trim() || "Employee";
          const gross = p.grossEarned || p.gross_earned || p.grossEarnings || p.gross_salary || 0;
          const basic = p.basicEarned || p.basic_earned || p.basicPay || p.basic_monthly || 0;
          const allowances = (p.hraEarned || p.hra_earned || p.hra || 0) + (p.otherAllowancesEarned || p.other_allowances_earned || p.specialAllowance || 0);
          const deductions = p.totalDeductions || p.total_deductions || 0;
          const net = p.netPay || p.net_pay || p.netSalary || p.net_salary || 0;
          const status = p.paymentStatus || p.payment_status || p.status || "PROCESSED";
          return [empCode, empName, `${p.month}/${p.year}`, gross, basic, allowances, deductions, net, status];
        });
        downloadClientCSV("monthly_salary_report", headers, rows);
        toast.success("Monthly salary report downloaded successfully!");
      } else if (activeView === "individual-salary") {
        const headers = ["Employee Code", "Employee Name", "Department", "Monthly Gross", "Annual CTC", "Basic", "HRA", "Effective Date"];
        const rows = filteredSalaryStructures.map((s: any, idx: number) => {
          const u = s.user || {};
          const empCode = u.employeeCode || s.employee_code || s.employeeCode || `ST00${s.userId || s.user_id || idx + 1}`;
          const empName = `${u.firstName || s.first_name || s.firstName || ""} ${u.lastName || s.last_name || s.lastName || ""}`.trim() || "Employee";
          const deptName = u.department?.departmentName || s.department_name || s.departmentName || "General";
          const mGross = s.monthlyGross || s.monthly_gross || 0;
          const aCtc = s.annualCtc || s.annual_ctc || 0;
          const basic = s.basicAmount || s.basic_monthly || (s.basic_annual ? Math.round(s.basic_annual / 12) : 0);
          const hra = s.hraAmount || s.hra_monthly || (s.hra_annual ? Math.round(s.hra_annual / 12) : 0);
          const rawEffDate = s.effectiveDate || s.effective_date || s.created_at;
          const effDateStr = rawEffDate ? String(rawEffDate).split("T")[0] : "--";
          return [empCode, empName, deptName, mGross, aCtc, basic, hra, effDateStr];
        });
        downloadClientCSV("individual_salary_ctc_report", headers, rows);
        toast.success("Individual salary CTC report downloaded successfully!");
      } else if (activeView === "tax-report") {
        const headers = ["Employee Code", "Employee Name", "Period", "Employee PF (12%)", "Employer PF (13%)", "Employee ESI (0.75%)", "Professional Tax", "Total Statutory Tax"];
        const rows = filteredPayslips.map((p: any, idx: number) => {
          const u = p.user || {};
          const empCode = u.employeeCode || p.employee_code || p.employeeCode || `ST00${p.userId || p.user_id || idx + 1}`;
          const empName = `${u.firstName || p.first_name || p.firstName || ""} ${u.lastName || p.last_name || p.lastName || ""}`.trim() || "Employee";
          const empPf = Number(p.employeePf || p.employee_pf || 0);
          const emprPf = Number(p.employerPf || p.employer_pf || 0);
          const empEsi = Number(p.employeeEsi || p.employee_esi || 0);
          const pTax = Number(p.professionalTax || p.professional_tax || 0);
          const totTax = empPf + emprPf + empEsi + pTax;
          return [empCode, empName, `${p.month}/${p.year}`, empPf, emprPf, empEsi, pTax, totTax];
        });
        downloadClientCSV("tax_statutory_report", headers, rows);
        toast.success("Tax & statutory report downloaded successfully!");
      } else if (activeView === "employee-summary" || activeView === "inactive-employees") {
        const headers = ["Employee Code", "Employee Name", "Email", "Department", "Designation", "Gender", "Employment Type", "Joining Date", "Status"];
        const rows = filteredUsers.map((user: any) => [
          user.employeeCode || `ST00${user.userId}`,
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          user.officialEmail || "--",
          user.department?.departmentName || user.department_name || "General",
          user.designation?.designationName || "Employee",
          user.personalInformation?.gender || user.gender || "N/A",
          user.employmentType || "PERMANENT",
          user.joiningDate ? user.joiningDate.split("T")[0] : "--",
          user.status || "ACTIVE"
        ]);
        downloadClientCSV("employee_summary_report", headers, rows);
        toast.success("Employee directory report downloaded successfully!");
      } else if (activeView === "yearly-report") {
        const headers = ["Employee Code", "Employee Name", "Department", "Year", "Annual Worked Hours", "Approved Leaves Taken", "Annual Gross Paid"];
        const rows = filteredUsers.map((emp: any) => {
          const userAtts = (rawAttendanceData || []).filter((a: any) => Number(a.userId || a.user_id) === Number(emp.userId));
          const totMins = userAtts.reduce((acc: number, curr: any) => acc + (curr.workingMinutes || curr.working_minutes || 0), 0);
          const hrs = Math.floor(totMins / 60);

          const userLeaves = (rawLeaveData || []).filter((l: any) => Number(l.userId || l.user_id) === Number(emp.userId) && l.status?.toUpperCase() === "APPROVED");
          const totLeaves = userLeaves.reduce((acc: number, curr: any) => acc + (curr.numberOfDays || 1), 0);

          const userPays = (rawPayslips || []).filter((p: any) => Number(p.userId || p.user_id) === Number(emp.userId));
          const totPay = userPays.reduce((acc: number, curr: any) => acc + Number(curr.grossEarned || curr.gross_earned || curr.grossEarnings || 0), 0);

          return [
            emp.employeeCode || `ST00${emp.userId}`,
            `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
            emp.department?.departmentName || emp.department_name || "General",
            selectedYear,
            `${hrs} hours`,
            `${totLeaves} days`,
            `₹${totPay.toLocaleString()}`
          ];
        });
        downloadClientCSV("yearly_summary_report", headers, rows);
        toast.success("Yearly summary report downloaded successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to download CSV report");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToGrid = () => {
    setActiveView("grid");
    setSearchQuery("");
  };

  // ---------------------------------------------------------
  // REAL-TIME DATABASE FILTERED RESULTS (ZERO MOCK DATA)
  // ---------------------------------------------------------

  // Helper formatting for time
  const formatTimeStr = (timeStr?: string | null) => {
    if (!timeStr) return "--:--";
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return "--:--";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "--:--";
    }
  };

  // 1. Attendance Data Filtered
  const filteredAttendance = useMemo(() => {
    if (!rawAttendanceData) return [];
    return rawAttendanceData.filter((item: any) => {
      const u = item.user || {};
      const empName = `${u.firstName || item.first_name || ""} ${u.lastName || item.last_name || ""}`.trim() || "Employee";
      const empCode = u.employeeCode || item.employee_code || `ST00${item.userId || item.attendanceId}`;
      const email = u.officialEmail || item.official_email || "";
      const gender = (u.personalInformation?.gender || u.gender || item.gender || "").toUpperCase();
      const dept = (u.department?.departmentName || item.departmentName || item.department_name || "").toLowerCase();
      const status = (item.attendanceStatus || "PRESENT").toUpperCase();
      const dateStr = item.attendanceDate ? item.attendanceDate.split("T")[0] : "";

      const matchesSearch =
        searchQuery === "" ||
        empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender =
        genderFilter === "ALL" || gender === genderFilter.toUpperCase();

      const matchesDept =
        departmentFilter === "ALL" || dept.includes(departmentFilter.toLowerCase());

      const matchesUser =
        !selectedUserId || Number(item.userId) === Number(selectedUserId);

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      const matchesDate = isDateWithinRange(dateStr, selectedDateRange);

      return matchesSearch && matchesGender && matchesDept && matchesUser && matchesStatus && matchesDate;
    });
  }, [rawAttendanceData, searchQuery, genderFilter, departmentFilter, selectedUserId, statusFilter, selectedDateRange]);

  // 2. Weekly Hours Aggregation
  const weeklyHoursSummary = useMemo(() => {
    const map = new Map<number, { user: any; totalMinutes: number; daysWorked: number; rawItem: any }>();
    filteredAttendance.forEach((item: any) => {
      const uId = item.userId;
      if (!uId) return;
      const existing = map.get(uId) || { user: item.user, totalMinutes: 0, daysWorked: 0, rawItem: item };
      existing.totalMinutes += item.workingMinutes || 0;
      if (item.attendanceStatus === "PRESENT" || item.attendanceStatus === "HALF_DAY") {
        existing.daysWorked += 1;
      }
      map.set(uId, existing);
    });
    return Array.from(map.values()).map((val) => {
      const hrs = Math.floor(val.totalMinutes / 60);
      const mins = val.totalMinutes % 60;
      const u = val.user || {};
      const gender = u.personalInformation?.gender || u.gender || val.rawItem?.gender || "N/A";
      const dept = u.department?.departmentName || val.rawItem?.departmentName || val.rawItem?.department_name || "General";
      return {
        code: u.employeeCode || `ST00${u.userId}`,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Employee",
        dept,
        totalHoursStr: `${hrs}h ${mins}m`,
        daysWorked: val.daysWorked,
        gender,
      };
    });
  }, [filteredAttendance]);

  // 3. Monthly Hours Aggregation
  const monthlyHoursSummary = useMemo(() => {
    const map = new Map<number, { user: any; totalMinutes: number; presentCount: number; halfDayCount: number; absentCount: number; rawItem: any }>();
    filteredAttendance.forEach((item: any) => {
      const uId = item.userId;
      if (!uId) return;
      const existing = map.get(uId) || { user: item.user, totalMinutes: 0, presentCount: 0, halfDayCount: 0, absentCount: 0, rawItem: item };
      existing.totalMinutes += item.workingMinutes || 0;
      const st = (item.attendanceStatus || "").toUpperCase();
      if (st === "PRESENT") existing.presentCount += 1;
      else if (st === "HALF_DAY") existing.halfDayCount += 1;
      else if (st === "ABSENT") existing.absentCount += 1;
      map.set(uId, existing);
    });
    return Array.from(map.values()).map((val) => {
      const hrs = Math.floor(val.totalMinutes / 60);
      const mins = val.totalMinutes % 60;
      const u = val.user || {};
      const dept = u.department?.departmentName || val.rawItem?.departmentName || val.rawItem?.department_name || "General";
      return {
        code: u.employeeCode || `ST00${u.userId}`,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Employee",
        dept,
        totalHoursStr: `${hrs}h ${mins}m`,
        presentCount: val.presentCount,
        halfDayCount: val.halfDayCount,
        absentCount: val.absentCount,
      };
    });
  }, [filteredAttendance]);

  // 4. Attendance Requests Filtered
  const filteredAttRequests = useMemo(() => {
    if (!rawAttRequests) return [];
    return rawAttRequests.filter((item: any) => {
      const u = item.user || {};
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Employee";
      const code = u.employeeCode || `ST00${item.userId}`;
      const status = (item.status || "PENDING").toUpperCase();
      const dateStr = item.shiftDate ? item.shiftDate.split("T")[0] : "";

      const matchesSearch =
        searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUser = !selectedUserId || Number(item.userId) === Number(selectedUserId);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter.toUpperCase();
      const matchesDate = isDateWithinRange(dateStr, selectedDateRange);

      return matchesSearch && matchesUser && matchesStatus && matchesDate;
    });
  }, [rawAttRequests, searchQuery, selectedUserId, statusFilter, selectedDateRange]);

  // 5. Leave Requests Filtered
  const filteredLeaveRequests = useMemo(() => {
    if (!rawLeaveData) return [];
    return rawLeaveData.filter((item: any) => {
      const u = item.user || {};
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Employee";
      const code = u.employeeCode || `ST00${item.userId || item.leaveRequestId}`;
      const gender = (u.personalInformation?.gender || u.gender || item.gender || "").toUpperCase();
      const dept = (u.department?.departmentName || item.departmentName || item.department_name || "").toLowerCase();
      const type = item.leaveType?.leaveName || "Leave";
      const status = (item.status || "PENDING").toUpperCase();
      const dateStr = item.fromDate ? item.fromDate.split("T")[0] : "";

      const matchesSearch =
        searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender = genderFilter === "ALL" || gender === genderFilter.toUpperCase();
      const matchesDept = departmentFilter === "ALL" || dept.includes(departmentFilter.toLowerCase());
      const matchesUser = !selectedUserId || Number(item.userId) === Number(selectedUserId);
      const matchesType = leaveTypeFilter === "ALL" || type === leaveTypeFilter;
      const matchesStatus = statusFilter === "ALL" || status === statusFilter.toUpperCase();
      const matchesDate = isDateWithinRange(dateStr, selectedDateRange);

      return (
        matchesSearch &&
        matchesGender &&
        matchesDept &&
        matchesUser &&
        matchesType &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [rawLeaveData, searchQuery, genderFilter, departmentFilter, selectedUserId, leaveTypeFilter, statusFilter, selectedDateRange]);

  // 6. Leave Balances Aggregated from DB (Calculates Used & Remaining Balance using DB Allocations)
  const leaveBalancesSummary = useMemo(() => {
    const map = new Map<number, { user: any; leaveCounts: Record<string, number> }>();
    if (rawLeaveData) {
      rawLeaveData.forEach((l: any) => {
        if (l.status?.toUpperCase() !== "APPROVED") return;
        const uId = l.userId || l.user_id;
        if (!uId) return;
        const existing = map.get(Number(uId)) || { user: l.user, leaveCounts: {} };
        const lName = l.leaveType?.leaveName || l.leave_type_name || "Leave";
        existing.leaveCounts[lName] = (existing.leaveCounts[lName] || 0) + (l.numberOfDays || 1);
        map.set(Number(uId), existing);
      });
    }

    // Map of (userId_leaveTypeId) -> allocated numberOfLeaves from DB
    const allocMap = new Map<string, number>();
    if (Array.isArray(rawAllocations)) {
      rawAllocations.forEach((acc: any) => {
        if (acc.userId && acc.leaveTypeId && acc.status !== false) {
          const key = `${acc.userId}_${acc.leaveTypeId}`;
          allocMap.set(key, (allocMap.get(key) || 0) + Number(acc.numberOfLeaves || 0));
        }
      });
    }

    return employees.map((emp) => {
      const record = map.get(Number(emp.userId));
      const usedMap = record ? record.leaveCounts : {};

      const leaveTypeMap: Record<string, { used: number; remaining: number; quota: number; isAssigned: boolean }> = {};
      let totalQuota = 0;
      let totalUsed = 0;

      (leaveTypesList || []).forEach((lt: any) => {
        const lName = lt.leaveName;
        const used = usedMap[lName] || 0;
        const allocKey = `${emp.userId}_${lt.leaveTypeId}`;
        const hasAlloc = allocMap.has(allocKey);
        
        // Quota is derived from DB allocation if assigned, or 0 if unassigned
        const assignedQuota = hasAlloc ? (allocMap.get(allocKey) || 0) : 0;
        const isAssigned = hasAlloc && assignedQuota > 0;

        const quota = isAssigned ? assignedQuota : used;
        const remaining = isAssigned ? Math.max(0, quota - used) : 0;

        leaveTypeMap[lName] = { used, remaining, quota, isAssigned };

        if (isAssigned) {
          totalQuota += quota;
        }
        totalUsed += used;
      });

      const totalRemaining = Math.max(0, totalQuota - totalUsed);

      return {
        code: emp.employeeCode || `ST00${emp.userId}`,
        name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
        dept: emp.department?.departmentName || emp.department_name || "General",
        leaveTypeMap,
        totalQuota,
        totalUsed,
        totalRemaining,
      };
    });
  }, [rawLeaveData, employees, leaveTypesList, rawAllocations]);

  // 7. Monthly Payslips Filtered
  const filteredPayslips = useMemo(() => {
    if (!rawPayslips) return [];
    return rawPayslips.filter((p: any) => {
      const u = p.user || {};
      const name = `${u.firstName || p.first_name || ""} ${u.lastName || p.last_name || ""}`.trim() || "Employee";
      const code = u.employeeCode || p.employee_code || `ST00${p.userId || p.user_id}`;
      const dept = (u.department?.departmentName || p.department_name || "").toLowerCase();
      const gender = (u.personalInformation?.gender || u.gender || p.gender || "").toUpperCase();

      const matchesSearch =
        searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender = genderFilter === "ALL" || gender === genderFilter.toUpperCase();
      const matchesDept = departmentFilter === "ALL" || dept.includes(departmentFilter.toLowerCase());
      const matchesUser = !selectedUserId || Number(p.userId || p.user_id) === Number(selectedUserId);
      const matchesYear = !selectedYear || Number(p.year) === Number(selectedYear);

      return matchesSearch && matchesGender && matchesDept && matchesUser && matchesYear;
    });
  }, [rawPayslips, searchQuery, genderFilter, departmentFilter, selectedUserId, selectedYear]);

  // 8. Individual Salary Structures Filtered
  const filteredSalaryStructures = useMemo(() => {
    if (!rawSalaryStructures) return [];
    return rawSalaryStructures.filter((s: any) => {
      const u = s.user || {};
      const name = `${u.firstName || s.first_name || ""} ${u.lastName || s.last_name || ""}`.trim() || "Employee";
      const code = u.employeeCode || s.employee_code || `ST00${s.userId || s.user_id}`;
      const dept = (u.department?.departmentName || s.department_name || "").toLowerCase();
      const gender = (u.personalInformation?.gender || u.gender || s.gender || "").toUpperCase();

      const matchesSearch =
        searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender = genderFilter === "ALL" || gender === genderFilter.toUpperCase();
      const matchesDept = departmentFilter === "ALL" || dept.includes(departmentFilter.toLowerCase());
      const matchesUser = !selectedUserId || Number(s.userId || s.user_id) === Number(selectedUserId);

      return matchesSearch && matchesGender && matchesDept && matchesUser;
    });
  }, [rawSalaryStructures, searchQuery, genderFilter, departmentFilter, selectedUserId]);

  // 9. Employee Users Directory Filtered
  const filteredUsers = useMemo(() => {
    if (!rawUsersData) return [];
    return rawUsersData.filter((user: any) => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const code = user.employeeCode || `ST00${user.userId}`;
      const email = user.officialEmail || "";
      const gender = (user.gender || user.personalInformation?.gender || "").toUpperCase();
      const dept = (user.department?.departmentName || user.department_name || "").toLowerCase();
      const status = (user.status || "ACTIVE").toUpperCase();

      const matchesSearch =
        searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender = genderFilter === "ALL" || gender === genderFilter.toUpperCase();
      const matchesDept = departmentFilter === "ALL" || dept.includes(departmentFilter.toLowerCase());
      const matchesUser = !selectedUserId || Number(user.userId) === Number(selectedUserId);

      let matchesStatus = true;
      if (activeView === "inactive-employees") {
        matchesStatus = status !== "ACTIVE";
      } else if (statusFilter !== "ALL") {
        matchesStatus = status === statusFilter.toUpperCase();
      }

      return matchesSearch && matchesGender && matchesDept && matchesUser && matchesStatus;
    });
  }, [rawUsersData, searchQuery, genderFilter, departmentFilter, selectedUserId, statusFilter, activeView]);

  return (
    <div className="space-y-6">
      {/* Custom Date Range Picker Modal */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={(rangeStr) => {
          setSelectedDateRange(rangeStr);
          setIsDatePickerOpen(false);
        }}
      />

      {/* Reports Header & Tab Bar */}
      {activeView === "grid" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time database audit, payroll, time-card, and HR summary reports
            </p>
          </div>

          {/* Horizontal Tab Links */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-2xs self-start overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-brand-primary text-brand-btn-text shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. REPORT GRID SELECTION VIEW                            */}
      {/* ========================================================= */}
      {activeView === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* TIME AND ATTENDANCE TAB */}
          {activeTab === "time-attendance" && (
            <>
              {/* Daily Attendance Report */}
              <div
                onClick={() => openReportView("daily-attendance")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Attendance
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Daily Attendance Report
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Check In/Out times, worked hours and daily status log
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>

              {/* Attendance Summary */}
              <div
                onClick={() => openReportView("attendance-summary")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Attendance
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Attendance Summary
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Customised report from time card summary
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>

              {/* Weekly Attendance Total Hours */}
              <div
                onClick={() => openReportView("weekly-hours")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Weekly
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Hours Worked Weekly
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Cumulative weekly hours worked using actual database logs
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>

              {/* Monthly Attendance Total Hours */}
              <div
                onClick={() => openReportView("monthly-hours")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Monthly
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Hours Worked Monthly
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Cumulative monthly hours worked & breakdown per employee
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>

              {/* Attendance Requests */}
              <div
                onClick={() => openReportView("attendance-requests")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Requests
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Attendance Requests
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      List of requests raised for attendance regularization
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>
            </>
          )}

          {/* LEAVES TAB */}
          {activeTab === "leaves" && (
            <>
              {/* Leave Requests Report */}
              <div
                onClick={() => openReportView("leave-requests")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Leaves
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Leave Requests Report
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      List of Leave requests and their approval status
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>

              {/* Leave Balances Summary */}
              <div
                onClick={() => openReportView("leave-balances")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Balances
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Leave Balances & Summary
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Summary of employee leave balances and usage
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>
            </>
          )}

          {/* PAYROLL TAB */}
          {activeTab === "payroll" && (
            <>
              {/* Monthly Salary Report */}
              <div
                onClick={() => openReportView("monthly-salary")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Payroll
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Monthly Salary Report
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Monthly payslip breakdown: Gross, Allowances, Deductions & Net
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>

              {/* Individual Salary Report */}
              <div
                onClick={() => openReportView("individual-salary")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      CTC Structure
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Individual Salary Report
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Active salary structure & CTC breakdown per employee
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>
            </>
          )}

          {/* TAXES TAB */}
          {activeTab === "taxes" && (
            <div
              onClick={() => openReportView("tax-report")}
              className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Statutory
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                    Tax & Statutory Report
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    PF, ESI, Professional Tax, TDS and statutory contributions
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                Generate Report &rarr;
              </div>
            </div>
          )}

          {/* OTHERS TAB */}
          {activeTab === "others" && (
            <>
              {/* Employee Summary Report */}
              <div
                onClick={() => openReportView("employee-summary")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Employees
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Employee Summary Report
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Complete employee directory with joining date, gender, status
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  View Report &rarr;
                </div>
              </div>

              {/* Inactive Employee Report */}
              <div
                onClick={() => openReportView("inactive-employees")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Inactive
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Inactive Employee Report
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Report of inactive, resigned, or terminated employees
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  View Report &rarr;
                </div>
              </div>

              {/* Yearly HR Report */}
              <div
                onClick={() => openReportView("yearly-report")}
                className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Annual
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors">
                      Yearly Summary Report
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Annual HR metrics: total hours, leaves taken & payroll processed
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-brand-primary/80 group-hover:underline self-start">
                  Generate Report &rarr;
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REPORT DETAIL VIEW WITH FILTERS & CSV EXPORT          */}
      {/* ========================================================= */}
      {activeView !== "grid" && (
        <div className="space-y-5">
          {/* Breadcrumb Back Button */}
          <button
            onClick={handleBackToGrid}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Reports</span>
          </button>

          {/* Main Report Container Card */}
          <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-2xs space-y-6">
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {activeView === "daily-attendance" && "Daily Attendance Report"}
                  {activeView === "attendance-summary" && "Attendance Summary Report"}
                  {activeView === "weekly-hours" && "Hours Worked Weekly Report"}
                  {activeView === "monthly-hours" && "Hours Worked Monthly Report"}
                  {activeView === "attendance-requests" && "Attendance Regularization Requests Report"}
                  {activeView === "leave-requests" && "Leave Requests Report"}
                  {activeView === "leave-balances" && "Leave Balances & Summary Report"}
                  {activeView === "monthly-salary" && "Monthly Salary Report"}
                  {activeView === "individual-salary" && "Individual Salary & CTC Report"}
                  {activeView === "tax-report" && "Tax & Statutory Deductions Report"}
                  {activeView === "employee-summary" && "Employee Summary Report"}
                  {activeView === "inactive-employees" && "Inactive Employee Report"}
                  {activeView === "yearly-report" && `Yearly HR Summary Report (${selectedYear})`}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Filtered database audit view with export support
                </p>
              </div>

              {/* Action Buttons: CSV & Refresh */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all duration-200 cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => handleGenerateReport()}
                  disabled={isGenerating}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-extrabold text-xs rounded-xl shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-btn-text" />
                  ) : (
                    <span>Refresh</span>
                  )}
                </button>
              </div>
            </div>

            {/* AUDIT FILTER BAR (Universal Filters: Search, Gender, Department, Employee, Date Range / Year) */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                <Filter className="w-3.5 h-3.5 text-brand-primary" />
                <span>Filters & Options</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Search Box */}
                <div className="w-60">
                  <SearchBox
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search name, code, email..."
                  />
                </div>

                {/* Date Preset Selector (for date-based reports) */}
                {activeView !== "individual-salary" &&
                  activeView !== "employee-summary" &&
                  activeView !== "inactive-employees" &&
                  activeView !== "yearly-report" && (
                    <select
                      value={selectedDateRange}
                      onChange={(e) => handleDatePresetChange(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
                    >
                      <option value={selectedDateRange}>{selectedDateRange}</option>
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="This Month">This Month</option>
                      <option value="Last Month">Last Month</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  )}

                {/* Year Selector for Annual Reports */}
                {(activeView === "yearly-report" || activeView === "monthly-salary") && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
                  >
                    {[2024, 2025, 2026, 2027].map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr}
                      </option>
                    ))}
                  </select>
                )}

                {/* Gender Filter */}
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>

                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d: any) => (
                    <option key={d.departmentId} value={d.departmentName}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>

                {/* Employee Filter */}
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : "")}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs max-w-xs"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp: any) => (
                    <option key={emp.userId} value={emp.userId}>
                      {emp.firstName} {emp.lastName || ""} ({emp.employeeCode || emp.userId})
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                {(activeView === "daily-attendance" || activeView === "attendance-summary") && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PRESENT">Present</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                )}

                {activeView === "leave-requests" && (
                  <>
                    <select
                      value={leaveTypeFilter}
                      onChange={(e) => setLeaveTypeFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
                    >
                      <option value="ALL">All Leave Types</option>
                      {leaveTypesList.map((lt: any) => (
                        <option key={lt.leaveTypeId} value={lt.leaveName}>
                          {lt.leaveName}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </>
                )}
              </div>
            </div>

            {/* TABLE RENDERINGS */}
            {isGenerating ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                <p className="text-xs font-bold text-slate-500">Compiling database records...</p>
              </div>
            ) : (
              <TableContainer>
                {/* 1. DAILY ATTENDANCE & ATTENDANCE SUMMARY */}
                {(activeView === "daily-attendance" || activeView === "attendance-summary") && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendance.length > 0 ? (
                        filteredAttendance.map((row: any, idx: number) => {
                          const u = row.user || {};
                          const hrs = Math.floor((row.workingMinutes || 0) / 60);
                          const mins = (row.workingMinutes || 0) % 60;
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-xs text-slate-500">{u.employeeCode || `ST00${row.userId}`}</TableCell>
                              <TableCell className="font-bold text-slate-800">{u.firstName} {u.lastName || ""}</TableCell>
                              <TableCell className="text-slate-600">{u.department?.departmentName || row.departmentName || row.department_name || "General"}</TableCell>
                              <TableCell className="text-slate-600">{u.personalInformation?.gender || u.gender || row.gender || "N/A"}</TableCell>
                              <TableCell className="font-mono text-xs">{row.attendanceDate ? row.attendanceDate.split("T")[0] : "--"}</TableCell>
                              <TableCell className="font-mono text-xs">{formatTimeStr(row.checkInTime)}</TableCell>
                              <TableCell className="font-mono text-xs">{formatTimeStr(row.checkOutTime)}</TableCell>
                              <TableCell className="font-mono text-xs font-bold text-brand-primary">{row.workingMinutes ? `${hrs}h ${mins}m` : "--"}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  row.attendanceStatus === "PRESENT"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : row.attendanceStatus === "HALF_DAY"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}>
                                  {row.attendanceStatus || "PRESENT"}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-slate-400 font-medium">
                            No attendance records match the selected database criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 2. WEEKLY ATTENDANCE HOURS */}
                {activeView === "weekly-hours" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Employee Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Days Worked</TableHead>
                        <TableHead>Total Worked Hours</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {weeklyHoursSummary.length > 0 ? (
                        weeklyHoursSummary.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs text-slate-500">{row.code}</TableCell>
                            <TableCell className="font-bold text-slate-800">{row.name}</TableCell>
                            <TableCell className="text-slate-600">{row.dept}</TableCell>
                            <TableCell className="text-slate-600">{row.gender}</TableCell>
                            <TableCell className="font-bold text-slate-700">{row.daysWorked} days</TableCell>
                            <TableCell className="font-mono font-black text-brand-primary">{row.totalHoursStr}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                            No weekly attendance data found for current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 3. MONTHLY ATTENDANCE HOURS */}
                {activeView === "monthly-hours" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Employee Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Present Days</TableHead>
                        <TableHead>Half Days</TableHead>
                        <TableHead>Absent Days</TableHead>
                        <TableHead>Cumulative Worked Hours</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {monthlyHoursSummary.length > 0 ? (
                        monthlyHoursSummary.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs text-slate-500">{row.code}</TableCell>
                            <TableCell className="font-bold text-slate-800">{row.name}</TableCell>
                            <TableCell className="text-slate-600">{row.dept}</TableCell>
                            <TableCell className="text-emerald-700 font-bold">{row.presentCount}</TableCell>
                            <TableCell className="text-amber-700 font-bold">{row.halfDayCount}</TableCell>
                            <TableCell className="text-rose-700 font-bold">{row.absentCount}</TableCell>
                            <TableCell className="font-mono font-black text-brand-primary">{row.totalHoursStr}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                            No monthly attendance records found in database.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 4. ATTENDANCE REQUESTS */}
                {activeView === "attendance-requests" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Req ID</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Shift Date</TableHead>
                        <TableHead>Proposed In</TableHead>
                        <TableHead>Proposed Out</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredAttRequests.length > 0 ? (
                        filteredAttRequests.map((row: any, idx: number) => {
                          const u = row.user || {};
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-xs text-slate-500">#{row.requestId}</TableCell>
                              <TableCell className="font-bold text-slate-800">{u.firstName} {u.lastName || ""}</TableCell>
                              <TableCell className="font-mono text-xs">{row.shiftDate ? row.shiftDate.split("T")[0] : "--"}</TableCell>
                              <TableCell className="font-mono text-xs">{formatTimeStr(row.checkInTime)}</TableCell>
                              <TableCell className="font-mono text-xs">{formatTimeStr(row.checkOutTime)}</TableCell>
                              <TableCell className="text-slate-600">{row.reason || row.remarks || "--"}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  row.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : row.status === "REJECTED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {row.status || "PENDING"}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                            No attendance regularization requests found in database.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 5. LEAVE REQUESTS REPORT */}
                {activeView === "leave-requests" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>From Date</TableHead>
                        <TableHead>To Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaveRequests.length > 0 ? (
                        filteredLeaveRequests.map((row: any, idx: number) => {
                          const u = row.user || {};
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-xs text-slate-500">{u.employeeCode || `ST00${row.userId}`}</TableCell>
                              <TableCell className="font-bold text-slate-800">{u.firstName} {u.lastName || ""}</TableCell>
                              <TableCell className="text-slate-600">{u.department?.departmentName || row.departmentName || row.department_name || "General"}</TableCell>
                              <TableCell className="text-slate-700 font-semibold">{row.leaveType?.leaveName || "Leave"}</TableCell>
                              <TableCell className="font-mono text-xs">{row.fromDate ? row.fromDate.split("T")[0] : "--"}</TableCell>
                              <TableCell className="font-mono text-xs">{row.toDate ? row.toDate.split("T")[0] : "--"}</TableCell>
                              <TableCell className="font-bold">{row.numberOfDays || 1}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  row.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : row.status === "REJECTED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {row.status || "PENDING"}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                            No leave requests match the selected criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 6. LEAVE BALANCES */}
                {activeView === "leave-balances" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Employee Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        {leaveTypesList.map((lt: any) => (
                          <TableHead key={lt.leaveTypeId}>{lt.leaveName} Balance</TableHead>
                        ))}
                        <TableHead>Total Used</TableHead>
                        <TableHead>Total Remaining</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {leaveBalancesSummary.length > 0 ? (
                        leaveBalancesSummary.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs text-slate-500">{row.code}</TableCell>
                            <TableCell className="font-bold text-slate-800">{row.name}</TableCell>
                            <TableCell className="text-slate-600">{row.dept}</TableCell>
                            {leaveTypesList.map((lt: any) => {
                              const info = row.leaveTypeMap[lt.leaveName] || { used: 0, remaining: 0, quota: 0, isAssigned: false };
                              if (!info.isAssigned && info.used === 0) {
                                return (
                                  <TableCell key={lt.leaveTypeId} className="font-mono text-xs">
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-slate-400">Unassigned</span>
                                      <span className="text-[10px] text-slate-400 font-medium">0 days allocated</span>
                                    </div>
                                  </TableCell>
                                );
                              }
                              return (
                                <TableCell key={lt.leaveTypeId} className="font-mono text-xs">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-emerald-700">{info.remaining} days remaining</span>
                                    <span className="text-[10px] text-slate-400 font-medium">({info.used} used of {info.quota})</span>
                                  </div>
                                </TableCell>
                              );
                            })}
                            <TableCell className="font-mono font-bold text-slate-700">{row.totalUsed} days</TableCell>
                            <TableCell className="font-mono font-black text-emerald-700">
                              <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl text-emerald-700 inline-block">
                                {row.totalRemaining} days left
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5 + leaveTypesList.length} className="text-center py-8 text-slate-400 font-medium">
                            No leave balances found in database.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 7. MONTHLY SALARY REPORT */}
                {activeView === "monthly-salary" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Basic</TableHead>
                        <TableHead>Allowances</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredPayslips.length > 0 ? (
                        filteredPayslips.map((p: any, idx: number) => {
                          const u = p.user || {};
                          const empCode = u.employeeCode || p.employee_code || p.employeeCode || `ST00${p.userId || p.user_id || idx + 1}`;
                          const empName = `${u.firstName || p.first_name || p.firstName || ""} ${u.lastName || p.last_name || p.lastName || ""}`.trim() || "Employee";
                          const gross = p.grossEarned || p.gross_earned || p.grossEarnings || p.gross_salary || 0;
                          const basic = p.basicEarned || p.basic_earned || p.basicPay || p.basic_monthly || 0;
                          const allowances = (p.hraEarned || p.hra_earned || p.hra || 0) + (p.otherAllowancesEarned || p.other_allowances_earned || p.specialAllowance || 0);
                          const deductions = p.totalDeductions || p.total_deductions || 0;
                          const net = p.netPay || p.net_pay || p.netSalary || p.net_salary || 0;
                          const status = p.paymentStatus || p.payment_status || p.status || "PROCESSED";
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-xs text-slate-500">{empCode}</TableCell>
                              <TableCell className="font-bold text-slate-800">{empName}</TableCell>
                              <TableCell className="font-mono text-xs">{p.month}/{p.year}</TableCell>
                              <TableCell className="font-mono font-bold">₹{Number(gross).toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{Number(basic).toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{Number(allowances).toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-rose-600">₹{Number(deductions).toLocaleString()}</TableCell>
                              <TableCell className="font-mono font-black text-brand-primary">₹{Number(net).toLocaleString()}</TableCell>
                              <TableCell>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {status}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-slate-400 font-medium">
                            No monthly salary/payslip records found in database for the selected period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 8. INDIVIDUAL SALARY REPORT */}
                {activeView === "individual-salary" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Monthly Gross</TableHead>
                        <TableHead>Annual CTC</TableHead>
                        <TableHead>Basic</TableHead>
                        <TableHead>HRA</TableHead>
                        <TableHead>Effective Date</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredSalaryStructures.length > 0 ? (
                        filteredSalaryStructures.map((s: any, idx: number) => {
                          const u = s.user || {};
                          const empCode = u.employeeCode || s.employee_code || s.employeeCode || `ST00${s.userId || s.user_id || idx + 1}`;
                          const empName = `${u.firstName || s.first_name || s.firstName || ""} ${u.lastName || s.last_name || s.lastName || ""}`.trim() || "Employee";
                          const deptName = u.department?.departmentName || s.department_name || s.departmentName || "General";
                          const mGross = s.monthlyGross || s.monthly_gross || 0;
                          const aCtc = s.annualCtc || s.annual_ctc || 0;
                          const basic = s.basicAmount || s.basic_monthly || (s.basic_annual ? Math.round(s.basic_annual / 12) : 0);
                          const hra = s.hraAmount || s.hra_monthly || (s.hra_annual ? Math.round(s.hra_annual / 12) : 0);
                          const rawEffDate = s.effectiveDate || s.effective_date || s.created_at;
                          const effDateStr = rawEffDate ? String(rawEffDate).split("T")[0] : "--";
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-xs text-slate-500">{empCode}</TableCell>
                              <TableCell className="font-bold text-slate-800">{empName}</TableCell>
                              <TableCell className="text-slate-600">{deptName}</TableCell>
                              <TableCell className="font-mono font-bold">₹{Number(mGross).toLocaleString()}</TableCell>
                              <TableCell className="font-mono font-black text-brand-primary">₹{Number(aCtc).toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{Number(basic).toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{Number(hra).toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-xs">{effDateStr}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                            No employee salary structures found in database.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 9. TAX REPORT */}
                {activeView === "tax-report" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Employee PF (12%)</TableHead>
                        <TableHead>Employer PF (13%)</TableHead>
                        <TableHead>Employee ESI (0.75%)</TableHead>
                        <TableHead>Professional Tax</TableHead>
                        <TableHead>Total Statutory Tax</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredPayslips.length > 0 ? (
                        filteredPayslips.map((p: any, idx: number) => {
                          const u = p.user || {};
                          const empCode = u.employeeCode || p.employee_code || p.employeeCode || `ST00${p.userId || p.user_id || idx + 1}`;
                          const empName = `${u.firstName || p.first_name || p.firstName || ""} ${u.lastName || p.last_name || p.lastName || ""}`.trim() || "Employee";
                          const empPf = Number(p.employeePf || p.employee_pf || 0);
                          const emprPf = Number(p.employerPf || p.employer_pf || 0);
                          const empEsi = Number(p.employeeEsi || p.employee_esi || 0);
                          const pTax = Number(p.professionalTax || p.professional_tax || 0);
                          const totTax = empPf + emprPf + empEsi + pTax;
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-xs text-slate-500">{empCode}</TableCell>
                              <TableCell className="font-bold text-slate-800">{empName}</TableCell>
                              <TableCell className="font-mono text-xs">{p.month}/{p.year}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{empPf.toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{emprPf.toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{empEsi.toLocaleString()}</TableCell>
                              <TableCell className="font-mono text-slate-600">₹{pTax.toLocaleString()}</TableCell>
                              <TableCell className="font-mono font-black text-rose-700">₹{totTax.toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                            No tax & statutory deduction records found for current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 10. EMPLOYEE SUMMARY & INACTIVE EMPLOYEES */}
                {(activeView === "employee-summary" || activeView === "inactive-employees") && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Employment Type</TableHead>
                        <TableHead>Joining Date</TableHead>
                        <TableHead>Status</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user: any) => {
                          const st = (user.status || "ACTIVE").toUpperCase();
                          return (
                            <TableRow key={user.userId}>
                              <TableCell className="font-mono text-xs text-slate-500">{user.employeeCode || `ST00${user.userId}`}</TableCell>
                              <TableCell className="font-bold text-slate-800">{user.firstName} {user.lastName || ""}</TableCell>
                              <TableCell className="font-mono text-xs text-slate-500">{user.officialEmail || "--"}</TableCell>
                              <TableCell className="text-slate-600">{user.department?.departmentName || user.department_name || "General"}</TableCell>
                              <TableCell className="text-slate-600">{user.designation?.designationName || "Employee"}</TableCell>
                              <TableCell className="text-slate-600 font-semibold">{user.personalInformation?.gender || user.gender || "N/A"}</TableCell>
                              <TableCell className="text-slate-600">{user.employmentType || "PERMANENT"}</TableCell>
                              <TableCell className="font-mono text-xs">{user.joiningDate ? user.joiningDate.split("T")[0] : "--"}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  st === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : st === "RESIGNED"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}>
                                  {st}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-slate-400 font-medium">
                            No employees found matching the criteria in database.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* 11. YEARLY REPORT */}
                {activeView === "yearly-report" && (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Employee Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Annual Worked Hours</TableHead>
                        <TableHead>Approved Leaves Taken</TableHead>
                        <TableHead>Annual Gross Paid</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((emp: any) => {
                          const userAtts = (rawAttendanceData || []).filter((a: any) => Number(a.userId || a.user_id) === Number(emp.userId));
                          const totMins = userAtts.reduce((acc: number, curr: any) => acc + (curr.workingMinutes || curr.working_minutes || 0), 0);
                          const hrs = Math.floor(totMins / 60);

                          const userLeaves = (rawLeaveData || []).filter((l: any) => Number(l.userId || l.user_id) === Number(emp.userId) && l.status?.toUpperCase() === "APPROVED");
                          const totLeaves = userLeaves.reduce((acc: number, curr: any) => acc + (curr.numberOfDays || 1), 0);

                          const userPays = (rawPayslips || []).filter((p: any) => Number(p.userId || p.user_id) === Number(emp.userId));
                          const totPay = userPays.reduce((acc: number, curr: any) => acc + Number(curr.grossEarned || curr.gross_earned || curr.grossEarnings || 0), 0);

                          return (
                            <TableRow key={emp.userId}>
                              <TableCell className="font-mono text-xs text-slate-500">{emp.employeeCode || `ST00${emp.userId}`}</TableCell>
                              <TableCell className="font-bold text-slate-800">{emp.firstName} {emp.lastName || ""}</TableCell>
                              <TableCell className="text-slate-600">{emp.department?.departmentName || "General"}</TableCell>
                              <TableCell className="font-mono font-bold text-slate-700">{selectedYear}</TableCell>
                              <TableCell className="font-mono font-bold text-brand-primary">{hrs} hours</TableCell>
                              <TableCell className="font-mono font-bold text-amber-700">{totLeaves} days</TableCell>
                              <TableCell className="font-mono font-black text-emerald-700">₹{totPay.toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                            No database records available for year {selectedYear}.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
