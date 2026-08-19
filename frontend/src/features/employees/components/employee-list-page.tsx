import React, { useState } from "react";
import { EmployeeList } from "./employee-list";
import { AddEmployeeWizard } from "./add-employee-wizard";
import { Button } from "@/components/ui/button";
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
    <div className="w-full space-y-5 text-slate-900 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-brand-primary/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-primary tracking-tight">
            Employees
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            View company structure and manage the corporate employee directory.
          </p>
        </div>
        {/* Hide Add Employee button unless role is Admin or Super Admin */}
        {(currentRole === "admin" || currentRole === "superadmin") && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="h-9 text-xs font-bold rounded-xl shadow-xs"
              onClick={() => setShowWizard(true)}
            >
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* Main Employee Module Content */}
      <div>
        <EmployeeList key={refreshKey} currentUserName={currentUserName} currentCompanyName={currentCompanyName} />
      </div>
    </div>
  );
};
