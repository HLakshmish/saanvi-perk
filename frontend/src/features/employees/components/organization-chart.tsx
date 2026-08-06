import React, { useState, useEffect, useMemo } from "react";
import { Employee } from "../types/employees.types";
import { EmployeeCard } from "./employee-card";
import { Search, Loader2 } from "lucide-react";
import { getCompanySuperAdmin } from "../api/employees.api";
import { cn } from "@/lib/utils";

interface OrganizationChartProps {
  employees: Employee[];
  className?: string;
  currentUserName?: string;
  currentCompanyName?: string;
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({
  employees,
  className,
  currentUserName,
  currentCompanyName,
}) => {
  const [superAdmin, setSuperAdmin] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchSuperAdmin = async () => {
      try {
        setIsLoading(true);
        const res = await getCompanySuperAdmin();
        if (res.success && res.data) {
          const comp = res.data;
          const sa = comp.superAdmin;
          
          const companyLocation = comp.city
            ? (comp.state ? `${comp.city}, ${comp.state}` : comp.city)
            : (currentCompanyName || "Corporate");

          if (sa) {
            setSuperAdmin({
              id: `sa-${sa.superAdminId}`,
              employeeCode: `SA-${String(sa.superAdminId).padStart(5, "0")}`,
              name: `${sa.firstName} ${sa.lastName || ""}`.trim(),
              email: sa.email,
              location: companyLocation,
              department: "Management",
              designation: "SuperAdmin",
              employeeGroup: "Full-Time",
              reportsTo: undefined,
            });
          } else {
            // Fallback dynamically mapping the active SuperAdmin session
            setSuperAdmin({
              id: "sa-root",
              employeeCode: "SA-00001",
              name: currentUserName || "System Superadmin",
              email: comp.companyEmail || "superadmin@saanvi.com",
              location: companyLocation,
              department: "Management",
              designation: "SuperAdmin",
              employeeGroup: "Full-Time",
              reportsTo: undefined,
            });
          }
        } else {
          // Fallback if company details couldn't be loaded
          setSuperAdmin({
            id: "sa-root",
            employeeCode: "SA-00001",
            name: currentUserName || "System Superadmin",
            email: "superadmin@saanvi.com",
            location: currentCompanyName || "Saanvi Technologies",
            department: "Management",
            designation: "SuperAdmin",
            employeeGroup: "Full-Time",
            reportsTo: undefined,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch company SuperAdmin details", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuperAdmin();
  }, [currentUserName, currentCompanyName]);

  // Filter Admins from employee list
  const admins = useMemo(() => {
    return employees.filter(
      (emp) => emp.designation.toLowerCase() === "admin"
    );
  }, [employees]);

  // Combine SuperAdmin + employees for search
  const allSearchable = useMemo(() => {
    const list = [...employees];
    if (superAdmin) {
      list.unshift(superAdmin);
    }
    return list;
  }, [employees, superAdmin]);

  // Filter employees for the search box
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allSearchable.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query)
    );
  }, [allSearchable, searchQuery]);

  const handleSelectEmployee = (code: string) => {
    setHighlightedCode(code);
    setSearchQuery("");
    setIsDropdownOpen(false);
    // Remove highlight after 4 seconds
    setTimeout(() => {
      setHighlightedCode((prev) => (prev === code ? "" : prev));
    }, 4000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2.5">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-slate-500 text-xs font-semibold">Loading hierarchy chart...</span>
      </div>
    );
  }

  // SuperAdmin will always be the root node, or fallback to first employee if superAdmin is somehow null
  const rootNode = superAdmin || (employees.length > 0 ? employees[0] : null);

  if (!rootNode) {
    return (
      <div className="text-center py-12 text-gray-500 font-medium">
        No employee hierarchy data found.
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col w-full bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 ${className}`}>
      
      {/* Top Section: Search bar */}
      <div className="flex justify-end mb-8 relative z-20">
        <div className="relative w-80">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search by name or #code"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Search Dropdown Overlay */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              {searchResults.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp.employeeCode)}
                  className="flex flex-col w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <span className="font-semibold text-gray-800 text-xs uppercase">
                    {emp.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {emp.employeeCode} - {emp.designation} ({emp.department})
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Overlay click-out background */}
          {isDropdownOpen && searchQuery.trim() !== "" && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="flex flex-col items-center justify-center w-full min-h-[500px] overflow-x-auto select-none py-8">
        
        {/* Level 0: SuperAdmin / Root */}
        <div className="flex flex-col items-center mb-8">
          <EmployeeCard
            employee={rootNode}
            className={cn(
              "ring-indigo-500/85 ring-offset-2",
              rootNode.employeeCode === highlightedCode ? "ring-4 animate-pulse scale-105" : "ring-2 !bg-indigo-50/10"
            )}
          />
          {admins.length > 0 && (
            <div className="w-[1.5px] h-8 bg-slate-300"></div>
          )}
        </div>

        {/* Level 1: Admins */}
        {admins.length > 0 ? (
          <div className="flex flex-row items-start justify-center gap-12 relative">
            {admins.map((admin) => {
              const adminReportees = employees.filter(
                (emp) => emp.reportsTo === admin.employeeCode && emp.designation.toLowerCase() !== "admin"
              );

              return (
                <div key={admin.id} className="flex flex-col items-center relative">
                  {/* Admin Card */}
                  <EmployeeCard
                    employee={admin}
                    className={cn(
                      admin.employeeCode === highlightedCode ? "ring-4 ring-blue-500/80 ring-offset-2 scale-105 animate-pulse" : "ring-1 ring-slate-300/80 !bg-slate-50/50"
                    )}
                  />

                  {/* Line down to reportees */}
                  {adminReportees.length > 0 && (
                    <div className="w-[1.5px] h-8 bg-slate-300"></div>
                  )}

                  {/* Reportees Grid */}
                  {adminReportees.length > 0 && (
                    <div className="flex flex-col gap-4 mt-1">
                      {adminReportees.map((rep) => (
                        <div key={rep.id} className="flex flex-col items-center">
                          <EmployeeCard
                            employee={rep}
                            className={cn(
                              rep.employeeCode === highlightedCode
                                ? "ring-4 ring-blue-500/80 ring-offset-2 scale-105 animate-pulse"
                                : "!bg-white border-dashed border-slate-300"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 px-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs font-semibold max-w-sm">
            No Admins onboarded yet. Onboard an Admin to build the reporting tree.
          </div>
        )}

      </div>
    </div>
  );
};
