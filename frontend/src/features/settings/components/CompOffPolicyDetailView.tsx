"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Plus, Trash2, Check, Loader2, ArrowLeft, X } from "lucide-react";
import {
  fetchCompOffPolicies,
  createCompOffPolicyApi,
  updateCompOffPolicyApi,
  deleteCompOffPolicyApi,
  fetchLeaveTypes,
} from "../api/settings.api";

interface CompOffPolicyDetailViewProps {
  onBack: () => void;
}

interface CompOffPolicy {
  id: number;
  companyId: number;
  policyName: string;
  leaveTypeId: number;
  weekOffWorked: boolean;
  holidayWorked: boolean;
  otHoursEnabled: boolean;
  otFullDayHours: number | null;
  otFullDayMinutes: number | null;
  otHalfDayHours: number | null;
  otHalfDayMinutes: number | null;
  regularHoursEnabled: boolean;
  regularFullDayHours: number | null;
  regularFullDayMinutes: number | null;
  regularHalfDayHours: number | null;
  regularHalfDayMinutes: number | null;
  availabilityType: string;
  availabilityDays: number | null;
  accumulationType: string;
  requestRequired: boolean;
  requestDeadlineType: string | null;
  requestWithinDays: number | null;
  maxRequestsPerMonth: number | null;
  maxRequestsPerYear: number | null;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LeaveType {
  leaveTypeId: number;
  leaveName: string;
  leaveCode: string;
}

export const CompOffPolicyDetailView: React.FC<CompOffPolicyDetailViewProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewState, setViewState] = useState<"read" | "edit" | "add">("read");

  const [policies, setPolicies] = useState<CompOffPolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<CompOffPolicy | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  // Form State
  const [formName, setFormName] = useState("");
  const [formLeaveTypeId, setFormLeaveTypeId] = useState("");
  const [formWeekOffWorked, setFormWeekOffWorked] = useState(false);
  const [formHolidayWorked, setFormHolidayWorked] = useState(false);
  const [formOtHoursEnabled, setFormOtHoursEnabled] = useState(false);
  const [formOtFullHours, setFormOtFullHours] = useState("");
  const [formOtFullMinutes, setFormOtFullMinutes] = useState("");
  const [formOtHalfHours, setFormOtHalfHours] = useState("");
  const [formOtHalfMinutes, setFormOtHalfMinutes] = useState("");
  
  const [formRegularHoursEnabled, setFormRegularHoursEnabled] = useState(false);
  const [formRegFullHours, setFormRegFullHours] = useState("");
  const [formRegFullMinutes, setFormRegFullMinutes] = useState("");
  const [formRegHalfHours, setFormRegHalfHours] = useState("");
  const [formRegHalfMinutes, setFormRegHalfMinutes] = useState("");

  const [formAvailabilityType, setFormAvailabilityType] = useState("DAYS");
  const [formAvailabilityDays, setFormAvailabilityDays] = useState("");
  const [formAccumulationType, setFormAccumulationType] = useState("ADD");
  
  const [formRequestRequired, setFormRequestRequired] = useState(false);
  const [formRequestDeadlineType, setFormRequestDeadlineType] = useState("");
  const [formRequestWithinDays, setFormRequestWithinDays] = useState("");
  const [formMaxReqMonth, setFormMaxReqMonth] = useState("");
  const [formMaxReqYear, setFormMaxReqYear] = useState("");
  
  const [formStatus, setFormStatus] = useState(true);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async (selectId?: number) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [policiesRes, typesRes] = await Promise.all([
        fetchCompOffPolicies(),
        fetchLeaveTypes(),
      ]);

      if (typesRes.success && Array.isArray(typesRes.data)) {
        setLeaveTypes(typesRes.data);
      }

      if (policiesRes.success && policiesRes.data) {
        setPolicies(policiesRes.data);
        if (policiesRes.data.length > 0) {
          const toSelect = selectId
            ? policiesRes.data.find((item: CompOffPolicy) => item.id === selectId) || policiesRes.data[0]
            : policiesRes.data[0];
          setSelectedPolicy(toSelect);
          populateForm(toSelect);
        } else {
          setSelectedPolicy(null);
        }
      }
    } catch (err: any) {
      setErrorMsg("Failed to load compensatory off policies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateForm = (policy: CompOffPolicy) => {
    setFormName(policy.policyName || "");
    setFormLeaveTypeId(policy.leaveTypeId ? String(policy.leaveTypeId) : "");
    setFormWeekOffWorked(!!policy.weekOffWorked);
    setFormHolidayWorked(!!policy.holidayWorked);
    
    setFormOtHoursEnabled(!!policy.otHoursEnabled);
    setFormOtFullHours(policy.otFullDayHours !== null && policy.otFullDayHours !== undefined ? String(policy.otFullDayHours) : "");
    setFormOtFullMinutes(policy.otFullDayMinutes !== null && policy.otFullDayMinutes !== undefined ? String(policy.otFullDayMinutes) : "");
    setFormOtHalfHours(policy.otHalfDayHours !== null && policy.otHalfDayHours !== undefined ? String(policy.otHalfDayHours) : "");
    setFormOtHalfMinutes(policy.otHalfDayMinutes !== null && policy.otHalfDayMinutes !== undefined ? String(policy.otHalfDayMinutes) : "");

    setFormRegularHoursEnabled(!!policy.regularHoursEnabled);
    setFormRegFullHours(policy.regularFullDayHours !== null && policy.regularFullDayHours !== undefined ? String(policy.regularFullDayHours) : "");
    setFormRegFullMinutes(policy.regularFullDayMinutes !== null && policy.regularFullDayMinutes !== undefined ? String(policy.regularFullDayMinutes) : "");
    setFormRegHalfHours(policy.regularHalfDayHours !== null && policy.regularHalfDayHours !== undefined ? String(policy.regularHalfDayHours) : "");
    setFormRegHalfMinutes(policy.regularHalfDayMinutes !== null && policy.regularHalfDayMinutes !== undefined ? String(policy.regularHalfDayMinutes) : "");

    setFormAvailabilityType(policy.availabilityType || "DAYS");
    setFormAvailabilityDays(policy.availabilityDays !== null && policy.availabilityDays !== undefined ? String(policy.availabilityDays) : "");
    setFormAccumulationType(policy.accumulationType || "ADD");

    setFormRequestRequired(!!policy.requestRequired);
    setFormRequestDeadlineType(policy.requestDeadlineType || "");
    setFormRequestWithinDays(policy.requestWithinDays !== null && policy.requestWithinDays !== undefined ? String(policy.requestWithinDays) : "");
    setFormMaxReqMonth(policy.maxRequestsPerMonth !== null && policy.maxRequestsPerMonth !== undefined ? String(policy.maxRequestsPerMonth) : "");
    setFormMaxReqYear(policy.maxRequestsPerYear !== null && policy.maxRequestsPerYear !== undefined ? String(policy.maxRequestsPerYear) : "");

    setFormStatus(policy.status !== undefined ? policy.status : true);
  };

  const handleSelectPolicy = (policy: CompOffPolicy) => {
    if (viewState !== "read") {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setSelectedPolicy(policy);
    populateForm(policy);
    setViewState("read");
    setErrorMsg("");
  };

  const handleStartAdd = () => {
    setViewState("add");
    setFormName("");
    setFormLeaveTypeId("");
    setFormWeekOffWorked(false);
    setFormHolidayWorked(false);
    setFormOtHoursEnabled(false);
    setFormOtFullHours("");
    setFormOtFullMinutes("");
    setFormOtHalfHours("");
    setFormOtHalfMinutes("");
    setFormRegularHoursEnabled(false);
    setFormRegFullHours("");
    setFormRegFullMinutes("");
    setFormRegHalfHours("");
    setFormRegHalfMinutes("");
    setFormAvailabilityType("DAYS");
    setFormAvailabilityDays("");
    setFormAccumulationType("ADD");
    setFormRequestRequired(false);
    setFormRequestDeadlineType("");
    setFormRequestWithinDays("");
    setFormMaxReqMonth("");
    setFormMaxReqYear("");
    setFormStatus(true);
    setErrorMsg("");
  };

  const handleStartEdit = () => {
    if (!selectedPolicy) return;
    setViewState("edit");
    populateForm(selectedPolicy);
    setErrorMsg("");
  };

  const handleCancel = () => {
    if (viewState === "edit" && selectedPolicy) {
      populateForm(selectedPolicy);
    }
    setViewState("read");
    setErrorMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      setErrorMsg("Policy Name is required.");
      return;
    }
    if (!formLeaveTypeId) {
      setErrorMsg("Leave Type mapping is required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccessMsg("");

    const payload = {
      policyName: formName.trim(),
      leaveTypeId: Number(formLeaveTypeId),
      weekOffWorked: formWeekOffWorked,
      holidayWorked: formHolidayWorked,
      
      otHoursEnabled: formOtHoursEnabled,
      otFullDayHours: formOtHoursEnabled && formOtFullHours ? Number(formOtFullHours) : null,
      otFullDayMinutes: formOtHoursEnabled && formOtFullMinutes ? Number(formOtFullMinutes) : null,
      otHalfDayHours: formOtHoursEnabled && formOtHalfHours ? Number(formOtHalfHours) : null,
      otHalfDayMinutes: formOtHoursEnabled && formOtHalfMinutes ? Number(formOtHalfMinutes) : null,

      regularHoursEnabled: formRegularHoursEnabled,
      regularFullDayHours: formRegularHoursEnabled && formRegFullHours ? Number(formRegFullHours) : null,
      regularFullDayMinutes: formRegularHoursEnabled && formRegFullMinutes ? Number(formRegFullMinutes) : null,
      regularHalfDayHours: formRegularHoursEnabled && formRegHalfHours ? Number(formRegHalfHours) : null,
      regularHalfDayMinutes: formRegularHoursEnabled && formRegHalfMinutes ? Number(formRegHalfMinutes) : null,

      availabilityType: formAvailabilityType,
      availabilityDays: formAvailabilityType === "DAYS" && formAvailabilityDays ? Number(formAvailabilityDays) : null,
      accumulationType: formAccumulationType,

      requestRequired: formRequestRequired,
      requestDeadlineType: formRequestRequired && formRequestDeadlineType ? formRequestDeadlineType : null,
      requestWithinDays: formRequestRequired && formRequestWithinDays ? Number(formRequestWithinDays) : null,
      maxRequestsPerMonth: formMaxReqMonth ? Number(formMaxReqMonth) : null,
      maxRequestsPerYear: formMaxReqYear ? Number(formMaxReqYear) : null,

      status: formStatus,
    };

    try {
      if (viewState === "add") {
        const res = await createCompOffPolicyApi(payload);
        if (res.success && res.data) {
          setSaveSuccessMsg("Comp-off Policy created successfully!");
          setViewState("read");
          await loadData(res.data.id);
        } else {
          throw new Error(res.error || "Failed to create policy.");
        }
      } else if (viewState === "edit" && selectedPolicy) {
        const res = await updateCompOffPolicyApi(selectedPolicy.id, payload);
        if (res.success && res.data) {
          setSaveSuccessMsg("Comp-off Policy updated successfully!");
          setViewState("read");
          await loadData(selectedPolicy.id);
        } else {
          throw new Error(res.error || "Failed to update policy.");
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
    if (!confirm("Are you sure you want to delete this policy?")) return;

    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const res = await deleteCompOffPolicyApi(id);
      if (res.success) {
        setSaveSuccessMsg("Comp-off Policy deleted successfully!");
        const updatedList = policies.filter((item) => item.id !== id);
        setPolicies(updatedList);
        if (selectedPolicy?.id === id) {
          if (updatedList.length > 0) {
            setSelectedPolicy(updatedList[0]);
            populateForm(updatedList[0]);
          } else {
            setSelectedPolicy(null);
          }
        }
      } else {
        throw new Error(res.error || "Failed to delete policy.");
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while deleting.");
    }
  };

  const getLeaveTypeName = (ltId: number) => {
    const lt = leaveTypes.find((t) => t.leaveTypeId === ltId);
    return lt ? `${lt.leaveName} (${lt.leaveCode})` : `Leave Type ID: ${ltId}`;
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
          <span className="text-slate-900 font-bold">Comp-off Policy</span>
        </div>

        {/* Add Policy Button */}
        {viewState === "read" && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Comp-off Policy</span>
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
        {/* Left Side: List of Policies */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Comp-off Policies
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Loading...</span>
              </div>
            ) : policies.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">
                No comp-off policies configured
              </p>
            ) : (
              policies.map((policy) => {
                const isSelected = selectedPolicy?.id === policy.id;
                return (
                  <div
                    key={policy.id}
                    onClick={() => handleSelectPolicy(policy)}
                    className={`group w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <span>{policy.policyName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, policy.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all"
                        title="Delete Policy"
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

        {/* Right Side: Policy Details or Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 relative min-h-[350px]">
          {viewState === "read" ? (
            selectedPolicy ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {selectedPolicy.policyName}
                  </h3>
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Policy</span>
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Policy Name
                    </span>
                    <p className="font-bold text-slate-800 text-sm">{selectedPolicy.policyName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Leave Type Mapping
                    </span>
                    <p className="font-semibold text-slate-800 text-sm">{getLeaveTypeName(selectedPolicy.leaveTypeId)}</p>
                  </div>

                  {/* Worked triggers */}
                  <div className="space-y-1 md:col-span-2 border-t border-slate-100 pt-4">
                    <span className="text-brand-primary font-bold uppercase text-[10px] tracking-wider block mb-2">
                      Eligible Worked Days
                    </span>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${selectedPolicy.weekOffWorked ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className="font-semibold text-slate-700">Worked on Weekly Off</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${selectedPolicy.holidayWorked ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className="font-semibold text-slate-700">Worked on Holiday</span>
                      </div>
                    </div>
                  </div>

                  {/* OT rules */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-brand-primary font-bold uppercase text-[10px] tracking-wider block">
                      OT Hours Rules
                    </span>
                    {selectedPolicy.otHoursEnabled ? (
                      <div className="space-y-1 text-slate-700 font-semibold">
                        <p>OT Hours: <span className="text-emerald-700 font-bold">Enabled</span></p>
                        <p>Full Day OT: {selectedPolicy.otFullDayHours || 0} hrs {selectedPolicy.otFullDayMinutes || 0} mins</p>
                        <p>Half Day OT: {selectedPolicy.otHalfDayHours || 0} hrs {selectedPolicy.otHalfDayMinutes || 0} mins</p>
                      </div>
                    ) : (
                      <p className="font-semibold text-slate-400">OT Hours Disabled</p>
                    )}
                  </div>

                  {/* Regular Hours rules */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-brand-primary font-bold uppercase text-[10px] tracking-wider block">
                      Regular Hours Rules
                    </span>
                    {selectedPolicy.regularHoursEnabled ? (
                      <div className="space-y-1 text-slate-700 font-semibold">
                        <p>Regular Hours: <span className="text-emerald-700 font-bold">Enabled</span></p>
                        <p>Full Day Work: {selectedPolicy.regularFullDayHours || 0} hrs {selectedPolicy.regularFullDayMinutes || 0} mins</p>
                        <p>Half Day Work: {selectedPolicy.regularHalfDayHours || 0} hrs {selectedPolicy.regularHalfDayMinutes || 0} mins</p>
                      </div>
                    ) : (
                      <p className="font-semibold text-slate-400">Regular Hours Disabled</p>
                    )}
                  </div>

                  {/* Expiry and Accumulation */}
                  <div className="space-y-1 border-t border-slate-100 pt-4">
                    <span className="text-brand-primary font-bold uppercase text-[10px] tracking-wider block">
                      Expiry / Validity Type
                    </span>
                    <p className="font-bold text-slate-800">
                      {selectedPolicy.availabilityType === "DAYS" ? `Valid for ${selectedPolicy.availabilityDays || 0} Days` : selectedPolicy.availabilityType}
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-4">
                    <span className="text-brand-primary font-bold uppercase text-[10px] tracking-wider block">
                      Accumulation Mode
                    </span>
                    <p className="font-bold text-slate-800">{selectedPolicy.accumulationType}</p>
                  </div>

                  {/* Requests Configuration */}
                  <div className="space-y-2 md:col-span-2 border-t border-slate-100 pt-4">
                    <span className="text-brand-primary font-bold uppercase text-[10px] tracking-wider block">
                      Request Configuration
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-slate-700">Request Required: <span className="font-bold text-slate-800">{selectedPolicy.requestRequired ? "Yes" : "No"}</span></p>
                        {selectedPolicy.requestRequired && (
                          <p className="font-semibold text-slate-700 mt-1">Deadline: Within {selectedPolicy.requestWithinDays || 0} Days ({selectedPolicy.requestDeadlineType || "Days"})</p>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Max requests per month: <span className="font-bold text-slate-800">{selectedPolicy.maxRequestsPerMonth || "Unlimited"}</span></p>
                        <p className="font-semibold text-slate-700 mt-1">Max requests per year: <span className="font-bold text-slate-800">{selectedPolicy.maxRequestsPerYear || "Unlimited"}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-4 md:col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Status
                    </span>
                    <p className="font-semibold text-sm">
                      {selectedPolicy.status ? (
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
                No policy selected. Click "+ Add Comp-off Policy" to configure one.
              </div>
            )
          ) : (
            // Add or Edit Form
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {viewState === "add" ? "Create Comp-off Policy" : "Edit Comp-off Policy"}
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
                    Save Policy
                  </button>
                </div>
              </div>

              {/* Form Scrollable Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs max-h-[550px] overflow-y-auto pr-2">
                {/* Policy Name */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Policy Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Standard Comp Off Policy"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Leave Type mapping */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Map to Leave Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formLeaveTypeId}
                    onChange={(e) => setFormLeaveTypeId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary bg-white"
                  >
                    <option value="">-- Select Leave Type --</option>
                    {leaveTypes.map((type) => (
                      <option key={type.leaveTypeId} value={type.leaveTypeId}>
                        {type.leaveName} ({type.leaveCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Checkboxes */}
                <div className="space-y-2 md:col-span-2 flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="weekOffWorked"
                      checked={formWeekOffWorked}
                      onChange={(e) => setFormWeekOffWorked(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="weekOffWorked" className="text-slate-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                      Eligible on Weekly Off Worked
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="holidayWorked"
                      checked={formHolidayWorked}
                      onChange={(e) => setFormHolidayWorked(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="holidayWorked" className="text-slate-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                      Eligible on Holiday Worked
                    </label>
                  </div>
                </div>

                {/* OT Enable and details */}
                <div className="space-y-3 md:col-span-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="otHoursEnabled"
                      checked={formOtHoursEnabled}
                      onChange={(e) => setFormOtHoursEnabled(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="otHoursEnabled" className="text-brand-primary font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                      Enable Overtime (OT) Hours Thresholds
                    </label>
                  </div>

                  {formOtHoursEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 animate-fade-in">
                      <div className="space-y-2">
                        <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                          OT Full Day Threshold
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Hours"
                            value={formOtFullHours}
                            onChange={(e) => setFormOtFullHours(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">hrs</span>
                          <input
                            type="number"
                            placeholder="Mins"
                            value={formOtFullMinutes}
                            onChange={(e) => setFormOtFullMinutes(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">mins</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                          OT Half Day Threshold
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Hours"
                            value={formOtHalfHours}
                            onChange={(e) => setFormOtHalfHours(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">hrs</span>
                          <input
                            type="number"
                            placeholder="Mins"
                            value={formOtHalfMinutes}
                            onChange={(e) => setFormOtHalfMinutes(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">mins</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Regular Hours Enable and details */}
                <div className="space-y-3 md:col-span-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="regularHoursEnabled"
                      checked={formRegularHoursEnabled}
                      onChange={(e) => setFormRegularHoursEnabled(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="regularHoursEnabled" className="text-brand-primary font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                      Enable Regular Hours Thresholds
                    </label>
                  </div>

                  {formRegularHoursEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 animate-fade-in">
                      <div className="space-y-2">
                        <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                          Regular Full Day Work Threshold
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Hours"
                            value={formRegFullHours}
                            onChange={(e) => setFormRegFullHours(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">hrs</span>
                          <input
                            type="number"
                            placeholder="Mins"
                            value={formRegFullMinutes}
                            onChange={(e) => setFormRegFullMinutes(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">mins</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                          Regular Half Day Work Threshold
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Hours"
                            value={formRegHalfHours}
                            onChange={(e) => setFormRegHalfHours(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">hrs</span>
                          <input
                            type="number"
                            placeholder="Mins"
                            value={formRegHalfMinutes}
                            onChange={(e) => setFormRegHalfMinutes(e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                          />
                          <span className="font-semibold text-slate-500">mins</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expiry availability settings */}
                <div className="space-y-1 border-t border-slate-100 pt-4">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Availability / Expiry Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formAvailabilityType}
                    onChange={(e) => setFormAvailabilityType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary bg-white"
                  >
                    <option value="DAYS">Days (Expires after period)</option>
                    <option value="UNLIMITED">Unlimited (Never Expires)</option>
                  </select>
                </div>

                {/* Availability days */}
                <div className="space-y-1 border-t border-slate-100 pt-4">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Expiry Period (Days) {formAvailabilityType === "DAYS" && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="number"
                    disabled={formAvailabilityType !== "DAYS"}
                    required={formAvailabilityType === "DAYS"}
                    value={formAvailabilityDays}
                    onChange={(e) => setFormAvailabilityDays(e.target.value)}
                    placeholder="e.g. 90"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {/* Accumulation Mode */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Accumulation Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formAccumulationType}
                    onChange={(e) => setFormAccumulationType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary bg-white"
                  >
                    <option value="ADD">Add to leave balance</option>
                    <option value="REPLACE">Replace balance</option>
                  </select>
                </div>

                {/* Requests rules */}
                <div className="space-y-3 md:col-span-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="requestRequired"
                      checked={formRequestRequired}
                      onChange={(e) => setFormRequestRequired(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="requestRequired" className="text-slate-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                      Comp-off Request / Allocation Application Required
                    </label>
                  </div>

                  {formRequestRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                          Deadline: Deadline Type
                        </label>
                        <input
                          type="text"
                          value={formRequestDeadlineType}
                          onChange={(e) => setFormRequestDeadlineType(e.target.value)}
                          placeholder="e.g. Days"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                          Must request within (Days)
                        </label>
                        <input
                          type="number"
                          value={formRequestWithinDays}
                          onChange={(e) => setFormRequestWithinDays(e.target.value)}
                          placeholder="e.g. 30"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Request Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Max requests per month (Optional)
                    </label>
                    <input
                      type="number"
                      value={formMaxReqMonth}
                      onChange={(e) => setFormMaxReqMonth(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Max requests per year (Optional)
                    </label>
                    <input
                      type="number"
                      value={formMaxReqYear}
                      onChange={(e) => setFormMaxReqYear(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-2 md:col-span-2 flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="policyStatus"
                    checked={formStatus}
                    onChange={(e) => setFormStatus(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="policyStatus" className="text-slate-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer">
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
