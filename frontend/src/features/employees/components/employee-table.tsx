import { Eye, Pencil, Trash2 } from "lucide-react";
import { Employee } from "../types/employees.types";

interface EmployeeTableProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

// Utility to get design styles for different employee groups
const getGroupBadgeStyles = (group: string): string => {
  const normalized = group.toLowerCase();
  if (normalized.includes("full")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-250";
  }
  if (normalized.includes("contract")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-255";
  }
  if (normalized.includes("intern")) {
    return "bg-amber-50 text-amber-700 border-amber-250";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onView, onEdit, onDelete }) => {
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
      {/* Horizontal scroll container with custom scrollbar styling */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Employee Code</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Employee Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Department</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Designation</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Employment Group</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                {/* Employee Code */}
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900 select-all">
                  {employee.employeeCode}
                </td>

                {/* Employee Name (Profile logo removed as requested) */}
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {employee.name}
                </td>

                {/* Email */}
                <td className="py-3.5 px-4 text-slate-500 hover:text-[#013e37] transition-colors font-medium select-all">
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </td>

                {/* Location */}
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {employee.location}
                </td>

                {/* Department */}
                <td className="py-3.5 px-4">
                  <span className="text-slate-700 font-medium">{employee.department}</span>
                </td>

                {/* Designation */}
                <td className="py-3.5 px-4 text-slate-500 font-semibold">
                  {employee.designation}
                </td>

                {/* Status (Default Active with Green Dot indicator) */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Active
                  </span>
                </td>

                {/* Employee Group */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold border ${getGroupBadgeStyles(
                      employee.employeeGroup
                    )}`}
                  >
                    {employee.employeeGroup}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(employee);
                      }}
                      className="p-1 hover:bg-[#013e37]/10 text-[#013e37] rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(employee);
                      }}
                      className="p-1 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(employee);
                      }}
                      className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-4 h-4" />
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
