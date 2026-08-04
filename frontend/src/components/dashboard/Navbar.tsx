"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/dashboard";
import { Menu, Bell, Headset, ChevronDown, User as UserIcon } from "lucide-react";

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  userName: string;
  companyName: string;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  userName,
  companyName,
  onToggleSidebar,
}) => {
  const router = useRouter();

  const handleRoleSwitch = (newRole: UserRole) => {
    // Set cookie for Next.js middleware checking
    document.cookie = `user_role=${newRole}; path=/; max-age=86400;`;
    
    // Navigate to role route
    router.push(`/${newRole}/dashboard`);
  };

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sticky top-0 z-40 shadow-2xs">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
            S
          </div>
          <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
            {companyName}
          </span>
        </div>
      </div>

      {/* Right section: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-3.5 text-xs sm:text-sm">
        {/* Notifications Icon */}
        <button className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* Support Icon */}
        <button className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:flex">
          <Headset className="w-4 h-4" />
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative hidden md:block">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer">
            <span>Quick Actions</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative">
          <select
            value={currentRole}
            onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
            className="appearance-none px-3 py-1.5 pr-7 border border-slate-300 rounded-xl text-slate-800 bg-white hover:bg-slate-50 font-bold text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none cursor-pointer capitalize shadow-2xs"
          >
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shadow-2xs">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 text-xs hidden sm:inline">
            {userName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        </div>
      </div>
    </header>
  );
};
