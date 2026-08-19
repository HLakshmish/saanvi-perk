"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Plus, Trash2, Check, Loader2, ArrowLeft, X, Search } from "lucide-react";
import {
  fetchCompOffAssignments,
  createCompOffAssignmentApi,
  updateCompOffAssignmentApi,
  deleteCompOffAssignmentApi,
  fetchCompOffPolicies,
} from "../api/settings.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";

interface AssignCompOffPolicyDetailViewProps {
  onBack: () => void;
}

interface CompOffAssignment {
  id: number;
  companyId: number;
  userId: number;
  policyId: number;
  startDate: string;
  endDate: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CompOffPolicy {
  id: number;
  policyName: string;
}

export const AssignCompOffPolicyDetailView: React.FC<AssignCompOffPolicyDetailViewProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewState, setViewState] = useState<"read" | "edit" | "add">("read");

  const [assignments, setAssignments] = useState<CompOffAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<CompOffAssignment | null>(null);

  // References
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [policies, setPolicies] = useState<CompOffPolicy[]>([]);

  // Form State
  const [formSelectedUserIds, setFormSelectedUserIds] = useState<number[]>([]);
  const [formSingleUserId, setFormSingleUserId] = useState<number | null>(null); // For edit mode
  const [formPolicyId, setFormPolicyId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStatus, setFormStatus] = useState(true);

  // Filters / Search
  const [empSearchQuery, setEmpSearchQuery] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async (selectId?: number) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [assignmentsRes, policiesRes, employeesList] = await Promise.all([
        fetchCompOffAssignments(),
        fetchCompOffPolicies(),
        getEmployees(),
      ]);

      if (employeesList) setEmployees(employeesList);
      if (policiesRes.success && Array.isArray(policiesRes.data)) setPolicies(policiesRes.data);

      if (assignmentsRes.success && assignmentsRes.data) {
        setAssignments(assignmentsRes.data);
        if (assignmentsRes.data.length > 0) {
          const toSelect = selectId
            ? assignmentsRes.data.find((item: CompOffAssignment) => item.id === selectId) || assignmentsRes.data[0]
            : assignmentsRes.data[0];
          setSelectedAssignment(toSelect);
          populateForm(toSelect);
        } else {
          setSelectedAssignment(null);
        }
      }
    } catch (err: any) {
      setErrorMsg("Failed to load assignments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateForm = (assign: CompOffAssignment) => {
    setFormSingleUserId(assign.userId);
    setFormPolicyId(String(assign.policyId));
    setFormStartDate(assign.startDate ? assign.startDate.split("T")[0] : "");
    setFormEndDate(assign.endDate ? assign.endDate.split("T")[0] : "");
    setFormStatus(assign.status !== undefined ? assign.status : true);
  };

  const handleSelectAssignment = (assign: CompOffAssignment) => {
    if (viewState !== "read") {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setSelectedAssignment(assign);
    populateForm(assign);
    setViewState("read");
    setErrorMsg("");
  };

  const handleStartAdd = () => {
    setViewState("add");
    setFormSelectedUserIds([]);
    setFormSingleUserId(null);
    setFormPolicyId(policies[0]?.id ? String(policies[0].id) : "");
    
    const todayStr = new Date().toISOString().split("T")[0];
    setFormStartDate(todayStr);
    
    // Default end date is 1 year from now
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormEndDate(nextYear.toISOString().split("T")[0]);
    
    setFormStatus(true);
    setEmpSearchQuery("");
    setErrorMsg("");
  };

  const handleStartEdit = () => {
    if (!selectedAssignment) return;
    setViewState("edit");
    populateForm(selectedAssignment);
    setErrorMsg("");
  };

  const handleCancel = () => {
    if (viewState === "edit" && selectedAssignment) {
      populateForm(selectedAssignment);
    }
    setViewState("read");
    setErrorMsg("");
  };

  const formatDateToISO = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00Z").toISOString();
  };

  const handleToggleUserSelect = (userId: number) => {
    setFormSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllFiltered = (filteredIds: number[]) => {
    const allSelected = filteredIds.every((id) => formSelectedUserIds.includes(id));
    if (allSelected) {
      setFormSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setFormSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (viewState === "add" && formSelectedUserIds.length === 0) {
      setErrorMsg("Please select at least one Employee.");
      return;
    }
    if (!formPolicyId) {
      setErrorMsg("Please select a Comp-off Policy.");
      return;
    }
    if (!formStartDate || !formEndDate) {
      setErrorMsg("Start Date and End Date are required.");
      return;
    }
    if (new Date(formStartDate) > new Date(formEndDate)) {
      setErrorMsg("Start Date cannot be after End Date.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      if (viewState === "add") {
        const payload = {
          userIds: formSelectedUserIds,
          policyId: Number(formPolicyId),
          startDate: formatDateToISO(formStartDate),
          endDate: formatDateToISO(formEndDate),
          status: formStatus,
        };

        const res = await createCompOffAssignmentApi(payload);
        if (res.success) {
          setSaveSuccessMsg(`Successfully assigned policy to ${res.count || formSelectedUserIds.length} employees!`);
          setViewState("read");
          await loadData();
        } else {
          throw new Error(res.error || "Failed to assign policy.");
        }
      } else if (viewState === "edit" && selectedAssignment) {
        const payload = {
          policyId: Number(formPolicyId),
          startDate: formatDateToISO(formStartDate),
          endDate: formatDateToISO(formEndDate),
          status: formStatus,
        };

        const res = await updateCompOffAssignmentApi(selectedAssignment.id, payload);
        if (res.success && res.data) {
          setSaveSuccessMsg("Assignment updated successfully!");
          setViewState("read");
          await loadData(selectedAssignment.id);
        } else {
          throw new Error(res.error || "Failed to update assignment.");
        }
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const res = await deleteCompOffAssignmentApi(id);
      if (res.success) {
        setSaveSuccessMsg("Assignment deleted successfully!");
        const updatedList = assignments.filter((item) => item.id !== id);
        setAssignments(updatedList);
        if (selectedAssignment?.id === id) {
          if (updatedList.length > 0) {
            setSelectedAssignment(updatedList[0]);
            populateForm(updatedList[0]);
          } else {
            setSelectedAssignment(null);
          }
        }
      } else {
        throw new Error(res.error || "Failed to delete assignment.");
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while deleting.");
    }
  };

  // Lookups
  const getEmployeeName = (uId: number) => {
    const emp = employees.find((e) => String(e.id) === String(uId));
    return emp ? `${emp.name} (${emp.employeeCode})` : `Employee ID: ${uId}`;
  };

  const getPolicyName = (pId: number) => {
    const policy = policies.find((p) => p.id === pId);
    return policy ? policy.policyName : `Policy ID: ${pId}`;
  };

  // Filtered employees for checklist in add mode
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(empSearchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(empSearchQuery.toLowerCase())
  );
  const filteredEmpIds = filteredEmployees.map((e) => Number(e.id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Breadcrumb & Add Button */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-primary font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leave</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Assign Comp-off Policy</span>
        </div>

        {/* Add Assignment Button */}
        {viewState === "read" && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Policy</span>
          </button>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <X className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left List Column + Right Form/Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: List of Assignments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Log
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Loading...</span>
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">
                No active policy assignments
              </p>
            ) : (
              assignments.map((assign) => {
                const isSelected = selectedAssignment?.id === assign.id;
                const empName = employees.find((e) => String(e.id) === String(assign.userId))?.name || `Employee #${assign.userId}`;
                return (
                  <div
                    key={assign.id}
                    onClick={() => handleSelectAssignment(assign)}
                    className={`group w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate max-w-[150px]">{empName}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{getPolicyName(assign.policyId)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, assign.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-brand-primary translate-x-0.5" : "text-slate-400"}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Assignment Details or Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 relative min-h-[350px]">
          {viewState === "read" ? (
            selectedAssignment ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Assignment details
                  </h3>
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Assignment</span>
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Employee
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {getEmployeeName(selectedAssignment.userId)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Comp-off Policy
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {getPolicyName(selectedAssignment.policyId)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Effective From
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedAssignment.startDate ? new Date(selectedAssignment.startDate).toLocaleDateString() : "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Effective To
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedAssignment.endDate ? new Date(selectedAssignment.endDate).toLocaleDateString() : "-"}
                    </p>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Status
                    </span>
                    <p className="font-semibold text-sm">
                      {selectedAssignment.status ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md text-[10px]">Active</span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200/50 px-2 py-0.5 rounded-md text-[10px]">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-xs text-slate-400 font-semibold">
                No assignment selected. Click "Assign Policy" to create a new assignment.
              </div>
            )
          ) : (
            // Add or Edit Form
            <form onSubmit={handleSave} className="space-y-6">
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {viewState === "add" ? "Assign Policy to Employee(s)" : "Edit Assignment"}
                </h3>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-btn-text" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save Assignment
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs max-h-[550px] overflow-y-auto pr-2">
                {/* Employee Selection */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-brand-primary font-bold uppercase text-[10px] tracking-wider block">
                    Employee(s) <span className="text-rose-500">*</span>
                  </label>
                  
                  {viewState === "edit" ? (
                    <div className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 font-bold text-slate-700 text-sm">
                      {formSingleUserId ? getEmployeeName(formSingleUserId) : "-"}
                    </div>
                  ) : (
                    <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      {/* Search employee input */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                        <input
                          type="text"
                          value={empSearchQuery}
                          onChange={(e) => setEmpSearchQuery(e.target.value)}
                          placeholder="Search employee by name or code..."
                          className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary bg-white text-xs"
                        />
                      </div>

                      {/* Bulk actions */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-2">
                        <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
                        <button
                          type="button"
                          onClick={() => handleSelectAllFiltered(filteredEmpIds)}
                          className="text-brand-primary hover:underline cursor-pointer"
                        >
                          {filteredEmpIds.every((id) => formSelectedUserIds.includes(id)) ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      {/* Checkbox list */}
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {filteredEmployees.length === 0 ? (
                          <p className="text-slate-400 font-semibold py-2">No employees match your search.</p>
                        ) : (
                          filteredEmployees.map((emp) => {
                            const empId = Number(emp.id);
                            const isChecked = formSelectedUserIds.includes(empId);
                            return (
                              <label
                                key={emp.id}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary font-bold"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleUserSelect(empId)}
                                  className="w-3.5 h-3.5 rounded-sm text-brand-primary focus:ring-brand-primary"
                                />
                                <span>{emp.name} ({emp.employeeCode})</span>
                              </label>
                            );
                          })
                        )}
                      </div>

                      {/* Selected counter pill */}
                      <div className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                        <span>Selected Count:</span>
                        <span className="bg-brand-primary text-brand-btn-text px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {formSelectedUserIds.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Policy Selection */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Comp-off Policy <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formPolicyId}
                    onChange={(e) => setFormPolicyId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary bg-white"
                  >
                    <option value="">-- Select Comp-off Policy --</option>
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.policyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Effective From Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Effective To Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Status Toggle */}
                <div className="space-y-2 md:col-span-2 flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="assignStatus"
                    checked={formStatus}
                    onChange={(e) => setFormStatus(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="assignStatus" className="text-slate-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                    Active / Status
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
