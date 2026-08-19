"use client";

import React, { useState, useEffect } from "react";
import { UserRole } from "@/types/dashboard";
import { getCompanySuperAdmin, getUserById } from "@/features/employees/api/employees.api";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";
import { EmployeeDashboard } from "@/components/employee-dashboard/EmployeeDashboard";
import { EmployeeProfile } from "@/features/employees/components/employee-profile";
import { EmployeeEditModal } from "@/features/employees/components/employee-edit-modal";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { EmployeeStatsWidget } from "./widgets/EmployeeStatsWidget";
import { HolidaysWidget } from "./widgets/HolidaysWidget";
import { QuickLinksWidget } from "./widgets/QuickLinksWidget";
import { PayrollCostWidget } from "./widgets/PayrollCostWidget";
import { AttendanceCheckInWidget } from "./widgets/AttendanceCheckInWidget";
import { HRPoliciesWidget } from "./widgets/HRPoliciesWidget";
import { EmployeeProbationsWidget } from "./widgets/EmployeeProbationsWidget";
import { CheersToPeersWidget } from "./widgets/CheersToPeersWidget";
import { RequestsView } from "@/features/requests/components/RequestsView";
import { ApprovalsView } from "@/features/approvals/components/ApprovalsView";
import { AttendanceView } from "@/features/attendance/components/AttendanceView";
import { EmployeeListPage } from "@/features/employees";
import { ExpensesView } from "@/features/expenses";
import { LeavesView } from "@/features/leaves";
import { SettingsView } from "@/features/settings";
import { AssetsView } from "@/features/assets";
import { RefreshCw, HelpCircle } from "lucide-react";

interface DashboardViewProps {
  initialRole?: UserRole;
  userName?: string;
  companyName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialRole = "admin",
  userName = "",
  companyName = "",
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  const [resolvedCompanyName, setResolvedCompanyName] = useState(companyName);
  const [resolvedUserName, setResolvedUserName] = useState(userName);

  // Expand sidebar on desktop screens, keep hidden on mobile
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadCompanyMetadata = async () => {
      try {
        // Fetch company details (contains companyName & superAdmin full details)
        const res = await getCompanySuperAdmin();
        if (res.success && res.data) {
          const comp = res.data;
          if (comp.companyName) {
            setResolvedCompanyName(comp.companyName);
          }

          if (role === "superadmin" && comp.superAdmin) {
            const sa = comp.superAdmin;
            const fullName = `${sa.firstName || ""} ${sa.lastName || ""}`.trim();
            if (fullName) {
              setResolvedUserName(fullName);
              if (typeof window !== "undefined") {
                localStorage.setItem("user_name", fullName);
              }
            }
          } else {
            // For regular roles (admin, employee, etc.), resolve from user profile API
            const loggedInUserId = getCurrentUserId();
            if (loggedInUserId) {
              const userRes = await getUserById(loggedInUserId);
              if (userRes.success && userRes.data) {
                const u = userRes.data;
                const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                if (fullName) {
                  setResolvedUserName(fullName);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("user_name", fullName);
                  }
                }
              }
            }
          }
        } else {
          // Fallback if company API is unavailable
          const loggedInUserId = getCurrentUserId();
          if (loggedInUserId) {
            const userRes = await getUserById(loggedInUserId);
            if (userRes.success && userRes.data) {
              const u = userRes.data;
              const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
              if (fullName) {
                setResolvedUserName(fullName);
                if (typeof window !== "undefined") {
                  localStorage.setItem("user_name", fullName);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic dashboard metadata:", err);
      }
    };
    loadCompanyMetadata();
  }, [role]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "employees":
        return <EmployeeListPage currentRole={role} currentUserName={resolvedUserName} currentCompanyName={resolvedCompanyName} />;
      case "requests":
        return <RequestsView />;
      case "approval":
        return <ApprovalsView />;
      case "attendance":
        return <AttendanceView currentRole={role} currentUserName={resolvedUserName} />;
      case "expenses":
        if (role === "employee") {
          return (
            <EmployeeDashboard
              userName={resolvedUserName}
              companyName={resolvedCompanyName}
              onTabChange={setActiveTab}
            />
          );
        }
        return <ExpensesView currentRole={role} currentUserName={resolvedUserName} />;
      case "holidays-leaves":
        return <LeavesView />;
      case "assets":
        return <AssetsView currentRole={role} />;
      case "settings":
        if (role === "employee") {
          return <div className="text-sm font-semibold text-slate-500">Access Denied.</div>;
        }
        return <SettingsView />;
      case "profile":
        const loggedInUserId = getCurrentUserId();
        if (loggedInUserId) {
          return (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <EmployeeProfile
                employeeId={loggedInUserId}
                onEditClick={() => {
                  setProfileEditOpen(true);
                }}
              />
            </div>
          );
        }
        return <div className="text-sm font-semibold text-slate-500">Please log in again.</div>;
      case "dashboard":
      default:
        if (role === "employee") {
          return (
            <EmployeeDashboard
              userName={resolvedUserName}
              companyName={resolvedCompanyName}
              onTabChange={setActiveTab}
            />
          );
        }
        return (
          <>
            {/* Welcome Greeting Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight">
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 bg-white border border-brand-primary/20 rounded-xl shadow-2xs text-center">
                  <p className="text-[10px] text-brand-primary/70 font-semibold uppercase tracking-wide">Today</p>
                  <p className="text-sm font-bold text-brand-primary">
                    {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button className="flex items-center gap-1.5 px-3.5 py-2.5 border border-brand-primary/20 text-brand-primary rounded-xl text-xs font-bold hover:bg-brand-primary hover:text-brand-btn-text transition-colors shadow-2xs bg-white cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* ADMIN / SUPERADMIN DASHBOARD */}
            <div className="space-y-4">
              {/* Row 1: Full-width stats cards */}
              <EmployeeStatsWidget />

              {/* Row 2: 3-column widget grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <HolidaysWidget />
                <QuickLinksWidget />
                {(role === "superadmin" || role === "admin") && (
                  <PayrollCostWidget />
                )}
              </div>

              {/* Row 3: 3-column widget grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <HRPoliciesWidget />
                <EmployeeProbationsWidget />
                <CheersToPeersWidget />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fbf7] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={role}
        onRoleChange={setRole}
        userName={resolvedUserName}
        companyName={resolvedCompanyName}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onTabChange={setActiveTab}
      />

      {/* Main Area: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onCloseMobileSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Content View */}
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderTabContent()}
        </main>
      </div>

      {profileEditOpen && role === "employee" && (
        <EmployeeEditModal
          isOpen={profileEditOpen}
          onClose={() => setProfileEditOpen(false)}
          onSuccess={() => {
            setProfileEditOpen(false);
          }}
          employeeId={getCurrentUserId() || 0}
          employeeName=""
        />
      )}

      {/* Floating Help Button (Bottom Right) */}
      <button className="fixed bottom-5 right-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 z-40">
        <HelpCircle className="w-4 h-4" />
        <span>Help ?</span>
      </button>
    </div>
  );
};
