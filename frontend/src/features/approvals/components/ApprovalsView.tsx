"use client";

import React, { useState } from "react";
import { ApprovalsInsights } from "./ApprovalsInsights";
import { ApprovalsPending } from "./ApprovalsPending";
import { ApprovalsCompleted } from "./ApprovalsCompleted";
import { AdvanceSearchModal } from "./AdvanceSearchModal";

export const ApprovalsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"insights" | "pending" | "completed">("insights");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        return <ApprovalsPending />;
      case "completed":
        return <ApprovalsCompleted onFilterClick={() => setIsSearchOpen(true)} />;
      case "insights":
      default:
        return <ApprovalsInsights />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-primary/15 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-primary tracking-tight">
          Approval Request
        </h1>

        {/* Sub-tabs */}
        <div className="flex items-center gap-6 text-sm">
          <button
            onClick={() => setActiveTab("insights")}
            className={`pb-2.5 font-bold transition-colors relative cursor-pointer ${
              activeTab === "insights"
                ? "text-brand-primary border-b-2 border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-2.5 font-semibold transition-colors relative cursor-pointer ${
              activeTab === "pending"
                ? "text-brand-primary border-b-2 border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-2.5 font-semibold transition-colors relative cursor-pointer ${
              activeTab === "completed"
                ? "text-brand-primary border-b-2 border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Main Tab Panel Content */}
      {renderTabContent()}

      {/* Advanced Search Modal overlay */}
      <AdvanceSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

