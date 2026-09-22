import React, { useState } from "react";
import { EmployeeList } from "./employee-list";
import { AddEmployeeWizard } from "./add-employee-wizard";
import { UserRole } from "@/types/dashboard";

interface EmployeeListPageProps {
  currentRole: UserRole;
  currentUserName?: string;
  currentCompanyName?: string;
}

export const EmployeeListPage: React.FC<EmployeeListPageProps> = ({
  currentRole,
  currentUserName,
  currentCompanyName,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"list" | "chart">("list");

  const isAuthorized = currentRole === "admin" || currentRole === "superadmin";

  if (!isAuthorized) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-xs p-8 text-center">
        <h3 className="text-lg font-bold text-red-600 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-sm">
          You do not have permission to view the employee directory or organization hierarchy.
        </p>
      </div>
    );
  }

  if (showWizard) {
    return (
      <AddEmployeeWizard
        currentRole={currentRole}
        onCancel={() => setShowWizard(false)}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1);
          setShowWizard(false);
        }}
      />
    );
  }

  return (
    <div className="w-full space-y-3.5 text-slate-900 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200">
        <div className="pb-2 sm:pb-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-primary tracking-tight">
            Employees
          </h2>
          {/* <p className="text-slate-500 text-xs font-semibold">
            View company structure and manage the corporate employee directory.
          </p> */}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 -mb-[1px]">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer rounded-t-md ${
              activeTab === "list"
                ? "bg-white text-brand-primary border-b-2 border-brand-primary font-semibold"
                : "bg-transparent text-slate-600 hover:text-brand-primary border-b-2 border-transparent"
            }`}
          >
            Employee List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chart")}
            className={`px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer rounded-t-md ${
              activeTab === "chart"
                ? "bg-white text-brand-primary border-b-2 border-brand-primary font-semibold"
                : "bg-transparent text-slate-600 hover:text-brand-primary border-b-2 border-transparent"
            }`}
          >
            Organisation Chart
          </button>
        </div>
      </div>

      {/* Main Employee Module Content */}
      <div>
        <EmployeeList
          key={refreshKey}
          activeTab={activeTab}
          canAddEmployee={currentRole === "admin" || currentRole === "superadmin"}
          onAddEmployee={() => setShowWizard(true)}
          currentUserName={currentUserName}
          currentCompanyName={currentCompanyName}
        />
      </div>
    </div>
  );
};
