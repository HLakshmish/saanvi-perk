"use client";

import React, { useState } from "react";
import { Search, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";

export const ApprovalsInsights: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  return (
    <div className="space-y-6">
      {/* Row 1: 3 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Total Approvals
            </h2>
            <button className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <span>This Month</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          <div className="my-2">
            <span className="text-5xl font-bold text-brand-primary">0</span>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Total Approvals Received
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                Pending
              </span>
              <span className="font-semibold text-gray-800">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Completed
              </span>
              <span className="font-semibold text-gray-800">0</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col items-center justify-between min-h-[220px]">
          <div className="w-full flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              Pending Approvals
            </h2>
            <button className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <span>This Month</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center my-auto py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary-light border border-brand-primary/10 flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-brand-primary/80 rounded-md flex flex-col justify-center p-1.5 space-y-1">
                <div className="h-1 bg-white rounded-full w-full" />
                <div className="h-1 bg-white/70 rounded-full w-3/4" />
                <div className="h-1 bg-white/70 rounded-full w-1/2" />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              You don't have any pending approvals!
            </p>
          </div>
        </div>

        {/* Card 3: Approval Request Stats - 2026 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col items-center justify-between min-h-[220px]">
          <div className="w-full flex items-center justify-start">
            <h2 className="text-sm font-semibold text-gray-800">
              Approval Request Stats - 2026
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center my-auto py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary-light border border-brand-primary/10 flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-brand-primary rounded-md flex flex-col justify-center p-1.5 space-y-1">
                <div className="h-1 bg-white rounded-full w-full" />
                <div className="h-1 bg-brand-accent rounded-full w-3/4" />
                <div className="h-1 bg-white/60 rounded-full w-1/2" />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              You don't have any Approval Request Stats!
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-gray-900">Pending Approvals</h2>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span>Select All</span>
            </label>
          </div>

          <button className="flex items-center gap-2 text-xs border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
            <span>All</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Content Box (Split view) */}
        <div className="border border-gray-200 rounded-lg flex flex-col md:flex-row min-h-[220px]">
          {/* Left panel summary */}
          <div className="w-full md:w-64 bg-gray-50 p-4 border-b md:border-b-0 md:border-r border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              Total Requests - 0
            </p>
          </div>

          {/* Right panel empty illustration */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-16 bg-gray-100 border border-gray-200 rounded-t-lg flex flex-col items-center justify-center relative mb-2">
              <div className="w-full h-3 bg-gray-200 rounded-t-lg absolute top-0 left-0 flex items-center px-1.5 gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="w-1 h-1 rounded-full bg-gray-400" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="w-1 h-1 rounded-full bg-gray-400" />
              </div>
              <div className="w-3 h-0.5 bg-gray-400 rounded-full mt-1.5" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              No Pending Approvals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
