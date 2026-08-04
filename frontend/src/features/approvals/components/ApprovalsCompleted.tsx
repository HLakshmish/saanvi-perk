"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  ChevronDown,
} from "lucide-react";

interface ApprovalsCompletedProps {
  onFilterClick: () => void;
}

export const ApprovalsCompleted: React.FC<ApprovalsCompletedProps> = ({
  onFilterClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("All");

  const approvalTypes = [
    "All",
    "LEAVE",
    "ATTENDANCE",
    "ACCUMULATION",
    "REIMBURSEMENT",
    "DOCUMENT",
    "TAX_DECLARATION",
    "OTMINS",
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-2xs min-h-[500px] flex flex-col relative">
      {/* Header Titles */}
      <div className="mb-6 text-left">
        <h2 className="text-base font-bold text-gray-900">
          Completed Approvals
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          Select an employee or date range to view completed requests.
        </p>
      </div>

      {/* Filter Row controls */}
      <div className="flex flex-wrap items-center gap-3 mb-10 z-30">
        {/* Name / Code input */}
        <div className="relative min-w-[220px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or #code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Select Date button */}
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors cursor-pointer">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span>Select Date</span>
        </button>

        {/* Filter button */}
        <button
          onClick={onFilterClick}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors cursor-pointer"
        >
          <Filter className="w-4 h-4 text-gray-500" />
          <span>Filter</span>
        </button>

        {/* Type Select Dropdown */}
        <div className="relative min-w-[160px]">
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white hover:bg-gray-50 font-medium transition-colors cursor-pointer"
          >
            <span className="capitalize">{selectedType}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>

          {/* Dropdown Options list overlay */}
          {showTypeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-40 max-h-60 overflow-y-auto">
              {approvalTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setShowTypeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors uppercase ${
                    selectedType === type
                      ? "text-blue-600 bg-blue-50/40"
                      : "text-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-2xs transition-colors cursor-pointer">
          Search
        </button>
      </div>

      {/* Empty State Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 z-10">
        {/* Custom SVG Illustration representing Completed Approvals */}
        <div className="relative w-72 sm:w-80 h-48 flex items-center justify-center">
          <svg
            viewBox="0 0 320 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Window Frame */}
            <rect
              x="40"
              y="20"
              width="200"
              height="120"
              rx="6"
              fill="white"
              stroke="#D1D5DB"
              strokeWidth="2"
            />
            {/* Window Header */}
            <path
              d="M40 26C40 22.6863 42.6863 20 46 20H234C237.314 20 240 22.6863 240 26V32H40V26Z"
              fill="#1F2937"
            />
            <circle cx="48" cy="26" r="2.5" fill="#EF4444" />
            <circle cx="55" cy="26" r="2.5" fill="#F59E0B" />
            <circle cx="62" cy="26" r="2.5" fill="#10B981" />

            {/* Window Content Lines */}
            {/* Row 1 */}
            <rect x="52" y="44" width="96" height="34" rx="4" fill="#F3F4F6" />
            <circle cx="68" cy="61" r="10" fill="#EAB308" />
            <rect x="84" y="54" width="52" height="5" rx="2" fill="#E5E7EB" />
            <rect x="84" y="63" width="36" height="4" rx="2" fill="#E5E7EB" />

            {/* Row 2 */}
            <rect x="52" y="86" width="96" height="34" rx="4" fill="#F3F4F6" />
            <circle cx="68" cy="103" r="10" fill="#3B82F6" />
            <path
              d="M68 98V108M63 103H73"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="84" y="96" width="48" height="5" rx="2" fill="#E5E7EB" />

            {/* Character Illustration */}
            <path
              d="M245 160V120C245 112 240 108 230 108C222 108 215 114 215 125V160"
              fill="#1E293B"
            />
            {/* Legs */}
            <rect x="222" y="160" width="8" height="30" fill="#1E293B" />
            <rect x="238" y="160" width="8" height="30" fill="#1E293B" />
            <rect x="219" y="187" width="12" height="5" rx="2" fill="#0F172A" />
            <rect x="235" y="187" width="12" height="5" rx="2" fill="#0F172A" />

            {/* Head */}
            <circle cx="230" cy="98" r="9" fill="#FDBA74" />
            <path
              d="M222 94C222 90 226 86 232 86C236 86 240 89 238 95C236 97 228 97 222 94Z"
              fill="#1E293B"
            />

            {/* Badge held by character */}
            <circle cx="210" cy="130" r="12" fill="#86EFAC" />
            <circle cx="210" cy="127" r="4.5" fill="#15803D" />
            <path
              d="M202 138C202 134 205 133 210 133C215 133 218 134 218 138H202Z"
              fill="#15803D"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
