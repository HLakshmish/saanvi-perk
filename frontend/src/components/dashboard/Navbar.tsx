"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/dashboard";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";
import { getUserById } from "@/features/employees/api/employees.api";
import {
  Menu,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Lock,
  CircleUser,
  Activity,
  ArrowLeft,
  Shield,
  ShieldAlert,
  Briefcase,
  Check,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  currentRole: UserRole;
  activeTab?: string;
  onRoleChange?: (role: UserRole) => void;
  userName: string;
  companyName: string;
  companyLogo?: string;
  onToggleSidebar?: () => void;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab = "dashboard",
  onRoleChange,
  userName,
  companyName,
  companyLogo,
  onToggleSidebar,
  onTabChange,
}) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [assignedRoles, setAssignedRoles] = useState<UserRole[]>([currentRole]);
  const [hasFetchedRoles, setHasFetchedRoles] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [resolvedUserName, setResolvedUserName] = useState(userName || "");
  const [resolvedCompanyName, setResolvedCompanyName] = useState(companyName || "");
  const [resolvedCompanyLogo, setResolvedCompanyLogo] = useState(companyLogo || "");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (userName) {
      setResolvedUserName(userName);
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_name");
      if (stored) setResolvedUserName(stored);
    }
  }, [userName]);

  useEffect(() => {
    if (companyName) {
      setResolvedCompanyName(companyName);
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("company_name");
      if (stored) setResolvedCompanyName(stored);
    }
  }, [companyName]);

  useEffect(() => {
    if (companyLogo) {
      setResolvedCompanyLogo(companyLogo);
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("company_logo");
      if (stored) setResolvedCompanyLogo(stored);
    }
  }, [companyLogo]);

  const normalizeRole = (codeOrName?: string): UserRole | null => {
    if (!codeOrName) return null;
    const s = String(codeOrName).toLowerCase().replace(/[\s_-]+/g, "");
    if (s.includes("superadmin") || s.includes("super")) return "superadmin";
    if (s.includes("admin") || s.includes("hr") || s.includes("manager")) return "admin";
    if (s.includes("employee") || s.includes("user") || s.includes("staff")) return "employee";
    if (s.includes("owner")) return "owner";
    return null;
  };

  useEffect(() => {
    if (hasFetchedRoles) return;

    const fetchUserRoles = async () => {
      try {
        const userId = getCurrentUserId();
        const detectedRoles: UserRole[] = [currentRole];

        if (currentRole === "superadmin") {
          detectedRoles.push("superadmin", "admin", "employee");
        } else if (userId) {
          const res = await getUserById(userId);
          if (res.success && res.data) {
            // Check userRoles relation
            const userRolesArray = Array.isArray(res.data.userRoles) ? res.data.userRoles : [];
            userRolesArray.forEach((ur: any) => {
              const rawRole =
                ur.role?.roleCode ||
                ur.role?.roleName ||
                ur.roleCode ||
                ur.roleName ||
                (typeof ur === "string" ? ur : "");
              const normalized = normalizeRole(rawRole);
              if (normalized) detectedRoles.push(normalized);
            });

            // Check roles field if array of strings
            if (Array.isArray(res.data.roles)) {
              res.data.roles.forEach((r: any) => {
                const normalized = normalizeRole(typeof r === "string" ? r : r.roleName);
                if (normalized) detectedRoles.push(normalized);
              });
            }

            // Check single role field
            if (res.data.role) {
              const normalized = normalizeRole(res.data.role);
              if (normalized) detectedRoles.push(normalized);
            }
          }
        }

        const uniqueRoles = Array.from(new Set(detectedRoles)).filter((r): r is UserRole =>
          ["superadmin", "admin", "employee", "owner"].includes(r)
        );

        if (uniqueRoles.length > 0) {
          setAssignedRoles(uniqueRoles);
        }
      } catch (err) {
        console.error("Failed to fetch user roles in Navbar:", err);
      } finally {
        setHasFetchedRoles(true);
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
      localStorage.removeItem("company_name");
      localStorage.removeItem("company_logo");
    }
    window.location.href = "/";
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    setIsProfileOpen(false);
    setIsRoleDropdownOpen(false);
    document.cookie = `user_role=${newRole}; path=/; max-age=86400;`;
    if (typeof window !== "undefined") {
      localStorage.setItem("user_role", newRole);
    }
    if (onRoleChange) {
      onRoleChange(newRole);
    }
    router.push(`/${newRole}/dashboard`);
  };

  const getRoleBadgeInfo = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return {
          label: "Super Admin",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />,
          colorClass: "bg-purple-50 text-purple-800 border-purple-200/80",
        };
      case "admin":
        return {
          label: "Admin",
          icon: <Shield className="w-3.5 h-3.5 text-emerald-600" />,
          colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
        };
      case "owner":
        return {
          label: "Owner",
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
          colorClass: "bg-amber-50 text-amber-800 border-amber-200/80",
        };
      case "employee":
      default:
        return {
          label: "Employee",
          icon: <UserIcon className="w-3.5 h-3.5 text-brand-primary" />,
          colorClass: "bg-brand-primary-light text-brand-primary border-brand-primary/20",
        };
    }
  };

  const currentRoleInfo = getRoleBadgeInfo(currentRole);
  const showRoleSwitcher = assignedRoles.length > 1;

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sticky top-0 z-40 shadow-2xs text-slate-800">
      {/* Left section: Back Button / Hamburger & Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* On Mobile: If viewing a sub-page, show Back button (hidden on desktop) */}
        {activeTab !== "dashboard" && (
          <button
            onClick={() => onTabChange && onTabChange("dashboard")}
            className="flex md:hidden items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-primary font-bold text-xs transition-all cursor-pointer shadow-2xs"
            aria-label="Back to Dashboard"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Hamburger Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onTabChange && onTabChange("dashboard")}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group min-w-0 shrink"
        >
          {isMounted && (resolvedCompanyLogo || companyLogo) ? (
            <div className="h-7 sm:h-8 max-w-[80px] xs:max-w-[110px] sm:max-w-[140px] flex items-center justify-center shrink-0">
              <img
                src={resolvedCompanyLogo || companyLogo}
                alt={resolvedCompanyName || companyName || "Organization Logo"}
                className="h-full w-auto max-w-full object-contain"
              />
            </div>
          ) : (resolvedCompanyName || companyName) ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center text-xs font-black shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              {(resolvedCompanyName || companyName).charAt(0).toUpperCase()}
            </div>
          ) : null}

          {(resolvedCompanyName || companyName) && (
            <span className="font-black text-brand-primary text-xs xs:text-sm sm:text-base tracking-tight leading-tight truncate max-w-[85px] xs:max-w-[130px] sm:max-w-[220px] md:max-w-[320px]">
              {resolvedCompanyName || companyName}
            </span>
          )}
        </div>
      </div>

      {/* Right section: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-3.5 text-xs sm:text-sm">
        {/* Role Selector Dropdown (Shown whenever user has multiple assigned roles) */}
        {showRoleSwitcher && (
          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
              className="appearance-none px-2 sm:px-3 py-1 sm:py-1.5 pr-6 sm:pr-7 border border-slate-200/90 rounded-xl text-brand-primary bg-slate-50 hover:bg-slate-100 font-bold text-[11px] sm:text-xs focus:ring-2 focus:ring-brand-primary/20 focus:outline-none cursor-pointer capitalize shadow-2xs max-w-[110px] sm:max-w-none truncate"
            >
              {assignedRoles.map((r) => (
                <option key={r} value={r} className="bg-white text-slate-800 capitalize">
                  {r === "superadmin"
                    ? "Superadmin"
                    : r === "admin"
                    ? "Admin"
                    : r === "owner"
                    ? "Owner"
                    : "Employee"}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* User Profile Pill */}
        <div className={`relative ${showRoleSwitcher ? "pl-3 border-l border-slate-200" : ""}`}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent transition-colors cursor-pointer"
          >
            <div className="w-7.5 h-7.5 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-xs hidden sm:inline">
              {resolvedUserName || userName || "User"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 hidden sm:inline transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-brand-primary text-sm transition-colors text-left font-medium cursor-pointer"
                >
                  <CircleUser className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>View My Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-brand-primary text-sm transition-colors text-left font-medium cursor-pointer">
                  <Activity className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Set Status</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-brand-primary text-sm transition-colors text-left font-medium cursor-pointer">
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
