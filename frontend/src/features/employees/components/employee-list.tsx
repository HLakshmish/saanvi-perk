import React, { useState, useMemo, useEffect } from "react";
import { SearchBox } from "@/components/ui/search-box";
import { Pagination } from "./pagination";
import { EmployeeTable } from "./employee-table";
import { OrganizationChart } from "./organization-chart";
import { Employee } from "../types/employees.types";
import { getEmployees, deleteUser } from "../api/employees.api";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { EmployeeDetailsModal } from "./employee-details-modal";
import { EmployeeEditModal } from "./employee-edit-modal";

interface EmployeeListProps {
  currentUserName?: string;
  currentCompanyName?: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  currentUserName,
  currentCompanyName,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "chart">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal triggers
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 1. Filter employees based on search term (name or code)
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return employees;

    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.employeeCode.toLowerCase().includes(term)
    );
  }, [searchTerm, employees]);

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

  // Action handlers
  const handleView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsViewOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to delete employee ${emp.name} (${emp.employeeCode})? This will permanently erase their credentials and files.`)) {
      return;
    }
    try {
      const res = await deleteUser(Number(emp.id));
      if (res.success) {
        alert("Employee deleted successfully.");
        await fetchEmployees();
      } else {
        alert(res.error || "Failed to delete employee user profile.");
      }
    } catch (err) {
      alert("Failed to delete employee profile.");
    }
  };

  const handleEditSuccess = async () => {
    await fetchEmployees();
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-slate-500 text-xs font-semibold">Loading employee directory...</span>
      </div>
    );
  }

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
            <EmployeeTable
              employees={paginatedEmployees}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

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
            <OrganizationChart
              employees={employees}
              currentUserName={currentUserName}
              currentCompanyName={currentCompanyName}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedEmployee && (
        <>
          <EmployeeDetailsModal
            isOpen={isViewOpen}
            onClose={() => {
              setIsViewOpen(false);
              setSelectedEmployee(null);
            }}
            employeeId={Number(selectedEmployee.id)}
            employeeName={selectedEmployee.name}
          />
          <EmployeeEditModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedEmployee(null);
            }}
            onSuccess={handleEditSuccess}
            employeeId={Number(selectedEmployee.id)}
            employeeName={selectedEmployee.name}
          />
        </>
      )}
    </div>
  );
};
