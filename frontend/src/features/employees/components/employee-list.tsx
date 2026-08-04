import React, { useState, useMemo } from "react";
import { SearchBox } from "@/components/ui/search-box";
import { Pagination } from "./pagination";
import { EmployeeTable } from "./employee-table";
import { OrganizationChart } from "./organization-chart";
import { MOCK_EMPLOYEES } from "../data/employees.data";
import { LayoutGrid, List } from "lucide-react";


export const EmployeeList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "chart">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // 1. Filter employees based on search term (name or code)
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return MOCK_EMPLOYEES;

    return MOCK_EMPLOYEES.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.employeeCode.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Reset to first page when search query changes to prevent empty page states
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 2. Paginate the filtered list
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* View Switcher / Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-1 gap-4">
        <div className="flex bg-slate-100 border border-slate-200/80 p-0.5 rounded-xl w-fit self-start shadow-2xs">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/40"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Employee List</span>
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "chart"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/40"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Organisation Chart</span>
          </button>
        </div>

        {/* Search Box (Only displayed on the List view) */}
        {activeTab === "list" && (
          <div className="w-full sm:w-80">
            <SearchBox
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name or employee code..."
            />
          </div>
        )}
      </div>

      {/* Main View Render */}
      <div className="w-full transition-all duration-300">
        {activeTab === "list" ? (
          <div className="flex flex-col gap-4">
            {/* Table Component */}
            <EmployeeTable employees={paginatedEmployees} />

            {/* Pagination Controls */}
            {filteredEmployees.length > 0 && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalRecords={filteredEmployees.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1); // Reset to first page on sizing change
                }}
              />
            )}
          </div>
        ) : (
          /* Organizational Chart View */
          <div className="w-full overflow-x-auto">
            <OrganizationChart employees={MOCK_EMPLOYEES} />
          </div>
        )}
      </div>
    </div>
  );
};
