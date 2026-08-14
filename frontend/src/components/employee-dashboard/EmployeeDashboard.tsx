"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarDays, 
  Loader2, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { 
  getUserById, 
  getDesignations 
} from "@/features/employees/api/employees.api";
import { 
  getExpenses, 
  getCurrentUserId 
} from "@/features/expenses/api/expenses.api";
import { 
  getHolidays 
} from "@/features/organization/api/calendar.api";
import { Expense } from "@/features/expenses/types/expenses.types";

// Import modular widgets
import { EmployeeProfileCard } from "./EmployeeProfileCard";
import { AttendanceCard } from "./AttendanceCard";
import { LeaveSummary } from "./LeaveSummary";
import { ExpenseSummary } from "./ExpenseSummary";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";

interface EmployeeDashboardProps {
  userName: string;
  companyName: string;
  onTabChange: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  userName: propUserName,
  companyName,
  onTabChange,
}) => {
  const router = useRouter();

  // Authentication and Metadata States
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [designations, setDesignations] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Live Expenses State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [hasExpenseError, setHasExpenseError] = useState(false);

  // Holidays State
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);

  // Attendance Widget State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Greeting Message
  const [greeting, setGreeting] = useState("Hello");

  // Load user token and fetch info on mount
  useEffect(() => {
    // 1. Resolve greeting based on time of day
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("Good morning");
    else if (hrs < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // 2. Resolve user ID from JWT token
    const currentId = getCurrentUserId();
    setUserId(currentId);
  }, []);

  // Fetch API Data
  useEffect(() => {
    if (!userId) return;

    const loadDashboardData = async () => {
      setIsLoadingProfile(true);
      setIsLoadingExpenses(true);
      setIsLoadingHolidays(true);
      setHasExpenseError(false);

      try {
        // Fetch designation master list and employee user profile
        const [desData, userRes, holidaysRes] = await Promise.all([
          getDesignations(),
          getUserById(userId),
          getHolidays().catch((err) => {
            console.error("Error loading holidays:", err);
            return { success: false, data: [] };
          })
        ]);

        // Mapped designations
        setDesignations(desData || []);

        // Mapped profile
        if (userRes.success && userRes.data) {
          setUserProfile(userRes.data);
        }

        // Mapped holidays
        if (holidaysRes.success && Array.isArray(holidaysRes.data)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcoming = holidaysRes.data
            .filter((h: any) => new Date(h.startDate).setHours(0, 0, 0, 0) >= today.getTime())
            .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 2) // only display top 2
            .map((h: any) => {
              const d = new Date(h.startDate);
              return {
                id: h.holidayId,
                date: d.getDate(),
                month: d.toLocaleString("en-US", { month: "short" }),
                day: d.toLocaleString("en-US", { weekday: "long" }),
                title: h.holidayName,
              };
            });
          setHolidays(upcoming);
        }
        setIsLoadingHolidays(false);

        // Fetch expenses separately to handle permission block (403 Forbidden) gracefully
        try {
          const allExpensesRes = await getExpenses();
          if (Array.isArray(allExpensesRes)) {
            const filtered = allExpensesRes.filter((e) => e.userId === userId);
            setExpenses(filtered);
          } else if (allExpensesRes && (allExpensesRes as any).success && Array.isArray((allExpensesRes as any).data)) {
            const list = (allExpensesRes as any).data;
            const filtered = list.filter((e: any) => e.userId === userId);
            setExpenses(filtered);
          }
          setHasExpenseError(false);
        } catch (err: any) {
          // Check if it's a permission restriction error
          const isForbidden = err.message?.includes("Forbidden") || err.message?.includes("permission");
          if (isForbidden) {
            setHasExpenseError(true);
            // Log it once as a soft warning instead of throwing or logging an full error trace
            console.warn("Expenses module restricted for current user role (VIEW_REIMBURSEMENT permission required).");
          } else {
            console.error("Non-permission error loading expenses:", err);
            toast.error("Failed to load reimbursement details.");
          }
        } finally {
          setIsLoadingExpenses(false);
        }

      } catch (err) {
        console.error("Error fetching employee dashboard data:", err);
        toast.error("Some dashboard information failed to load.");
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingHolidays(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  // Clock Attendance Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min((seconds / (8 * 3600)) * 100, 100);

  // Compute Expense Statistics from filtered live expenses
  const expensesStats = React.useMemo(() => {
    let submittedSum = 0;
    let pendingSum = 0;
    let approvedSum = 0;
    let rejectedSum = 0;

    expenses.forEach((e) => {
      submittedSum += e.amount;
      if (e.status === "Pending") pendingSum += e.amount;
      else if (e.status === "Approved") approvedSum += e.amount;
      else if (e.status === "Rejected") rejectedSum += e.amount;
    });

    return {
      submitted: submittedSum,
      pending: pendingSum,
      approved: approvedSum,
      rejected: rejectedSum,
    };
  }, [expenses]);

  // Resolve Designation Name
  const roleName = userProfile?.userRoles?.[0]?.role?.roleName || userProfile?.role?.roleName || "Staff";
  const designationName = designations.find((d) => d.designationId === userProfile?.designationId)?.designationName || roleName;
  const employeeFullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim() : propUserName;

  // Tab switch actions
  const handleViewProfileTab = () => onTabChange("profile");
  const handleApplyLeaveTab = () => onTabChange("holidays-leaves");
  const handleSubmitExpenseTab = () => onTabChange("expenses");
  const handleViewAttendanceTab = () => onTabChange("attendance");

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#013e37]/15 p-5 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#013e37] tracking-tight flex items-center gap-2">
            <span>{greeting}, {employeeFullName}!</span>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Here's what's happening with your work today.
          </p>
        </div>

        <div className="px-4 py-2 bg-[#f4fbf7] border border-[#013e37]/15 rounded-xl text-center shrink-0">
          <p className="text-[10px] text-[#013e37]/75 font-semibold uppercase tracking-wide">Current Date</p>
          <p className="text-xs sm:text-sm font-bold text-[#013e37]">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Profile & Actions) */}
        <div className="space-y-6">
          <EmployeeProfileCard 
            isLoading={isLoadingProfile}
            userProfile={userProfile}
            employeeFullName={employeeFullName}
            designationName={designationName}
            onViewProfile={handleViewProfileTab}
          />

          <QuickActions 
            onViewProfile={handleViewProfileTab}
            onApplyLeave={handleApplyLeaveTab}
            onSubmitExpense={handleSubmitExpenseTab}
            onViewAttendance={handleViewAttendanceTab}
          />
        </div>

        {/* Right Section (Double Column Span) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Row: Attendance Clock + Leave Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AttendanceCard 
              isCheckedIn={isCheckedIn}
              seconds={seconds}
              progressPercent={progressPercent}
              formatTime={formatTime}
              onToggleCheckIn={() => {
                setIsCheckedIn(!isCheckedIn);
                toast.success(isCheckedIn ? "Checked Out successfully!" : "Checked In successfully!");
              }}
            />

            <LeaveSummary 
              onApplyLeave={handleApplyLeaveTab}
            />
          </div>

          {/* Live Expenses Section */}
          {!hasExpenseError && (
            <ExpenseSummary 
              isLoading={isLoadingExpenses}
              hasError={hasExpenseError}
              expensesStats={expensesStats}
              expenses={expenses}
              onViewExpenses={handleSubmitExpenseTab}
              onSubmitExpense={handleSubmitExpenseTab}
            />
          )}

          {/* Bottom Grid: Holidays and Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upcoming Holidays */}
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#013e37]/10 flex items-center justify-center">
                    <CalendarDays className="w-3.5 h-3.5 text-[#013e37]" />
                  </div>
                  <h3 className="font-bold text-[#013e37] text-xs sm:text-sm">Upcoming Holidays</h3>
                </div>

                {isLoadingHolidays ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-5 h-5 text-[#013e37] animate-spin" />
                    <span className="text-[10px] text-slate-400 font-semibold">Loading...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {holidays.map((h, idx) => (
                      <div 
                        key={`${h.id}-${idx}`}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="bg-[#013e37] text-[#ffefb3] rounded-lg px-2 py-1 flex flex-col items-center justify-center min-w-[38px] text-[9px] font-extrabold">
                          <span className="text-sm font-extrabold leading-none">{h.date}</span>
                          <span className="text-[7px] font-bold uppercase mt-0.5 opacity-90">{h.month}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight truncate">{h.title}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">{h.day}</p>
                        </div>
                      </div>
                    ))}

                    {holidays.length === 0 && (
                      <p className="text-center py-4 text-xs font-semibold text-slate-400">
                        No upcoming holidays.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={handleApplyLeaveTab}
                className="w-full mt-3 py-2 border border-[#013e37]/15 hover:bg-[#013e37]/5 text-[10px] font-bold text-[#013e37] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recent Activity */}
            <RecentActivity 
              isCheckedIn={isCheckedIn}
              expenses={expenses}
            />

          </div>

        </div>
        
      </div>
    </div>
  );
};
