"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface RequestsTableProps {
  onRowClick: (id: string) => void;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({ onRowClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState("01 May 2026 - 31 Aug 2026");

  const mockData = [
    {
      id: "ST00095",
      date: "22-07-2026",
      type: "Attendance",
      lastAction: "CHINMAYA BAIRY",
      status: "Approved",
    },
    {
      id: "ST00096",
      date: "06-07-2026",
      type: "Leave",
      lastAction: "CHINMAYA BAIRY",
      status: "Approved",
    },
    {
      id: "ST00097",
      date: "27-05-2026",
      type: "Leave",
      lastAction: "CHINMAYA BAIRY",
      status: "Approved",
    },
    {
      id: "ST00098",
      date: "26-05-2026",
      type: "Leave",
      lastAction: "CHINMAYA BAIRY",
      status: "Approved",
    },
  ];

  const filteredData = mockData.filter(
    (row) =>
      row.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.lastAction.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs hover:shadow-xs transition-all min-h-[500px] flex flex-col justify-between relative">
      <div>
        {/* Filters Header */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-sm placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <button
            onClick={() => setIsDatePickerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          <button className="px-5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 cursor-pointer">
            Search
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-700">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 font-semibold text-gray-900">
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4">Request Type</th>
                <th className="py-3 px-4">Last Action Taken By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.id)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    {row.date}
                  </td>
                  <td className="py-3.5 px-4">{row.type}</td>
                  <td className="py-3.5 px-4">{row.lastAction}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-3 py-0.5 rounded-full">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No matching requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Date Picker Modal */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={(range) => setDateRange(range)}
      />

      {/* Footer Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6 mt-8 text-xs text-gray-500 font-medium">
        <span>Showing 1 to {filteredData.length} of 4 entries</span>

        {/* Entries select dropdown */}
        <div className="flex items-center gap-1.5">
          <span>Show</span>
          <div className="relative">
            <select
              value={showEntries}
              onChange={(e) => setShowEntries(Number(e.target.value))}
              className="appearance-none border border-gray-300 rounded-md bg-white pl-2.5 pr-8 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>entries</span>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-400">
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-400">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 bg-blue-50 border border-blue-200 text-blue-600 font-bold rounded-md flex items-center justify-center">
            1
          </button>
          <button className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-400">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-400">
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
