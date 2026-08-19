import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { SearchBox } from "@/components/ui/search-box";
import { toast } from "sonner";
import { Pagination } from "./pagination";
import { EmployeeTable } from "./employee-table";
import { OrganizationChart } from "./organization-chart";
import { Employee } from "../types/employees.types";
import { getEmployees, deleteUser } from "../api/employees.api";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeEditModal } from "./employee-edit-modal";

interface EmployeeListProps {
  currentUserName?: string;
  currentCompanyName?: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  currentUserName,
  currentCompanyName,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"list" | "chart">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal triggers
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
  const handleRowClick = (emp: Employee) => {
    router.push(`/employee/${emp.id}`);
  };

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const handleDelete = (emp: Employee) => {
    setEmployeeToDelete(emp);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    const emp = employeeToDelete;
    setIsDeleteConfirmOpen(false);
    setEmployeeToDelete(null);

    try {
      const res = await deleteUser(Number(emp.id));
      if (res.success) {
        toast.success("Employee deleted successfully.");
        await fetchEmployees();
      } else {
        toast.error(res.error || "Failed to delete employee user profile.");
      }
    } catch (err) {
      toast.error("Failed to delete employee profile.");
    }
  };

  const handleEditSuccess = async () => {
    await fetchEmployees();
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4 animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-none">
            <div className="flex items-center gap-3 w-56">
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="space-y-1.5 w-full">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        ))}
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
                ? "bg-brand-primary text-white shadow-2xs border border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Employee List</span>
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "chart"
                ? "bg-brand-primary text-white shadow-2xs border border-brand-primary"
                : "text-slate-500 hover:text-brand-primary"
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
              onRowClick={handleRowClick}
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
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && employeeToDelete && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200/80 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Delete Employee</h3>
              <p className="text-sm text-slate-500 font-medium">
                Are you sure you want to delete employee <span className="font-semibold text-slate-800">{employeeToDelete.name} ({employeeToDelete.employeeCode})</span>? This will permanently erase their credentials and files.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setEmployeeToDelete(null);
                }}
                className="px-4.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-750 rounded-xl shadow-xs transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
