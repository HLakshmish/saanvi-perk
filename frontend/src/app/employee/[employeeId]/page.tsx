"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/dashboard";
import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { EmployeeProfile } from "@/features/employees/components/employee-profile";
import { getCompanySuperAdmin, getUserById } from "@/features/employees/api/employees.api";
import { EmployeeEditModal } from "@/features/employees/components/employee-edit-modal";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";

function getUserRoleCookie(): UserRole {
  if (typeof document === "undefined") return "employee";
  const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
  const role = match ? match[1] : (typeof window !== "undefined" ? localStorage.getItem("user_role") : null);
  return (role as UserRole) || "employee";
}

interface PageProps {
  params: Promise<{ employeeId: string }>;
}

export default function EmployeeProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const employeeId = Number(resolvedParams.employeeId);
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("employee");
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Read role from cookie
    const currentRole = getUserRoleCookie();
    setRole(currentRole);

    // Immediately resolve stored user and company details from localStorage
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("user_name");
      if (storedUserName) setUserName(storedUserName);

      const storedCompanyName = localStorage.getItem("company_name");
      if (storedCompanyName) setCompanyName(storedCompanyName);

      const storedCompanyLogo = localStorage.getItem("company_logo");
      if (storedCompanyLogo) setCompanyLogo(storedCompanyLogo);
    }

    // Load company metadata
    const loadCompanyMetadata = async () => {
      try {
        const res = await getCompanySuperAdmin();
        if (res.success && res.data) {
          const comp = res.data;
          if (comp.companyName) {
            setCompanyName(comp.companyName);
          }
          if (comp.logo) {
            setCompanyLogo(comp.logo);
          }
          if (comp.superAdmin && currentRole === "superadmin") {
            const sa = comp.superAdmin;
            setUserName(`${sa.firstName} ${sa.lastName || ""}`.trim());
          } else {
            // Fetch logged in user's name
            const loggedInUserId = getCurrentUserId();
            if (loggedInUserId) {
              const userRes = await getUserById(loggedInUserId);
              if (userRes.success && userRes.data) {
                const u = userRes.data;
                setUserName(`${u.firstName} ${u.lastName || ""}`.trim());
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic profile layout metadata:", err);
      }
    };
    loadCompanyMetadata();
  }, []);

  const handleTabChange = (tab: string) => {
    // Redirect to dashboard with active tab
    router.push(`/${role}/dashboard?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      <Navbar
        currentRole={role}
        onRoleChange={setRole}
        userName={userName}
        companyName={companyName}
        companyLogo={companyLogo}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onTabChange={handleTabChange}
      />
      <div className="flex flex-1">
        <Sidebar
          currentRole={role}
          activeTab="employees" // Highlight employees tab as active
          onTabChange={handleTabChange}
          isSidebarOpen={isSidebarOpen}
          onCloseMobileSidebar={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto max-w-[1440px] mx-auto w-full">
          <EmployeeProfile 
            key={refreshKey}
            employeeId={employeeId} 
            onEditClick={() => setIsEditOpen(true)}
          />
        </main>
      </div>

      {isEditOpen && (
        <EmployeeEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setRefreshKey((prev) => prev + 1);
            setIsEditOpen(false);
          }}
          employeeId={employeeId}
          employeeName=""
        />
      )}
    </div>
  );
}
