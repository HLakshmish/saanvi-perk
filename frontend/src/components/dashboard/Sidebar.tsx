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
  Laptop,
  TrendingUp,
  UserCheck,
  ShieldAlert,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  isSidebarOpen = true,
  onCloseMobileSidebar,
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
    { id: "expenses", label: "Expenses", icon: Receipt, roles: ["superadmin", "admin"] },
    { id: "assets", label: "Assets", icon: Laptop, roles: ["superadmin", "admin", "employee"] },
    { id: "reports", label: "Reports", icon: TrendingUp, roles: ["superadmin", "admin"] },
    { id: "users", label: "Users", icon: UserCheck, roles: ["superadmin", "admin"] },
    { id: "tenant-settings", label: "Superadmin Control", icon: ShieldAlert, roles: ["superadmin"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["superadmin", "admin"] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(currentRole));

  const handleItemClick = (id: string) => {
    onTabChange(id);
    if (typeof window !== "undefined" && window.innerWidth < 768 && onCloseMobileSidebar) {
      onCloseMobileSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (SSR Safe with CSS transitions) */}
      <div
        onClick={onCloseMobileSidebar}
        className={`fixed inset-0 top-14 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-all duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Main Sidebar (Drawer on mobile, Sticky rail on desktop) */}
      <aside
        className={`bg-sidebar-bg border-r border-sidebar-border flex flex-col h-[calc(100vh-3.5rem)] fixed md:sticky top-14 z-50 md:z-30 transition-all duration-300 select-none overflow-x-hidden ${isSidebarOpen
          ? "w-64 md:w-60 translate-x-0 shadow-2xl md:shadow-lg"
          : "-translate-x-full md:translate-x-0 md:w-14 lg:md:w-16 items-center"
          }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-sidebar-border text-sidebar-active-text">
          <span className="text-xs font-extrabold uppercase tracking-wider">Navigation Menu</span>
          <button
            onClick={onCloseMobileSidebar}
            className="p-1 rounded-lg hover:bg-white/10 text-sidebar-text hover:text-sidebar-text-hover cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Nav Container with hidden scrollbars */}
        <nav
          className={`flex-1 flex flex-col gap-1 py-3 overflow-y-auto overflow-x-hidden sidebar-scroll ${isSidebarOpen ? "px-3" : "px-1"
            }`}
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={isSidebarOpen ? undefined : item.label}
                className={`rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer shrink-0 ${isSidebarOpen
                  ? `w-full px-4 py-3 gap-3.5 ${isActive
                    ? "text-sidebar-active-text bg-sidebar-active-bg shadow-md shadow-black/20 font-extrabold"
                    : "text-sidebar-text hover:text-sidebar-text-hover hover:bg-white/10 font-semibold"
                  }`
                  : `p-2.5 justify-center ${isActive
                    ? "text-sidebar-active-text bg-sidebar-active-bg shadow-md shadow-black/20 scale-105"
                    : "text-sidebar-text hover:text-sidebar-text-hover hover:bg-white/10 hover:scale-105"
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
                  <span className="absolute left-16 bg-[#012d28] text-sidebar-active-text text-[11px] font-bold px-2.5 py-1.5 rounded-md shadow-xl border border-sidebar-border opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Hidden scrollbar styles */}
        <style jsx>{`
          .sidebar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .sidebar-scroll::-webkit-scrollbar {
            display: none;
            width: 0px;
            height: 0px;
          }
        `}</style>
      </aside>
    </>
  );
};
