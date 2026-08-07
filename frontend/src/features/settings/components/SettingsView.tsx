import React, { useState } from "react";
import { SettingsSubTab } from "../types/settings.types";
import { AccountInfoTab } from "./AccountInfoTab";
import { AccountInformationDetail } from "./AccountInformationDetail";
import { OrganizationTab } from "./OrganizationTab";
import { PlaceholderConfigTab } from "./PlaceholderConfigTab";
import { DepartmentTab } from "./DepartmentTab";

export const SettingsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("account-info");
  const [viewMode, setViewMode] = useState<"grid" | "account-detail" | "department">("grid");

  const handleSubTabChange = (tab: SettingsSubTab) => {
    setActiveSubTab(tab);
    setViewMode("grid");
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Row with Title & Right-Aligned Sub Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Configuration
        </h1>

        {/* Sub-Navigation Tabs Header */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500">
          <button
            onClick={() => handleSubTabChange("account-info")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "account-info"
                ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/60"
                : "hover:text-slate-900"
            }`}
          >
            Account Info
          </button>
          <span className="text-slate-300">|</span>

          <button
            onClick={() => handleSubTabChange("organization")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "organization"
                ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/60"
                : "hover:text-slate-900"
            }`}
          >
            Organization
          </button>
          <span className="text-slate-300">|</span>

          <button
            onClick={() => handleSubTabChange("payroll")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "payroll"
                ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/60"
                : "hover:text-slate-900"
            }`}
          >
            Payroll
          </button>
          <span className="text-slate-300">|</span>

          <button
            onClick={() => handleSubTabChange("attendance")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "attendance"
                ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/60"
                : "hover:text-slate-900"
            }`}
          >
            Attendance
          </button>
          <span className="text-slate-300">|</span>

          <button
            onClick={() => handleSubTabChange("leave")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "leave"
                ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/60"
                : "hover:text-slate-900"
            }`}
          >
            Leave
          </button>
          <span className="text-slate-300">|</span>

          <button
            onClick={() => handleSubTabChange("training")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "training"
                ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/60"
                : "hover:text-slate-900"
            }`}
          >
            Training
          </button>
          <span className="text-slate-300">|</span>

          <button
            onClick={() => handleSubTabChange("others")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "others"
                ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/60"
                : "hover:text-slate-900"
            }`}
          >
            Others
          </button>
        </div>
      </div>

      {/* Render Active Sub-Tab View */}
      {viewMode === "account-detail" ? (
        <AccountInformationDetail
          onBackToAccountInfo={() => setViewMode("grid")}
        />
      ) : viewMode === "department" ? (
        <DepartmentTab onBack={() => setViewMode("grid")} />
      ) : (
        <>
          {activeSubTab === "account-info" && (
            <AccountInfoTab
              onSelectAccountInformation={() => setViewMode("account-detail")}
            />
          )}

          {activeSubTab === "organization" && (
            <OrganizationTab onSelectDepartment={() => setViewMode("department")} />
          )}

          {activeSubTab === "payroll" && (
            <PlaceholderConfigTab
              title="Payroll"
              description="Manage salary structures, deductions, statutory rates, and tax policies."
            />
          )}

          {activeSubTab === "attendance" && (
            <PlaceholderConfigTab
              title="Attendance"
              description="Set up shift timings, overtime rules, geolocation boundaries, and check-in rules."
            />
          )}

          {activeSubTab === "leave" && (
            <PlaceholderConfigTab
              title="Leave"
              description="Manage leave accrual policies, carry-forward rules, and holiday lists."
            />
          )}

          {activeSubTab === "training" && (
            <PlaceholderConfigTab
              title="Training"
              description="Configure employee skill matrices, course modules, and certifications."
            />
          )}

          {activeSubTab === "others" && (
            <PlaceholderConfigTab
              title="Others"
              description="System backups, API webhooks, role permissions, and integration preferences."
            />
          )}
        </>
      )}
    </div>
  );
};
