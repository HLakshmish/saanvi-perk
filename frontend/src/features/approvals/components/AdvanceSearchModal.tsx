"use client";

import React, { useState } from "react";
import { X, Search, ChevronDown } from "lucide-react";

interface AdvanceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvanceSearchModal: React.FC<AdvanceSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"recent" | "saved">("recent");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col relative animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-150">
          <h2 className="text-base font-bold text-gray-900">
            Advance Employee Search
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or code"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
            />
          </div>

          {/* Grid of Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Organization */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Organization
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Organization - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Locations
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Locations - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Department
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Department - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Designation
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Designation - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status (Highlighted) */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-blue-200 bg-blue-50/50 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Status - 1</option>
                </select>
                <ChevronDown className="w-4 h-4 text-blue-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Group */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Group
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Group - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sub Group */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Sub Group
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Sub Group - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Category - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grade */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Grade
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Grade - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Additional Field */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Additional Field
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Additional Field - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field Value */}
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Field Value
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pr-8">
                  <option>Field Value - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Records per page & Search button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span>Records per page :</span>
              <div className="relative">
                <select className="appearance-none border border-gray-300 rounded bg-white pl-2.5 pr-7 py-1 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer">
                  <option>25</option>
                  <option>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-2xs transition-colors">
              Search
            </button>
          </div>

          <hr className="border-gray-150" />

          {/* Lower half grid (All employees vs recent/saved search) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700 font-medium text-left">
            {/* All employees option */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>All Employees</span>
              </label>
            </div>

            {/* Recent Searches panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-6 border-b border-gray-100 pb-2">
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`pb-2 font-bold transition-colors relative ${
                    activeTab === "recent"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Recent Search
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`pb-2 font-bold transition-colors relative ${
                    activeTab === "saved"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Saved Search
                </button>
              </div>

              <div className="py-6 text-center text-gray-400 font-medium bg-slate-50 rounded-lg border border-dashed border-gray-250">
                {activeTab === "recent"
                  ? "Your Recent Search will appear here"
                  : "No Saved Searches"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50/50 border-t border-gray-150">
          <button className="px-5 py-2 border border-gray-300 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer">
            Clear All
          </button>
          <button className="px-5 py-2 border border-gray-300 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer">
            Save Search
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
