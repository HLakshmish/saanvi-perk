"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/dashboard";
import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { EmployeeProfile } from "@/features/employees/components/employee-profile";
import { getCompanySuperAdmin, getUserById } from "@/features/employees/api/employees.api";
import { EmployeeEditModal } from "@/features/employees/components/employee-edit-modal";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

function getUserRoleCookie(): UserRole {
  if (typeof document === "undefined") return "employee";
  const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
  const role = match ? match[1] : "employee";
  return role as UserRole;
}

const getUserIdFromToken = (): number | null => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    return decodedPayload.userId;
  } catch (e) {
    return null;
  }
};

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Read role from cookie
    const currentRole = getUserRoleCookie();
    setRole(currentRole);

    // Load company metadata
    const loadCompanyMetadata = async () => {
      try {
        const res = await getCompanySuperAdmin();
        if (res.success && res.data) {
          const comp = res.data;
          if (comp.companyName) {
            setCompanyName(comp.companyName);
          }
          if (comp.superAdmin && currentRole === "superadmin") {
            const sa = comp.superAdmin;
            setUserName(`${sa.firstName} ${sa.lastName || ""}`.trim());
          } else {
            // Fetch logged in user's name
            const loggedInUserId = getUserIdFromToken();
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
    <div className="min-h-screen bg-[#f4fbf7] flex flex-col font-sans">
      <Navbar
        currentRole={role}
        onRoleChange={setRole}
        userName={userName}
        companyName={companyName}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onTabChange={handleTabChange}
      />
      <div className="flex flex-1">
        <Sidebar
          currentRole={role}
          activeTab="employees" // Highlight employees tab as active
          onTabChange={handleTabChange}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto max-w-7xl mx-auto w-full">
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
