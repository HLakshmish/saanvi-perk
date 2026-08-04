import React, { useState, useMemo } from "react";
import { Employee } from "../types/employees.types";
import { EmployeeCard } from "./employee-card";
import { Search } from "lucide-react";

interface OrganizationChartProps {
  employees: Employee[];
  className?: string;
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({
  employees,
  className,
}) => {
  // Find the default focused employee (the CEO CHINMAYA BAIRY, code ST00001, or fallback to first employee)
  const defaultFocusCode = useMemo(() => {
    const ceo = employees.find((emp) => emp.designation.toLowerCase() === "ceo");
    return ceo ? ceo.employeeCode : employees[0]?.employeeCode;
  }, [employees]);

  const [focusedCode, setFocusedCode] = useState<string>(defaultFocusCode || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get focused employee details
  const focusedEmployee = useMemo(() => {
    return employees.find((emp) => emp.employeeCode === focusedCode);
  }, [employees, focusedCode]);

  // Find manager of the focused employee
  const manager = useMemo(() => {
    if (!focusedEmployee || !focusedEmployee.reportsTo) return null;
    return employees.find((emp) => emp.employeeCode === focusedEmployee.reportsTo);
  }, [employees, focusedEmployee]);

  // Find direct reportees of the focused employee
  const reportees = useMemo(() => {
    if (!focusedEmployee) return [];
    return employees.filter((emp) => emp.reportsTo === focusedEmployee.employeeCode);
  }, [employees, focusedEmployee]);

  // Filter employees for the search box
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const handleSelectEmployee = (code: string) => {
    setFocusedCode(code);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  if (!focusedEmployee) {
    return (
      <div className="text-center py-8 text-gray-500 font-medium">
        No employee hierarchy data found.
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col w-full bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 ${className}`}>
      
      {/* Top Section: Search bar aligned to top-right of panel */}
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

      {/* Hierarchy Render Tree (Centered) */}
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] overflow-x-auto select-none py-6">
        
        {/* 1. Manager Card (at the very top if exists) */}
        {manager && (
          <div className="flex flex-col items-center mb-1">
            <EmployeeCard
              employee={manager}
              onClick={() => handleSelectEmployee(manager.employeeCode)}
            />
            {/* Connection Line */}
            <div className="w-[1.5px] h-6 bg-slate-300"></div>
          </div>
        )}

        {/* 2. Focused Employee Card */}
        <div className="flex flex-col items-center">
          <EmployeeCard
            employee={focusedEmployee}
            className="ring-2 ring-blue-500/60 ring-offset-2 !bg-blue-50/10"
          />
        </div>

        {/* 3. Reportees Section (if focused employee has reportees) */}
        {reportees.length > 0 && (
          <div className="flex flex-col items-center w-full">
            {/* Connection Line */}
            <div className="w-[1.5px] h-6 bg-slate-300"></div>
            
            {/* Reportees Button/Badge Pill */}
            <div className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold px-5 py-1.5 rounded shadow-2xs select-none">
              {reportees.length} Reportee{reportees.length > 1 ? "s" : ""}
            </div>

            {/* Gap space */}
            <div className="h-4"></div>

            {/* 4-Column Grid Layout matching screenshot exactly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1250px] px-4">
              {reportees.map((rep) => (
                <div key={rep.id} className="flex justify-center">
                  <EmployeeCard
                    employee={rep}
                    onClick={() => handleSelectEmployee(rep.employeeCode)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
