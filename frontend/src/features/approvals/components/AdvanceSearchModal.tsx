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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-5xl overflow-hidden flex flex-col relative animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Advance Employee Search
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Main Search Input */}
          <div className="relative shadow-2xs rounded-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or code"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Grid of Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {/* Organization */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Organization
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Organization - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Locations
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Locations - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Department
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Department - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Designation
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Designation - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status (Highlighted) */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Status
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-indigo-200 bg-indigo-50/50 rounded-xl px-3 py-2 text-xs text-indigo-705 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer pr-8 shadow-2xs">
                  <option>Status - 1</option>
                </select>
                <ChevronDown className="w-4 h-4 text-indigo-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Group */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Group
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Group - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sub Group */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sub Group
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Sub Group - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Category
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Category - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grade */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Grade
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Grade - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Additional Field */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Additional Field
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Additional Field - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field Value */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Field Value
              </span>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer pr-8 font-medium shadow-2xs">
                  <option>Field Value - 0</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Records per page & Search button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Records per page :</span>
              <div className="relative">
                <select className="appearance-none border border-slate-300 rounded-lg bg-white pl-2.5 pr-7 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs">
                  <option>25</option>
                  <option>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 cursor-pointer">
              Search
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Lower half grid (All employees vs recent/saved search) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold text-left">
            {/* All employees option */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-bold text-slate-800">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500"
                />
                <span>All Employees</span>
              </label>
            </div>

            {/* Recent Searches panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-6 border-b border-slate-150 pb-2">
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`pb-2 font-bold transition-colors relative cursor-pointer ${
                    activeTab === "recent"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Recent Search
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`pb-2 font-bold transition-colors relative cursor-pointer ${
                    activeTab === "saved"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Saved Search
                </button>
              </div>

              <div className="py-6 text-center text-slate-400 font-semibold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                {activeTab === "recent"
                  ? "Your Recent Search will appear here"
                  : "No Saved Searches"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50/50 border-t border-slate-100">
          <button className="px-5 py-2 border border-slate-300 bg-white rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer">
            Clear All
          </button>
          <button className="px-5 py-2 border border-slate-300 bg-white rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer">
            Save Search
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
