"use client";

import React from "react";
import { UserRole } from "@/types/dashboard";
import {
  LayoutGrid,
  Users,
  CalendarCheck,
  FileCheck,
  Clock,
  Umbrella,
  Banknote,
  Receipt,
  TrendingUp,
  ShieldAlert,
  Settings,
} from "lucide-react";

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSidebarOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  isSidebarOpen = true,
}) => {
  // Navigation items filtered by role
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid, roles: ["superadmin", "admin", "employee"] },
    { id: "employees", label: "Employees", icon: Users, roles: ["superadmin", "admin"] },
    { id: "requests", label: "Requests", icon: CalendarCheck, roles: ["superadmin", "admin", "employee"] },
    { id: "approval", label: "Approval", icon: FileCheck, roles: ["superadmin", "admin", "employee"] },
    { id: "attendance", label: "Attendance", icon: Clock, roles: ["superadmin", "admin", "employee"] },
    { id: "holidays-leaves", label: "Leaves", icon: Umbrella, roles: ["superadmin", "admin", "employee"] },
    { id: "payroll", label: "Payroll", icon: Banknote, roles: ["superadmin", "admin", "employee"] },
    { id: "expenses", label: "Expenses", icon: Receipt, roles: ["superadmin", "admin", "employee"] },
    { id: "analytics", label: "Analytics", icon: TrendingUp, roles: ["superadmin", "admin"] },
    { id: "tenant-settings", label: "Superadmin Control", icon: ShieldAlert, roles: ["superadmin"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["superadmin", "admin", "employee"] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col py-4 gap-1.5 h-[calc(100vh-3.5rem)] sticky top-14 shadow-lg z-30 transition-all duration-300 select-none ${
        isSidebarOpen ? "w-60 px-3" : "w-14 sm:w-16 items-center px-1"
      }`}
    >
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            title={isSidebarOpen ? undefined : item.label}
            className={`rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer ${
              isSidebarOpen
                ? `w-full px-4 py-3 gap-3.5 ${
                    isActive
                      ? "text-white bg-indigo-600 shadow-md shadow-indigo-500/30 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium"
                  }`
                : `p-2.5 justify-center ${
                    isActive
                      ? "text-white bg-indigo-600 shadow-md shadow-indigo-500/30 scale-105"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80 hover:scale-105"
                  }`
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            
            {/* Expanded sidebar labels */}
            {isSidebarOpen && (
              <span className="text-xs tracking-wide animate-fade-in truncate">
                {item.label}
              </span>
            )}

            {/* Collapsed sidebar Tooltips */}
            {!isSidebarOpen && (
              <span className="absolute left-16 bg-slate-950 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
};
