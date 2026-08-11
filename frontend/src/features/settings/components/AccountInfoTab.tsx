import React from "react";
import { FileText } from "lucide-react";

interface AccountInfoTabProps {
  onSelectAccountInformation: () => void;
}

export const AccountInfoTab: React.FC<AccountInfoTabProps> = ({
  onSelectAccountInformation,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-[#013e37] tracking-tight">
          Account Info
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Set up business profile with locations, addresses, branding and other configurations.
        </p>
      </div>

      {/* Grid of Account Configuration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {/* Card 1: Account Information */}
        <div
          onClick={onSelectAccountInformation}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-[#013e37]/40 transition-all cursor-pointer group flex items-start gap-4"
        >
          {/* Circular Icon Container */}
          <div className="w-12 h-12 rounded-2xl bg-[#013e37]/10 border border-[#013e37]/20 flex items-center justify-center text-[#013e37] shrink-0 group-hover:scale-105 group-hover:bg-[#013e37] group-hover:text-[#ffefb3] transition-all">
            <FileText className="w-6 h-6" />
          </div>

          {/* Text Content */}
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#013e37] transition-colors">
              Account Information
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Set up your Company's Profile, Branding, Mail & Statutory configuration among others on to Nexus HRMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
