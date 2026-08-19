"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Plus, Trash2, Check, Loader2, ArrowLeft, X } from "lucide-react";
import {
  fetchLeaveTypes,
  createLeaveTypeApi,
  updateLeaveTypeApi,
  deleteLeaveTypeApi,
} from "../api/settings.api";

interface LeaveTypesDetailViewProps {
  onBack: () => void;
}

interface LeaveType {
  leaveTypeId: number;
  companyId: number;
  leaveCode: string;
  leaveName: string;
  remarks: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const EMPTY_LEAVE_TYPE = {
  leaveCode: "",
  leaveName: "",
  remarks: "",
  status: true,
};

export const LeaveTypesDetailView: React.FC<LeaveTypesDetailViewProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewState, setViewState] = useState<"read" | "edit" | "add">("read");

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveType | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formRemarks, setFormRemarks] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadLeaveTypes = async (selectId?: number) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetchLeaveTypes();
      if (res.success && res.data) {
        setLeaveTypes(res.data);
        if (res.data.length > 0) {
          // If a selectId is specified, try to find it, otherwise select the first item
          const toSelect = selectId 
            ? res.data.find((item: LeaveType) => item.leaveTypeId === selectId) || res.data[0]
            : res.data[0];
          setSelectedLeave(toSelect);
          populateForm(toSelect);
        } else {
          setSelectedLeave(null);
        }
      }
    } catch (err: any) {
      setErrorMsg("Failed to load leave types.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const populateForm = (leave: LeaveType) => {
    setFormName(leave.leaveName || "");
    setFormCode(leave.leaveCode || "");
    setFormRemarks(leave.remarks || "");
    setFormStatus(leave.status !== undefined ? leave.status : true);
  };

  const handleSelectLeave = (leave: LeaveType) => {
    if (viewState !== "read") {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setSelectedLeave(leave);
    populateForm(leave);
    setViewState("read");
    setErrorMsg("");
  };

  const handleStartAdd = () => {
    setViewState("add");
    setFormName("");
    setFormCode("");
    setFormRemarks("");
    setFormStatus(true);
    setErrorMsg("");
  };

  const handleStartEdit = () => {
    if (!selectedLeave) return;
    setViewState("edit");
    populateForm(selectedLeave);
    setErrorMsg("");
  };

  const handleCancel = () => {
    if (viewState === "edit" && selectedLeave) {
      populateForm(selectedLeave);
    }
    setViewState("read");
    setErrorMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setErrorMsg("Leave Name and Leave Code are required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccessMsg("");

    const payload = {
      leaveName: formName.trim(),
      leaveCode: formCode.trim(),
      remarks: formRemarks.trim(),
      status: formStatus,
    };

    try {
      if (viewState === "add") {
        const res = await createLeaveTypeApi(payload);
        if (res.success && res.data) {
          setSaveSuccessMsg("Leave type created successfully!");
          setViewState("read");
          await loadLeaveTypes(res.data.leaveTypeId);
        } else {
          throw new Error(res.error || "Failed to create leave type.");
        }
      } else if (viewState === "edit" && selectedLeave) {
        const res = await updateLeaveTypeApi(selectedLeave.leaveTypeId, payload);
        if (res.success && res.data) {
          setSaveSuccessMsg("Leave type updated successfully!");
          setViewState("read");
          await loadLeaveTypes(selectedLeave.leaveTypeId);
        } else {
          throw new Error(res.error || "Failed to update leave type.");
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
    if (!confirm("Are you sure you want to delete this leave type?")) return;

    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const res = await deleteLeaveTypeApi(id);
      if (res.success) {
        setSaveSuccessMsg("Leave type deleted successfully!");
        // Select another item if the deleted one was selected
        const updatedList = leaveTypes.filter((item) => item.leaveTypeId !== id);
        setLeaveTypes(updatedList);
        if (selectedLeave?.leaveTypeId === id) {
          if (updatedList.length > 0) {
            setSelectedLeave(updatedList[0]);
            populateForm(updatedList[0]);
          } else {
            setSelectedLeave(null);
          }
        }
      } else {
        throw new Error(res.error || "Failed to delete leave type.");
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while deleting.");
    }
  };

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
          <span className="text-slate-900 font-bold">Leave Types</span>
        </div>

        {/* Add Leave Button */}
        {viewState === "read" && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Leave</span>
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
        {/* Left Side: List of Leave Types */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              List of Leave Types
            </h3>
          </div>

          {/* List Content */}
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Loading...</span>
              </div>
            ) : leaveTypes.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">
                No leave types configured
              </p>
            ) : (
              leaveTypes.map((leave) => {
                const isSelected = selectedLeave?.leaveTypeId === leave.leaveTypeId;
                return (
                  <div
                    key={leave.leaveTypeId}
                    onClick={() => handleSelectLeave(leave)}
                    className={`group w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <span>{leave.leaveName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, leave.leaveTypeId)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all"
                        title="Delete Leave Type"
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

        {/* Right Side: Leave Details or Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 relative min-h-[300px]">
          {viewState === "read" ? (
            selectedLeave ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {selectedLeave.leaveName}
                  </h3>
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-[#012d28] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                  {/* Leave Name */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Leave Name
                    </span>
                    <p className="font-bold text-slate-800 text-sm">{selectedLeave.leaveName}</p>
                  </div>

                  {/* Leave Code */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Leave Code
                    </span>
                    <p className="font-mono font-bold text-slate-800 text-sm">{selectedLeave.leaveCode}</p>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Remarks
                    </span>
                    <p className="font-semibold text-slate-600 leading-relaxed">
                      {selectedLeave.remarks || "-"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Status
                    </span>
                    <p className="font-semibold text-sm">
                      {selectedLeave.status ? (
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
                No leave types selected. Click "+ Add New Leave" to configure one.
              </div>
            )
          ) : (
            // Add or Edit Form
            <form onSubmit={handleSave} className="space-y-6">
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {viewState === "add" ? "Add New Leave Type" : "Edit Leave Type"}
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
                    Save
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                {/* Leave Name Input */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Leave Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sick Leave / Casual Leave"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Leave Code Input */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Leave Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. SL+CL"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Remarks Input */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Remarks
                  </label>
                  <textarea
                    rows={4}
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="Enter description or rules regarding this leave type..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Status Toggle Checkbox */}
                <div className="space-y-2 md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="leaveTypeStatus"
                    checked={formStatus}
                    onChange={(e) => setFormStatus(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="leaveTypeStatus" className="text-slate-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer">
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
