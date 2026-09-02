"use client";

import React, { useState, useEffect } from "react";
import { UserRole } from "@/types/dashboard";
import { getCompanySuperAdmin, getUserById, getSuperAdminDetails } from "@/features/employees/api/employees.api";
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
import { ReportsView } from "./ReportsView";
import { UsersManagementView } from "@/features/users/components/UsersManagementView";
import { RefreshCw, HelpCircle, ArrowLeft } from "lucide-react";

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

  const [resolvedCompanyName, setResolvedCompanyName] = useState<string>(
    companyName || ""
  );
  const [resolvedCompanyLogo, setResolvedCompanyLogo] = useState<
    string | undefined
  >(undefined);
  const [resolvedUserName, setResolvedUserName] = useState<string>(
    userName || ""
  );

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    if (storedUserName) {
      setResolvedUserName(storedUserName);
    }
  }, [userName]);

  useEffect(() => {
    const storedCompanyName = localStorage.getItem("company_name");
    if (storedCompanyName) {
      setResolvedCompanyName(storedCompanyName);
    }
  }, [companyName]);

  useEffect(() => {
    const storedCompanyLogo = localStorage.getItem("company_logo");
    if (storedCompanyLogo) {
      setResolvedCompanyLogo(storedCompanyLogo);
    }
  }, []);

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

  // Listen for live company updates (e.g. logo upload from settings)
  useEffect(() => {
    const handleCompanyUpdate = (e: any) => {
      if (e.detail?.companyLogo) {
        setResolvedCompanyLogo(e.detail.companyLogo);
        if (typeof window !== "undefined") {
          localStorage.setItem("company_logo", e.detail.companyLogo);
        }
      }
      if (e.detail?.companyName) {
        setResolvedCompanyName(e.detail.companyName);
        if (typeof window !== "undefined") {
          localStorage.setItem("company_name", e.detail.companyName);
        }
      }
    };
    window.addEventListener("company_metadata_updated", handleCompanyUpdate);
    return () => window.removeEventListener("company_metadata_updated", handleCompanyUpdate);
  }, []);

  useEffect(() => {
    const loadCompanyMetadata = async () => {
      try {
        // Fetch company details (contains companyName, companyLogo & superAdmin full details)
        const res = await getCompanySuperAdmin();
        if (res.success && res.data) {
          const comp = res.data;
          if (comp.companyName) {
            setResolvedCompanyName(comp.companyName);
            if (typeof window !== "undefined") {
              localStorage.setItem("company_name", comp.companyName);
            }
          }
          if (comp.companyLogo) {
            setResolvedCompanyLogo(comp.companyLogo);
            if (typeof window !== "undefined") {
              localStorage.setItem("company_logo", comp.companyLogo);
            }
          } else {
            setResolvedCompanyLogo(undefined);
            if (typeof window !== "undefined") {
              localStorage.removeItem("company_logo");
            }
          }

          if (role === "superadmin") {
            const superAdminRes = await getSuperAdminDetails();
            if (superAdminRes.success && superAdminRes.data) {
              const sa = superAdminRes.data;
              const fullName = `${sa.firstName || ""} ${sa.lastName || ""}`.trim();
              if (fullName) {
                setResolvedUserName(fullName);
                if (typeof window !== "undefined") {
                  localStorage.setItem("user_name", fullName);
                }
              }
            } else if (comp.superAdmin) {
              const sa = comp.superAdmin;
              const fullName = `${sa.firstName || ""} ${sa.lastName || ""}`.trim();
              if (fullName) {
                setResolvedUserName(fullName);
                if (typeof window !== "undefined") {
                  localStorage.setItem("user_name", fullName);
                }
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
          if (role === "superadmin") {
            const superAdminRes = await getSuperAdminDetails();
            if (superAdminRes.success && superAdminRes.data) {
              const sa = superAdminRes.data;
              const fullName = `${sa.firstName || ""} ${sa.lastName || ""}`.trim();
              if (fullName) {
                setResolvedUserName(fullName);
                if (typeof window !== "undefined") {
                  localStorage.setItem("user_name", fullName);
                }
              }
            }
          } else {
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
        return <ExpensesView currentRole={role} currentUserName={resolvedUserName} />;
      case "holidays-leaves":
        return <LeavesView />;
      case "assets":
        return <AssetsView currentRole={role} />;
      case "reports":
        return <ReportsView />;
      case "users":
        return <UsersManagementView />;
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
            {/* Executive Hero Greeting Banner */}
            {/* Compact Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Welcome Back, {resolvedUserName || "Admin"} 👋
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Here is what is happening across {resolvedCompanyName ? resolvedCompanyName : "your organization"} today.
                </p>
              </div>

              {/* Right side live clock & refresh button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-right shadow-2xs">
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-1">Today's Date</p>
                  <p className="text-xs font-black text-slate-700">
                    {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-brand-btn-text font-extrabold text-xs rounded-2xl shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* ADMIN / SUPERADMIN DASHBOARD WIDGETS */}
            <div className="space-y-5">
              {/* Row 1: Full-width stats cards */}
              <EmployeeStatsWidget />

              {/* Row 2: 3-column widget grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <HolidaysWidget />
                <CheersToPeersWidget />
                {(role === "superadmin" || role === "admin") && (
                  <PayrollCostWidget />
                )}
              </div>

              {/* Row 3: Quick Actions */}
              <div className="grid grid-cols-1 gap-5">
                <QuickLinksWidget onTabChange={setActiveTab} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#e6eef5] flex flex-col font-sans animate-fade-in">
      {/* Top Navbar */}
      <Navbar
        currentRole={role}
        activeTab={activeTab}
        onRoleChange={setRole}
        userName={resolvedUserName}
        companyName={resolvedCompanyName}
        companyLogo={resolvedCompanyLogo}
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
