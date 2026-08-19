import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Briefcase, 
  X, 
  Network,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Designation } from "../types/designation.types";
import { Department } from "../types/department.types";
import { getDesignations, createDesignation, updateDesignation, deleteDesignation } from "../api/designation.api";
import { getDepartments } from "../api/department.api";
import { DesignationFormModal } from "./DesignationFormModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/ui/search-box";

interface DesignationTabProps {
  onBack: () => void;
}

export const DesignationTab: React.FC<DesignationTabProps> = ({ onBack }) => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [viewingDesignation, setViewingDesignation] = useState<Designation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [desigData, deptData] = await Promise.all([
        getDesignations(),
        getDepartments()
      ]);
      setDesignations(desigData);
      setDepartments(deptData);
    } catch (err: any) {
      setError(err.message || "Failed to load designations.");
      toast.error("Error loading designation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: {
    designationName: string;
    designationCode: string;
    departmentId: number;
    remarks: string | null;
    status: boolean;
  }) => {
    if (editingDesignation) {
      // Update
      const res = await updateDesignation(editingDesignation.designationId, formData);
      if (res.success) {
        toast.success(res.message || "Designation updated successfully");
        setIsFormOpen(false);
        setEditingDesignation(null);
        fetchData();
      } else {
        toast.error(res.error || "Failed to update designation");
      }
    } else {
      // Create
      const res = await createDesignation(formData);
      if (res.success) {
        toast.success(res.message || "Designation created successfully");
        setIsFormOpen(false);
        fetchData();
      } else {
        toast.error(res.error || "Failed to create designation");
      }
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the designation "${name}"?`)) {
      try {
        const res = await deleteDesignation(id);
        if (res.success) {
          toast.success(res.message || "Designation deleted successfully");
          fetchData();
        } else {
          toast.error(res.error || "Failed to delete designation");
        }
      } catch (err: any) {
        toast.error("Error deleting designation: " + err.message);
      }
    }
  };

  const getDepartmentName = (deptId?: number) => {
    if (!deptId) return "Unassigned";
    const match = departments.find((d) => d.departmentId === deptId);
    return match ? `${match.departmentName} (${match.departmentCode})` : `Department #${deptId}`;
  };

  // Filtered list
  const filteredDesignations = designations.filter((desig) => {
    const query = searchQuery.toLowerCase();
    const matchesName = desig.designationName.toLowerCase().includes(query);
    const matchesCode = desig.designationCode.toLowerCase().includes(query);
    const deptName = getDepartmentName(desig.departmentId).toLowerCase();
    const matchesDept = deptName.includes(query);

    return matchesName || matchesCode || matchesDept;
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
            <span className="text-slate-900 font-bold">Designations</span>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              setEditingDesignation(null);
              setIsFormOpen(true);
            }}
            className="bg-brand-primary text-brand-btn-text hover:bg-brand-primary-hover font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Designation</span>
          </Button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-full max-w-xs">
            <SearchBox
              placeholder="Search designation or department..."
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total: <span className="font-extrabold text-brand-primary">{filteredDesignations.length}</span> designations
          </div>
        </div>

        {/* Data Table Container */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
            <div className="w-8 h-8 rounded-full border-3 border-brand-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">Loading designations...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 rounded-2xl border border-rose-200 p-8 text-center text-rose-700 text-xs font-semibold">
            {error}
          </div>
        ) : filteredDesignations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Designations Found</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {searchQuery ? "No designations matched your search query." : "Click 'Add Designation' above to create your first designation."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Designation Name</th>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Remarks</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredDesignations.map((desig) => (
                    <tr key={desig.designationId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <span>{desig.designationName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                        {desig.designationCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                          <Network className="w-3 h-3 text-brand-primary" />
                          <span>{desig.department?.departmentName || getDepartmentName(desig.departmentId)}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {desig.remarks || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {desig.status ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingDesignation(desig)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-primary hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingDesignation(desig);
                              setIsFormOpen(true);
                            }}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-primary hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(desig.designationId, desig.designationName)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Designation Create / Edit Modal */}
      <DesignationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDesignation(null);
        }}
        onSave={handleSave}
        designation={editingDesignation}
        departments={departments}
      />

      {/* Designation View Details Modal */}
      {viewingDesignation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{viewingDesignation.designationName}</h3>
                  <p className="text-xs font-mono font-bold text-slate-500">{viewingDesignation.designationCode}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDesignation(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Department:</span>
                  <span className="font-bold text-slate-900">
                    {viewingDesignation.department?.departmentName || getDepartmentName(viewingDesignation.departmentId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Status:</span>
                  <span className={`font-bold ${viewingDesignation.status ? "text-emerald-600" : "text-slate-500"}`}>
                    {viewingDesignation.status ? "Active" : "Inactive"}
                  </span>
                </div>
                {viewingDesignation.remarks && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500 font-semibold block mb-0.5">Remarks:</span>
                    <p className="text-slate-800 font-medium leading-relaxed">{viewingDesignation.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setViewingDesignation(null)}
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl px-5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
