"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserRole } from "@/types/dashboard";
import { EmployeeListPage } from "@/features/employees";
import {
  LayoutGrid,
  Users,
  CalendarCheck,
  FileCheck,
  Clock,
  Umbrella,
  Receipt,
  Banknote,
  TrendingUp,
  Settings,
  ShieldAlert,
} from "lucide-react";

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
}) => {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Find the main layout container after client mount
    const el = document.querySelector("main");
    setMainEl(el);
  }, []);

  useEffect(() => {
    if (activeTab === "employees") {
      // Create a style element to hide the default dashboard widgets and title
      const style = document.createElement("style");
      style.id = "hide-dashboard-elements";
      style.innerHTML = `
        main > div:nth-child(1),
        main > div:nth-child(2) {
          display: none !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const el = document.getElementById("hide-dashboard-elements");
        if (el) el.remove();
      };
    }
  }, [activeTab]);

  // Navigation items filtered by role
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid, roles: ["superadmin", "admin", "employee"] },
    { id: "employees", label: "Employees", icon: Users, roles: ["superadmin", "admin"] },
    { id: "requests", label: "Requests", icon: CalendarCheck, roles: ["superadmin", "admin", "employee"] },
    { id: "approval", label: "Approval", icon: FileCheck, roles: ["superadmin", "admin", "employee"] },
    { id: "attendance", label: "Attendance", icon: Clock, roles: ["superadmin", "admin", "employee"] },
    { id: "holidays-leaves", label: "Leaves & Holidays", icon: Umbrella, roles: ["superadmin", "admin", "employee"] },
    { id: "payroll", label: "Payroll", icon: Banknote, roles: ["superadmin", "admin", "employee"] },
    { id: "expenses", label: "Expenses", icon: Receipt, roles: ["superadmin", "admin", "employee"] },
    { id: "analytics", label: "Analytics", icon: TrendingUp, roles: ["superadmin", "admin"] },
    { id: "tenant-settings", label: "Superadmin Control", icon: ShieldAlert, roles: ["superadmin"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["superadmin", "admin", "employee"] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <>
      <aside className="w-14 sm:w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 h-[calc(100vh-3.5rem)] sticky top-14">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`p-2.5 rounded-lg transition-colors group relative flex items-center justify-center cursor-pointer ${
                isActive
                  ? "text-blue-600 bg-blue-50 border border-blue-200"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Render the Employee List view when tab is active and main container is loaded */}
      {activeTab === "employees" &&
        mainEl &&
        createPortal(<EmployeeListPage currentRole={currentRole} />, mainEl)}
    </>
  );
};

