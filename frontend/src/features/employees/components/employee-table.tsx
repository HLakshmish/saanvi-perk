import React from "react";
import { Employee } from "../types/employees.types";

interface EmployeeTableProps {
  employees: Employee[];
}

// Utility to get name initials for the avatar
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// Utility to get dynamic premium avatar colors
const getAvatarColor = (name: string): string => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "bg-gradient-to-tr from-blue-500 to-indigo-500 text-white",
    "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
    "bg-gradient-to-tr from-violet-500 to-purple-500 text-white",
    "bg-gradient-to-tr from-rose-500 to-pink-500 text-white",
    "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
  ];
  return colors[hash % colors.length];
};

// Utility to get design styles for different employee groups
const getGroupBadgeStyles = (group: string): string => {
  const normalized = group.toLowerCase();
  if (normalized.includes("full")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  }
  if (normalized.includes("contract")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
  }
  if (normalized.includes("intern")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  }
  return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <p className="text-slate-500 text-sm font-semibold">
          No employees found matching the criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-shadow duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm text-slate-600">
          <thead className="bg-slate-50/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Employee Code</th>
              <th className="px-6 py-4">Employee Name</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Designation</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Employment Group</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-slate-50/70 transition-colors duration-150"
              >
                {/* Employee Code */}
                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 select-all">
                  {employee.employeeCode}
                </td>

                {/* Employee Name (with initials avatar) */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs select-none ${getAvatarColor(
                        employee.name
                      )}`}
                    >
                      {getInitials(employee.name)}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {employee.name}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 text-slate-500 hover:text-indigo-600 font-medium transition-colors select-all">
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </td>

                {/* Location */}
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {employee.location}
                </td>

                {/* Department */}
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-700">{employee.department}</span>
                </td>

                {/* Designation */}
                <td className="px-6 py-4 text-slate-500 font-semibold">
                  {employee.designation}
                </td>

                {/* Status (Default Active) */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Active
                  </span>
                </td>

                {/* Employee Group */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getGroupBadgeStyles(
                      employee.employeeGroup
                    )}`}
                  >
                    {employee.employeeGroup}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
