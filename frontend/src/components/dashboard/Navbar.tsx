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
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-700 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            S
          </div>
          <span className="font-semibold text-gray-800 text-sm sm:text-base">
            {companyName}
          </span>
        </div>
      </div>

      {/* Right section: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        {/* Notifications Icon */}
        <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <Bell className="w-4 h-4" />
        </button>

        {/* Support Icon */}
        <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 hidden sm:flex">
          <Headset className="w-4 h-4" />
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative hidden md:block">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium">
            <span>Quick Actions</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Role Selector Dropdown (Navigates routes & sets cookie) */}
        <div className="relative">
          <select
            value={currentRole}
            onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
            className="appearance-none px-3 py-1.5 pr-7 border border-gray-300 rounded-md text-gray-800 bg-white hover:bg-gray-50 font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer capitalize"
          >
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-800 hidden sm:inline">
            {userName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:inline" />
        </div>
      </div>
    </header>
  );
};
