import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Building2, 
  X, 
  User
} from "lucide-react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../api/department.api";
import { Department } from "../types/department.types";
import { DepartmentFormModal } from "./DepartmentFormModal";
import { getEmployees } from "../../employees/api/employees.api";
import { Employee } from "../../employees/types/employees.types";
import { snackbar as toast } from "@/components/ui/snackbar";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/ui/search-box";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface DepartmentTabProps {
  onBack: () => void;
}

export const DepartmentTab: React.FC<DepartmentTabProps> = ({ onBack }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load departments and employees concurrently
      const [deptData, empData] = await Promise.all([
        getDepartments(),
        getEmployees()
      ]);
      setDepartments(deptData);
      setEmployees(empData);
    } catch (err: any) {
      setError(err.message || "Failed to load data from backend.");
      toast.error("Error loading department/employee data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: {
    departmentName: string;
    departmentCode: string;
    departmentHead: number | null;
    description: string | null;
    status: boolean;
  }) => {
    if (editingDepartment) {
      // Update
      const res = await updateDepartment(editingDepartment.departmentId, formData);
      if (res.success) {
        toast.success(res.message || "Department updated successfully");
        setIsFormOpen(false);
        setEditingDepartment(null);
        fetchData();
      } else {
        toast.error(res.error || "Failed to update department");
      }
    } else {
      // Create
      const res = await createDepartment(formData);
      if (res.success) {
        toast.success(res.message || "Department created successfully");
        setIsFormOpen(false);
        fetchData();
      } else {
        toast.error(res.error || "Failed to create department");
      }
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      try {
        const res = await deleteDepartment(id);
        if (res.success) {
          toast.success(res.message || "Department deleted successfully");
          fetchData();
        } else {
          toast.error(res.error || "Failed to delete department");
        }
      } catch (err: any) {
        toast.error("Error deleting department: " + err.message);
      }
    }
  };

  const getHeadEmployee = (headId?: number | null) => {
    if (!headId) return null;
    return employees.find(e => Number(e.id) === headId) || null;
  };

  // Filtered list
  const filteredDepartments = departments.filter((dept) => {
    const query = searchQuery.toLowerCase();
    const matchesName = dept.departmentName.toLowerCase().includes(query);
    const matchesCode = dept.departmentCode.toLowerCase().includes(query);
    
    let matchesHead = false;
    if (dept.departmentHead) {
      const head = getHeadEmployee(dept.departmentHead);
      if (head) {
        matchesHead = head.name.toLowerCase().includes(query);
      }
    }

    return matchesName || matchesCode || matchesHead;
  });

  return (
    <>
      <div className="space-y-6 animate-fade-in">
      {/* Top Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-brand-primary font-bold transition-colors cursor-pointer"
          >
            Organization
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Departments</span>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => {
            setEditingDepartment(null);
            setIsFormOpen(true);
          }}
          size="sm"
          className="h-9 text-xs rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Department</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <SearchBox
          placeholder="Search by name, code, or department head..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md"
        />
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 animate-fade-in">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-none">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20 font-mono" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 border border-red-100 rounded-2xl bg-red-50/20 text-center space-y-2">
          <p className="text-sm font-bold text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
          <p className="text-slate-500 text-sm font-semibold">
            {searchQuery ? "No departments match your search." : "No departments configured yet."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setEditingDepartment(null);
                setIsFormOpen(true);
              }}
              className="mt-3 inline-flex items-center gap-1 px-4 py-2 border border-brand-primary/20 hover:bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Configure First Department
            </button>
          )}
        </div>
      ) : (
        <TableContainer className="rounded-2xl border-none shadow-none">
          <Table className="min-w-[800px]">
            <TableHeader>
              <tr>
                <TableHead>Dept Code</TableHead>
                <TableHead>Dept Name</TableHead>
                <TableHead>Dept Head</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => {
                const head = getHeadEmployee(dept.departmentHead);
                return (
                  <TableRow key={dept.departmentId}>
                    {/* Dept Code */}
                    <TableCell className="font-mono font-bold text-slate-900">
                      {dept.departmentCode}
                    </TableCell>

                    {/* Dept Name */}
                    <TableCell className="font-semibold text-slate-900">
                      {dept.departmentName}
                    </TableCell>

                    {/* Dept Head */}
                    <TableCell>
                      {head ? (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 text-xs">{head.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{head.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-slate-500 font-medium max-w-xs truncate">
                      {dept.description || "-"}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {dept.status ? (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingDepartment(dept)}
                          title="View Details"
                          className="p-1.5 hover:bg-slate-100 hover:text-brand-primary text-slate-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingDepartment(dept);
                            setIsFormOpen(true);
                          }}
                          title="Edit"
                          className="p-1.5 hover:bg-slate-100 hover:text-brand-primary text-slate-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.departmentId, dept.departmentName)}
                          title="Delete"
                          className="p-1.5 hover:bg-slate-100 hover:text-red-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      </div>

      {/* Form Modal (Add / Edit) */}
      <DepartmentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDepartment(null);
        }}
        onSave={handleSave}
        department={editingDepartment}
        employees={employees}
      />

      {/* Read-Only Detail View Modal */}
      {viewingDepartment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-primary" />
                Department Details
              </h3>
              <button
                onClick={() => setViewingDepartment(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Department Name</span>
                  <p className="text-slate-900 text-sm font-bold">{viewingDepartment.departmentName}</p>
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Department Code</span>
                  <p className="text-slate-900 font-mono text-xs">{viewingDepartment.departmentCode}</p>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Status</span>
                  <div>
                    {viewingDepartment.status ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Head */}
                <div className="col-span-2 space-y-1 border-t border-slate-50 pt-3">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Department Head</span>
                  {getHeadEmployee(viewingDepartment.departmentHead) ? (
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{getHeadEmployee(viewingDepartment.departmentHead)?.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{getHeadEmployee(viewingDepartment.departmentHead)?.email}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs font-medium italic block mt-1">Unassigned</span>
                  )}
                </div>

                {/* Description */}
                <div className="col-span-2 space-y-1 border-t border-slate-50 pt-3">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Description</span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {viewingDepartment.description || "No description provided."}
                  </p>
                </div>

                {/* Dates */}
                {(viewingDepartment.createdAt || viewingDepartment.updatedAt) && (
                  <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-50 pt-3 text-[10px] text-slate-500 font-medium">
                    {viewingDepartment.createdAt && (
                      <div className="space-y-0.5">
                        <span>Created At</span>
                        <p className="font-semibold text-slate-700">
                          {new Date(viewingDepartment.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium"
                          })}
                        </p>
                      </div>
                    )}
                    {viewingDepartment.updatedAt && (
                      <div className="space-y-0.5">
                        <span>Last Updated</span>
                        <p className="font-semibold text-slate-700">
                          {new Date(viewingDepartment.updatedAt).toLocaleDateString(undefined, {
                            dateStyle: "medium"
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setViewingDepartment(null)}
                  className="h-9 text-xs rounded-xl px-5"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
