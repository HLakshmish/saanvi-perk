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
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

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
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs hover:shadow-xs transition-all min-h-[500px] flex flex-col justify-between relative">
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
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 text-sm placeholder:text-slate-400 shadow-2xs"
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

          <button className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-sm rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer">
            Search
          </button>
        </div>

        {/* Data Table using Reusable Table Component */}
        <TableContainer>
          <Table className="min-w-[800px]">
            <TableHeader>
              <tr>
                <TableHead>Request Date</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Last Action Taken By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} onClick={() => onRowClick(row.id)}>
                  <TableCell className="font-semibold text-slate-900">
                    {row.date}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">{row.type}</TableCell>
                  <TableCell className="font-medium text-slate-700">{row.lastAction}</TableCell>
                  <TableCell>
                    <span className="inline-block text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-3 py-0.5 rounded-full">
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all inline-block" />
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No matching requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Custom Date Picker Modal */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={(range) => setDateRange(range)}
      />

      {/* Footer Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-8 text-xs text-slate-500 font-medium">
        <span>Showing 1 to {filteredData.length} of 4 entries</span>

        {/* Entries select dropdown */}
        <div className="flex items-center gap-1.5">
          <span>Show</span>
          <div className="relative">
            <select
              value={showEntries}
              onChange={(e) => setShowEntries(Number(e.target.value))}
              className="appearance-none border border-slate-300 rounded-lg bg-white pl-2.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>entries</span>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer">
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 bg-brand-primary border border-brand-primary text-white font-bold rounded-lg flex items-center justify-center text-xs shadow-xs">
            1
          </button>
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer">
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
