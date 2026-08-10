"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/dashboard";
import { Menu, Bell, Headset, ChevronDown, User as UserIcon, LogOut, Lock, CircleUser, Activity } from "lucide-react";

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  userName: string;
  companyName: string;
  onToggleSidebar?: () => void;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  userName,
  companyName,
  onToggleSidebar,
  onTabChange,
}) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = React.useState(false);

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0;";
    document.cookie = "user_role=; path=/; max-age=0;";
    document.cookie = "company_id=; path=/; max-age=0;";
    window.location.href = "/";
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    // Set cookie for Next.js middleware checking
    document.cookie = `user_role=${newRole}; path=/; max-age=86400;`;
    
    // Navigate to role route
    router.push(`/${newRole}/dashboard`);
  };

  return (
    <header className="h-14 bg-[#013e37] border-b border-[#013e37]/40 flex items-center justify-between px-4 sticky top-0 z-40 shadow-md text-[#ffefb3]">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#ffefb3] focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#ffefb3] text-[#013e37] flex items-center justify-center text-xs font-extrabold shadow-md shadow-black/20">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <span className="font-extrabold text-[#ffefb3] text-sm sm:text-base tracking-tight">
            {companyName}
          </span>
        </div>
      </div>

      {/* Right section: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-3.5 text-xs sm:text-sm">
        {/* Notifications Icon */}
        <button className="p-2 text-[#ffefb3]/85 hover:text-[#ffefb3] rounded-full hover:bg-white/10 transition-colors cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#ffefb3] absolute top-1.5 right-1.5 ring-2 ring-[#013e37]" />
        </button>

        {/* Support Icon */}
        <button className="p-2 text-[#ffefb3]/85 hover:text-[#ffefb3] rounded-full hover:bg-white/10 transition-colors cursor-pointer hidden sm:flex">
          <Headset className="w-4 h-4" />
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ffefb3]/30 rounded-xl text-[#ffefb3] bg-[#013e37] hover:bg-white/10 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Quick Actions</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#ffefb3]/70 transition-transform ${isQuickActionsOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isQuickActionsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsQuickActionsOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-[#013e37] rounded-xl shadow-xl border border-[#ffefb3]/20 overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    onTabChange?.("attendance");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 text-xs font-semibold text-[#ffefb3] transition-colors cursor-pointer"
                >
                  Attendance
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("holidays-leaves");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 text-xs font-semibold text-[#ffefb3] transition-colors cursor-pointer"
                >
                  Leaves
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("attendance");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 text-xs font-semibold text-[#ffefb3] transition-colors cursor-pointer"
                >
                  Over Time
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("expenses");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 text-xs font-semibold text-[#ffefb3] transition-colors cursor-pointer"
                >
                  Reimbursements
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("requests");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 text-xs font-semibold text-[#ffefb3] transition-colors cursor-pointer"
                >
                  Requests
                </button>
              </div>
            </>
          )}
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative">
          <select
            value={currentRole}
            onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
            className="appearance-none px-3 py-1.5 pr-7 border border-[#ffefb3]/30 rounded-xl text-[#ffefb3] bg-[#013e37] hover:bg-white/10 font-bold text-xs focus:ring-2 focus:ring-[#ffefb3]/30 focus:outline-none cursor-pointer capitalize shadow-xs"
          >
            <option value="superadmin" className="bg-[#013e37] text-[#ffefb3]">Superadmin</option>
            <option value="admin" className="bg-[#013e37] text-[#ffefb3]">Admin</option>
            <option value="employee" className="bg-[#013e37] text-[#ffefb3]">Employee</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#ffefb3]/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* User Profile Pill */}
        <div className="relative pl-3 border-l border-[#ffefb3]/25">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-[#ffefb3]/20 transition-colors cursor-pointer"
          >
            <div className="w-7.5 h-7.5 rounded-full bg-[#ffefb3] text-[#013e37] flex items-center justify-center font-bold shadow-xs shrink-0">
              <UserIcon className="w-4 h-4 text-[#013e37]" />
            </div>
            <span className="font-bold text-[#ffefb3] text-xs hidden sm:inline">
              {userName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#ffefb3]/70 hidden sm:inline transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-[#013e37] rounded-xl shadow-xl border border-[#ffefb3]/20 overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-[#ffefb3] text-sm transition-colors text-left font-medium">
                  <CircleUser className="w-4 h-4 shrink-0 text-[#ffefb3]/70" />
                  <span>View My Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-[#ffefb3] text-sm transition-colors text-left font-medium">
                  <Activity className="w-4 h-4 shrink-0 text-[#ffefb3]/70" />
                  <span>Set Status</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-[#ffefb3] text-sm transition-colors text-left font-medium">
                  <Lock className="w-4 h-4 shrink-0 text-[#ffefb3]/70" />
                  <span>Change Password</span>
                </button>
                <div className="h-px bg-[#ffefb3]/15 my-1.5" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-500/20 text-[#ffefb3] hover:text-rose-300 text-sm transition-colors text-left font-bold"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-rose-300" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
