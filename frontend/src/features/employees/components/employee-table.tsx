import React from "react";
import { Pencil, Trash2, Mail, MapPin } from "lucide-react";
import { Employee } from "../types/employees.types";

interface EmployeeTableProps {
  employees: Employee[];
  onRowClick: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

// Utility to get design styles for different employee groups
const getGroupBadgeStyles = (group: string): string => {
  const normalized = group.toLowerCase();
  if (normalized.includes("full")) {
    return "bg-emerald-55/10 text-emerald-800 border-emerald-250/20";
  }
  if (normalized.includes("contract")) {
    return "bg-indigo-50/50 text-indigo-700 border-indigo-200/30";
  }
  if (normalized.includes("intern")) {
    return "bg-amber-50/50 text-amber-700 border-amber-200/30";
  }
  return "bg-slate-50/50 text-slate-700 border-slate-200/35";
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onRowClick, onEdit, onDelete }) => {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
        <p className="text-slate-500 text-sm font-semibold">
          No employees found matching the criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xs hover:shadow-xs transition-all duration-300">
      {/* Horizontal scroll container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/60 font-bold text-slate-900 select-none">
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Employee</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Contact Info</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Location</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Role & Team</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Status</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Employment Group</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-450 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {employees.map((employee) => (
              <tr
                key={employee.id}
                onClick={() => onRowClick(employee)}
                className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
              >
                {/* Employee Name & Code (grouped beautifully with an avatar) */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center shrink-0 shadow-2xs relative">
                      {employee.profilePic ? (
                        <img
                          src={employee.profilePic}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-brand-primary text-sm font-extrabold">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-snug group-hover:text-brand-primary transition-colors duration-200">
                        {employee.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider mt-0.5">
                        {employee.employeeCode}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Email Address with icon */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2 text-slate-500 font-medium select-all">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${employee.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-brand-primary transition-colors duration-150"
                    >
                      {employee.email}
                    </a>
                  </div>
                </td>

                {/* Location */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{employee.location}</span>
                  </div>
                </td>

                {/* Role & Team */}
                <td className="py-4 px-5">
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-bold text-xs">{employee.designation}</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                      {employee.department || "General"}
                    </span>
                  </div>
                </td>

                {/* Status (Default Active with Green Dot indicator) */}
                <td className="py-4 px-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-emerald-50 text-emerald-700 border-emerald-200/50">
                    <span className="w-1.2 h-1.2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Active
                  </span>
                </td>

                {/* Employee Group */}
                <td className="py-4 px-5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getGroupBadgeStyles(
                      employee.employeeGroup
                    )}`}
                  >
                    {employee.employeeGroup}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(employee);
                      }}
                      className="p-1.5 hover:bg-slate-100/80 text-slate-400 hover:text-slate-900 rounded-xl transition-all duration-150 cursor-pointer"
                      title="Edit Profile"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(employee);
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all duration-150 cursor-pointer"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
