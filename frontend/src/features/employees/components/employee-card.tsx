import React from "react";
import { Employee } from "../types/employees.types";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: Employee;
  className?: string;
  onClick?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 w-72 bg-slate-50 border border-slate-200 rounded-lg select-none text-left align-top transition-all duration-200",
        onClick && "cursor-pointer hover:bg-slate-100 hover:border-slate-300 hover:shadow-xs",
        className
      )}
    >
      {/* Left: Avatar Circle */}
      <div className="w-10 h-10 rounded-full bg-[#013e37] text-[#ffefb3] flex items-center justify-center shrink-0 shadow-2xs">
        <User className="w-5 h-5 text-[#ffefb3]" />
      </div>

      {/* Right: Left-Aligned Detail Lines */}
      <div className="flex flex-col min-w-0 leading-tight">
        {/* Name (Uppercase Bold) */}
        <h4 className="font-extrabold text-[#013e37] text-sm truncate uppercase mb-1">
          {employee.name}
        </h4>
        
        {/* Employee Code */}
        <span className="text-gray-400 text-xs font-mono mb-1.5">
          {employee.employeeCode}
        </span>
        
        {/* Designation */}
        <span className="text-gray-600 text-xs font-medium mb-1">
          {employee.designation}
        </span>
        
        {/* Department */}
        <span className="text-gray-500 text-[11px] mb-1">
          {employee.department}
        </span>
        
        {/* Location */}
        <span className="text-gray-500 text-[11px]">
          {employee.location}
        </span>
      </div>
    </div>
  );
};
