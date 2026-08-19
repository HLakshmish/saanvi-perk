"use client";

import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

export const ApprovalsPending: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-5">
      <h2 className="text-base font-bold text-brand-primary">Pending Approvals</h2>

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
          <p className="text-sm font-medium text-gray-700">Total Requests - 0</p>
        </div>

        {/* Right panel empty illustration */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-16 bg-gray-100 border border-gray-200 rounded-t-lg flex flex-col items-center justify-center relative mb-2">
            <div className="w-full h-3 bg-gray-200 rounded-t-lg absolute top-0 left-0 flex items-center px-1.5 gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="w-1 h-1 rounded-full bg-gray-400" />
            </div>
            {/* Neutral face icon */}
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="w-1 h-1 rounded-full bg-gray-400" />
            </div>
            <div className="w-3 h-0.5 bg-gray-400 rounded-full mt-1.5" />
          </div>
          <p className="text-sm font-medium text-gray-500">No Pending Approvals</p>
        </div>
      </div>
    </div>
  );
};
