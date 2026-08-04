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

// Utility to get design styles for different employee groups
const getGroupBadgeStyles = (group: string): string => {
  const normalized = group.toLowerCase();
  if (normalized.includes("full")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  }
  if (normalized.includes("contract")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
  }
  if (normalized.includes("intern")) {
    return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  }
  return "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20";
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-xl bg-slate-50/50">
        <p className="text-gray-500 text-sm font-medium">No employees found matching the criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-md shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 tracking-wider">Employee Code</th>
              <th className="px-6 py-4 tracking-wider">Employee Name</th>
              <th className="px-6 py-4 tracking-wider">Email</th>
              <th className="px-6 py-4 tracking-wider">Location</th>
              <th className="px-6 py-4 tracking-wider">Department</th>
              <th className="px-6 py-4 tracking-wider">Designation</th>
              <th className="px-6 py-4 tracking-wider">Employee Group</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {employees.map((employee) => (
              <tr 
                key={employee.id} 
                className="hover:bg-slate-50/50 transition-colors duration-250"
              >
                {/* Employee Code */}
                <td className="px-6 py-4 font-mono text-xs font-bold text-gray-800">
                  {employee.employeeCode}
                </td>
                
                {/* Employee Name (with initial avatar) */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs select-none">
                      {getInitials(employee.name)}
                    </div>
                    <span className="font-semibold text-gray-900">{employee.name}</span>
                  </div>
                </td>
                
                {/* Email */}
                <td className="px-6 py-4 text-gray-500 hover:text-blue-600 transition-colors">
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </td>
                
                {/* Location */}
                <td className="px-6 py-4 font-medium text-gray-800">
                  {employee.location}
                </td>
                
                {/* Department */}
                <td className="px-6 py-4">
                  <span className="text-gray-700">{employee.department}</span>
                </td>
                
                {/* Designation */}
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {employee.designation}
                </td>
                
                {/* Employee Group */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getGroupBadgeStyles(employee.employeeGroup)}`}>
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
