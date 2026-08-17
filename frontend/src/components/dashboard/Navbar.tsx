"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/dashboard";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";
import { getUserById } from "@/features/employees/api/employees.api";
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
  const [assignedRoles, setAssignedRoles] = React.useState<UserRole[]>([currentRole]);
  const [hasFetchedRoles, setHasFetchedRoles] = React.useState(false);

  React.useEffect(() => {
    if (hasFetchedRoles) return;

    const fetchUserRoles = async () => {
      try {
        const userId = getCurrentUserId();
        if (userId) {
          const res = await getUserById(userId);
          if (res.success && res.data && Array.isArray(res.data.userRoles) && res.data.userRoles.length > 0) {
            const roles: UserRole[] = res.data.userRoles
              .map((ur: any) => {
                const code = (ur.role?.roleCode || ur.role?.roleName || "").toUpperCase();
                if (code === "SUPERADMIN") return "superadmin";
                if (code === "ADMIN") return "admin";
                if (code === "EMPLOYEE") return "employee";
                return null;
              })
              .filter((r: UserRole | null): r is UserRole => r !== null);

            if (roles.length > 0) {
              if (!roles.includes(currentRole)) {
                roles.push(currentRole);
              }
              setAssignedRoles(roles);
              setHasFetchedRoles(true);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch assigned roles for header dropdown:", err);
      }
    };
    fetchUserRoles();
  }, [currentRole, hasFetchedRoles]);

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0;";
    document.cookie = "user_role=; path=/; max-age=0;";
    document.cookie = "company_id=; path=/; max-age=0;";
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_name");
      localStorage.removeItem("company_id");
    }
    window.location.href = "/";
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    // Set cookie for Next.js middleware checking
    document.cookie = `user_role=${newRole}; path=/; max-age=86400;`;
    
    // Navigate to role route
    router.push(`/${newRole}/dashboard`);
  };

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sticky top-0 z-40 shadow-2xs text-slate-800">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#013e37] text-[#ffefb3] flex items-center justify-center text-xs font-extrabold shadow-2xs">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <span className="font-extrabold text-[#013e37] text-sm sm:text-base tracking-tight">
            {companyName}
          </span>
        </div>
      </div>

      {/* Right section: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-3.5 text-xs sm:text-sm">
        {/* Notifications Icon */}
        <button className="p-2 text-slate-600 hover:text-[#013e37] rounded-full hover:bg-slate-100 transition-colors cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* Support Icon */}
        <button className="p-2 text-slate-600 hover:text-[#013e37] rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:flex">
          <Headset className="w-4 h-4" />
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200/90 rounded-xl text-[#013e37] bg-slate-50 hover:bg-slate-100 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <span>Quick Actions</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isQuickActionsOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isQuickActionsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsQuickActionsOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    onTabChange?.("attendance");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#013e37] transition-colors cursor-pointer"
                >
                  Attendance
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("holidays-leaves");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#013e37] transition-colors cursor-pointer"
                >
                  Leaves
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("attendance");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#013e37] transition-colors cursor-pointer"
                >
                  Over Time
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("expenses");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#013e37] transition-colors cursor-pointer"
                >
                  Reimbursements
                </button>
                <button
                  onClick={() => {
                    onTabChange?.("requests");
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#013e37] transition-colors cursor-pointer"
                >
                  Requests
                </button>
              </div>
            </>
          )}
        </div>

        {/* Role Selector Dropdown (Hidden for employees) */}
        {currentRole !== "employee" && (
          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
              className="appearance-none px-3 py-1.5 pr-7 border border-slate-200/90 rounded-xl text-[#013e37] bg-slate-50 hover:bg-slate-100 font-bold text-xs focus:ring-2 focus:ring-[#013e37]/20 focus:outline-none cursor-pointer capitalize shadow-2xs"
            >
              {(currentRole === "superadmin"
                ? (["superadmin", "admin", "employee"] as UserRole[])
                : assignedRoles
              ).map((r) => (
                <option key={r} value={r} className="bg-white text-slate-800 capitalize">
                  {r === "superadmin" ? "Superadmin" : r === "admin" ? "Admin" : "Employee"}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* User Profile Pill */}
        <div className="relative pl-3 border-l border-slate-200">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent transition-colors cursor-pointer"
          >
            <div className="w-7.5 h-7.5 rounded-full bg-[#013e37] text-[#ffefb3] flex items-center justify-center font-bold shadow-2xs shrink-0">
              <UserIcon className="w-4 h-4 text-[#ffefb3]" />
            </div>
            <span className="font-bold text-slate-800 text-xs hidden sm:inline">
              {userName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 hidden sm:inline transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => {
                    if (currentRole === "employee") {
                      onTabChange?.("profile");
                    } else {
                      const userId = getCurrentUserId();
                      if (userId) {
                        router.push(`/employee/${userId}`);
                      }
                    }
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-[#013e37] text-sm transition-colors text-left font-medium cursor-pointer"
                >
                  <CircleUser className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>View My Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-[#013e37] text-sm transition-colors text-left font-medium cursor-pointer">
                  <Activity className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Set Status</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-[#013e37] text-sm transition-colors text-left font-medium cursor-pointer">
                  <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Change Password</span>
                </button>
                <div className="h-px bg-slate-100 my-1.5" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-600 text-sm transition-colors text-left font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
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
