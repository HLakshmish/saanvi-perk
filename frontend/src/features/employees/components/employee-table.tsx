import React from "react";
import { Pencil, Trash2, Mail, MapPin } from "lucide-react";
import { Employee } from "../types/employees.types";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

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
    return "bg-brand-primary-light text-brand-primary border-brand-primary/20";
  }
  if (normalized.includes("contract")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200/30";
  }
  if (normalized.includes("intern")) {
    return "bg-amber-50 text-amber-700 border-amber-200/30";
  }
  return "bg-slate-50 text-slate-700 border-slate-200/35";
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onRowClick,
  onEdit,
  onDelete,
}) => {
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
    <TableContainer>
      <Table className="min-w-[950px]">
        <TableHeader>
          <tr>
            <TableHead>Employee</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Role & Team</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Employment Group</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} onClick={() => onRowClick(employee)}>
              {/* Employee Name & Code (grouped beautifully with an avatar) */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-brand-primary-light border border-brand-primary/20 flex items-center justify-center shrink-0 shadow-2xs relative">
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
              </TableCell>

              {/* Email Address with icon */}
              <TableCell>
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
              </TableCell>

              {/* Location */}
              <TableCell>
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{employee.location}</span>
                </div>
              </TableCell>

              {/* Role & Team */}
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-slate-800 font-bold text-xs">{employee.designation}</span>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                    {employee.department || "General"}
                  </span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-emerald-50 text-emerald-700 border-emerald-200/50">
                  <span className="w-1.2 h-1.2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Active
                </span>
              </TableCell>

              {/* Employee Group */}
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getGroupBadgeStyles(
                    employee.employeeGroup
                  )}`}
                >
                  {employee.employeeGroup}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(employee);
                    }}
                    className="p-1.5 hover:bg-brand-primary-light text-slate-400 hover:text-brand-primary rounded-xl transition-all duration-150 cursor-pointer"
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
