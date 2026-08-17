import React from "react";
import { Employee } from "../types/employees.types";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: Employee;
  className?: string;
  isRoot?: boolean;
  childCount?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClick?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  className,
  isRoot = false,
  childCount = 0,
  isExpanded = true,
  onToggleExpand,
  onClick,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (onToggleExpand) {
      onToggleExpand();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col items-center w-48 sm:w-52 select-none cursor-pointer transition-all duration-300",
        className
      )}
    >
      {/* Top Floating DP / Profile Picture */}
      <div
        className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-[3.5px] border-[#013e37] bg-white shadow-md flex items-center justify-center -mb-5 z-20 overflow-hidden transition-transform duration-300 group-hover:scale-105"
      >
        {employee.profilePic ? (
          <img
            src={employee.profilePic}
            alt={employee.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // fallback if image link fails to load
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#013e37]/5 text-[#013e37] flex items-center justify-center">
            <User className="w-8 h-8 text-[#013e37]" />
          </div>
        )}
      </div>

      {/* Main Card Box */}
      <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 bg-white transition-all duration-300 group-hover:shadow-md group-hover:border-[#013e37]/40">
        
        {/* Name Banner Pill - Single Consistent Theme Color (#013e37) */}
        <div className="pt-6 pb-1.5 px-2.5 text-center text-[#ffefb3] bg-[#013e37] transition-colors">
          <h4
            className="font-extrabold text-[11px] sm:text-xs tracking-tight uppercase truncate"
            title={employee.name}
          >
            {employee.name}
          </h4>
        </div>

        {/* Card Body Details */}
        <div className="py-2.5 px-3 text-center space-y-0.5 bg-white">
          <p
            className="text-[11px] font-bold text-slate-800 truncate"
            title={employee.designation}
          >
            {employee.designation}
          </p>
          <p
            className="text-[10px] text-slate-500 font-medium truncate"
            title={`${employee.department} • ${employee.employeeCode}`}
          >
            {employee.department} <span className="text-slate-300">•</span> <span className="font-mono">{employee.employeeCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
