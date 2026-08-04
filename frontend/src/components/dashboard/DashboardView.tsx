"use client";

import React, { useState } from "react";
import { UserRole } from "@/types/dashboard";
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
import { RefreshCw, HelpCircle } from "lucide-react";

interface DashboardViewProps {
  initialRole?: UserRole;
  userName?: string;
  companyName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialRole = "admin",
  userName = "Varsha",
  companyName = "Saanvi Technologies",
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderTabContent = () => {
    switch (activeTab) {
      case "employees":
        return <EmployeeListPage currentRole={role} />;
      case "requests":
        return <RequestsView />;
      case "approval":
        return <ApprovalsView />;
      case "attendance":
        return <AttendanceView />;
      case "dashboard":
      default:
        return (
          <>
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-xs text-gray-500 capitalize">
                  Role View: <span className="font-semibold text-blue-600">{role}</span>
                </p>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-400 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* DYNAMIC ROLE-BASED WIDGET GRID */}
            {role === "employee" ? (
              /* EMPLOYEE ROLE DASHBOARD */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Primary Interactive Widget: Attendance Check In/Out */}
                <AttendanceCheckInWidget />

                {/* Holidays Widget */}
                <HolidaysWidget />

                {/* Cheers to Peers (Peer Birthday Wishes) */}
                <CheersToPeersWidget />

                {/* Quick Links */}
                <QuickLinksWidget />

                {/* HR Policies */}
                <HRPoliciesWidget />
              </div>
            ) : (
              /* ADMIN / SUPERADMIN DASHBOARD */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Row 1 Widgets */}
                <EmployeeStatsWidget />
                <HolidaysWidget />
                <QuickLinksWidget />
                {role === "superadmin" || role === "admin" ? (
                  <PayrollCostWidget />
                ) : null}

                {/* Row 2 Widgets */}
                <HRPoliciesWidget />
                <EmployeeProbationsWidget />
                <CheersToPeersWidget />
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={role}
        onRoleChange={setRole}
        userName={userName}
        companyName={companyName}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Area: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {renderTabContent()}
        </main>
      </div>

      {/* Floating Help Button (Bottom Right) */}
      <button className="fixed bottom-5 right-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 z-40">
        <HelpCircle className="w-4 h-4" />
        <span>Help ?</span>
      </button>
    </div>
  );
};
