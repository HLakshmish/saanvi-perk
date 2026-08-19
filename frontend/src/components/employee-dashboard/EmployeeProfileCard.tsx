"use client";

import React from "react";
import { User, Loader2 } from "lucide-react";

interface EmployeeProfileCardProps {
  isLoading: boolean;
  userProfile: any;
  employeeFullName: string;
  designationName: string;
  onViewProfile: () => void;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({
  isLoading,
  userProfile,
  employeeFullName,
  designationName,
  onViewProfile,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-2xs flex flex-col items-center justify-center text-center py-12 min-h-[280px]">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        <span className="text-[11px] text-slate-400 font-semibold mt-2">Loading profile...</span>
      </div>
    );
  }

  const firstLetter = userProfile?.firstName?.charAt(0).toUpperCase() || employeeFullName.charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-2xs flex flex-col items-center text-center space-y-4">
      <div className="w-18 h-18 rounded-full bg-brand-primary/5 border border-brand-primary/15 flex items-center justify-center shadow-inner relative select-none">
        <span className="text-brand-primary text-2.5xl font-extrabold tracking-tight">
          {firstLetter}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">{employeeFullName}</h3>
        <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">{designationName}</p>
      </div>

      <div className="w-full h-px bg-slate-100" />

      <div className="w-full space-y-2 text-left text-xs font-semibold text-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Employee Code</span>
          <span className="font-mono text-slate-900 font-bold">{userProfile?.employeeCode || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Department</span>
          <span className="text-slate-900 font-bold">{userProfile?.department?.departmentName || "General"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Official Email</span>
          <span className="text-slate-900 font-bold truncate max-w-[140px]" title={userProfile?.officialEmail}>
            {userProfile?.officialEmail || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Joining Date</span>
          <span className="text-slate-900 font-bold">
            {userProfile?.joiningDate ? new Date(userProfile.joiningDate).toLocaleDateString("en-IN") : "N/A"}
          </span>
        </div>
      </div>

      <button
        onClick={onViewProfile}
        className="w-full py-2 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <User className="w-3.5 h-3.5" />
        <span>View Full Profile</span>
      </button>
    </div>
  );
};
