"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Plus, Trash2, Check, Loader2, ArrowLeft, X, ShieldAlert } from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import {
  fetchLeavePolicies,
  createLeavePolicyApi,
  updateLeavePolicyApi,
  deleteLeavePolicyApi,
  fetchLeaveTypes,
  fetchLeavePolicyRules,
  createLeavePolicyRuleApi,
  updateLeavePolicyRuleApi,
  deleteLeavePolicyRuleApi,
} from "../api/settings.api";

interface LeavePolicyDetailViewProps {
  onBack: () => void;
}

interface LeavePolicy {
  leavePolicyId: number;
  companyId: number;
  policyName: string;
  policyCode: string;
  remarks: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  leavePolicyRules?: LeavePolicyRule[];
}

interface LeaveType {
  leaveTypeId: number;
  leaveName: string;
  leaveCode: string;
}

interface LeavePolicyRule {
  leavePolicyRuleId: number;
  leavePolicyId: number;
  leaveTypeId: number;
  requestSubmissionDays: number | null;
  requestSubmissionPeriod: string | null;
  informLeaveGreaterThan: number | null;
  informAfterDays: number | null;
  informPeriod: string | null;
  minLeaveDays: number | null;
  maxLeaveDays: number | null;
  annualRequestLimit: number | null;
  isPaid: boolean;
  payMultiplier: number | null;
  allowFileAttachment: boolean;
  attachmentRequiredAfterDays: number | null;
  countHolidayDuring: boolean;
  countHolidayAfter: boolean;
  countHolidayBefore: boolean;
  optionalHolidayOnly: boolean;
  countWeekoffDuring: boolean;
  countWeekoffAfter: boolean;
  countWeekoffBefore: boolean;
  status: boolean;
}

export const LeavePolicyDetailView: React.FC<LeavePolicyDetailViewProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewState, setViewState] = useState<"read" | "edit" | "add">("read");

  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);

  // Leave Types & Rules State
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [rules, setRules] = useState<LeavePolicyRule[]>([]);
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeavePolicyRule | null>(null);

  // Policy Edit/Add Fields State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formRemarks, setFormRemarks] = useState("");
  const [formStatus, setFormStatus] = useState(true);

  // Rule Form State
  const [ruleLeaveTypeId, setRuleLeaveTypeId] = useState<string>("");
  const [ruleIsPaid, setRuleIsPaid] = useState<boolean>(true);
  const [ruleMinLeaveDays, setRuleMinLeaveDays] = useState<string>("");
  const [ruleMaxLeaveDays, setRuleMaxLeaveDays] = useState<string>("");
  const [ruleAnnualLimit, setRuleAnnualLimit] = useState<string>("");
  const [ruleCountHoliday, setRuleCountHoliday] = useState<boolean>(false);
  const [ruleCountWeekoff, setRuleCountWeekoff] = useState<boolean>(false);
  const [ruleReqSubDays, setRuleReqSubDays] = useState<string>("");
  const [ruleReqSubPeriod, setRuleReqSubPeriod] = useState<string>("DAYS");
  const [ruleInformLeaveGreater, setRuleInformLeaveGreater] = useState<string>("");
  const [ruleInformAfterDays, setRuleInformAfterDays] = useState<string>("");
  const [ruleInformPeriod, setRuleInformPeriod] = useState<string>("DAYS");
  const [rulePayMultiplier, setRulePayMultiplier] = useState<string>("");
  const [ruleAllowAttachment, setRuleAllowAttachment] = useState<boolean>(false);
  const [ruleAttachReqAfterDays, setRuleAttachReqAfterDays] = useState<string>("");
  const [ruleCountHolidayAfter, setRuleCountHolidayAfter] = useState<boolean>(false);
  const [ruleCountHolidayBefore, setRuleCountHolidayBefore] = useState<boolean>(false);
  const [ruleOptionalHolidayOnly, setRuleOptionalHolidayOnly] = useState<boolean>(false);
  const [ruleCountWeekoffAfter, setRuleCountWeekoffAfter] = useState<boolean>(false);
  const [ruleCountWeekoffBefore, setRuleCountWeekoffBefore] = useState<boolean>(false);
  const [ruleStatus, setRuleStatus] = useState<boolean>(true);

  const [saveSuccessMsg, setSaveSuccessMsgState] = useState("");
  const [errorMsg, setErrorMsgState] = useState("");

  const setSaveSuccessMsg = (msg: string) => {
    setSaveSuccessMsgState(msg);
    if (msg) toast.success(msg);
  };

  const setErrorMsg = (msg: string) => {
    setErrorMsgState(msg);
    if (msg) toast.error(msg);
  };

  const loadData = async (selectId?: number) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [policiesRes, typesRes, rulesRes] = await Promise.all([
        fetchLeavePolicies(),
        fetchLeaveTypes(),
        fetchLeavePolicyRules(),
      ]);

      if (policiesRes.success && policiesRes.data) {
        setPolicies(policiesRes.data);
        if (policiesRes.data.length > 0) {
          const toSelect = selectId
            ? policiesRes.data.find((p: LeavePolicy) => p.leavePolicyId === selectId) || policiesRes.data[0]
            : policiesRes.data[0];
          setSelectedPolicy(toSelect);
          populateForm(toSelect);
        } else {
          setSelectedPolicy(null);
        }
      }

      if (typesRes.success && Array.isArray(typesRes.data)) {
        setLeaveTypes(typesRes.data);
      }

      if (rulesRes.success && Array.isArray(rulesRes.data)) {
        setRules(rulesRes.data);
      }
    } catch (err: any) {
      setErrorMsg("Failed to load policy configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateForm = (policy: LeavePolicy) => {
    setFormName(policy.policyName || "");
    setFormCode(policy.policyCode || "");
    setFormRemarks(policy.remarks || "");
    setFormStatus(policy.status !== undefined ? policy.status : true);
  };

  const handleSelectPolicy = (policy: LeavePolicy) => {
    if (viewState !== "read") {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setSelectedPolicy(policy);
    populateForm(policy);
    setViewState("read");
    setErrorMsg("");
    setIsRuleFormOpen(false);
  };

  const handleStartAdd = () => {
    setViewState("add");
    setFormName("");
    setFormCode("");
    setFormRemarks("");
    setFormStatus(true);
    setErrorMsg("");
    setIsRuleFormOpen(false);
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
    if (!formName.trim() || !formCode.trim()) {
      setErrorMsg("Policy Name and Policy Code are required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccessMsg("");

    const payload = {
      policyName: formName.trim(),
      policyCode: formCode.trim(),
      remarks: formRemarks.trim(),
      status: formStatus,
    };

    try {
      if (viewState === "add") {
        const res = await createLeavePolicyApi(payload);
        if (res.success && res.data) {
          setSaveSuccessMsg("Leave policy created successfully!");
          setViewState("read");
          await loadData(res.data.leavePolicyId);
        } else {
          throw new Error(res.error || "Failed to create leave policy.");
        }
      } else if (viewState === "edit" && selectedPolicy) {
        const res = await updateLeavePolicyApi(selectedPolicy.leavePolicyId, payload);
        if (res.success && res.data) {
          setSaveSuccessMsg("Leave policy updated successfully!");
          setViewState("read");
          await loadData(selectedPolicy.leavePolicyId);
        } else {
          throw new Error(res.error || "Failed to update leave policy.");
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
    if (!confirm("Are you sure you want to delete this leave policy?")) return;

    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const res = await deleteLeavePolicyApi(id);
      if (res.success) {
        setSaveSuccessMsg("Leave policy deleted successfully!");
        const updatedList = policies.filter((item) => item.leavePolicyId !== id);
        setPolicies(updatedList);
        if (selectedPolicy?.leavePolicyId === id) {
          if (updatedList.length > 0) {
            setSelectedPolicy(updatedList[0]);
            populateForm(updatedList[0]);
          } else {
            setSelectedPolicy(null);
          }
        }
      } else {
        throw new Error(res.error || "Failed to delete leave policy.");
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while deleting.");
    }
  };

  // Rule configuration CRUD
  const handleOpenRuleForm = (rule?: LeavePolicyRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleLeaveTypeId(String(rule.leaveTypeId));
      setRuleIsPaid(rule.isPaid);
      setRuleMinLeaveDays(rule.minLeaveDays !== null ? String(rule.minLeaveDays) : "");
      setRuleMaxLeaveDays(rule.maxLeaveDays !== null ? String(rule.maxLeaveDays) : "");
      setRuleAnnualLimit(rule.annualRequestLimit !== null ? String(rule.annualRequestLimit) : "");
      setRuleCountHoliday(rule.countHolidayDuring);
      setRuleCountWeekoff(rule.countWeekoffDuring);
      setRuleReqSubDays(rule.requestSubmissionDays !== null ? String(rule.requestSubmissionDays) : "");
      setRuleReqSubPeriod(rule.requestSubmissionPeriod || "DAYS");
      setRuleInformLeaveGreater(rule.informLeaveGreaterThan !== null ? String(rule.informLeaveGreaterThan) : "");
      setRuleInformAfterDays(rule.informAfterDays !== null ? String(rule.informAfterDays) : "");
      setRuleInformPeriod(rule.informPeriod || "DAYS");
      setRulePayMultiplier(rule.payMultiplier !== null ? String(rule.payMultiplier) : "");
      setRuleAllowAttachment(rule.allowFileAttachment);
      setRuleAttachReqAfterDays(rule.attachmentRequiredAfterDays !== null ? String(rule.attachmentRequiredAfterDays) : "");
      setRuleCountHolidayAfter(rule.countHolidayAfter);
      setRuleCountHolidayBefore(rule.countHolidayBefore);
      setRuleOptionalHolidayOnly(rule.optionalHolidayOnly);
      setRuleCountWeekoffAfter(rule.countWeekoffAfter);
      setRuleCountWeekoffBefore(rule.countWeekoffBefore);
      setRuleStatus(rule.status !== undefined ? rule.status : true);
    } else {
      setEditingRule(null);
      setRuleLeaveTypeId(leaveTypes[0]?.leaveTypeId ? String(leaveTypes[0].leaveTypeId) : "");
      setRuleIsPaid(true);
      setRuleMinLeaveDays("");
      setRuleMaxLeaveDays("");
      setRuleAnnualLimit("");
      setRuleCountHoliday(false);
      setRuleCountWeekoff(false);
      setRuleReqSubDays("");
      setRuleReqSubPeriod("DAYS");
      setRuleInformLeaveGreater("");
      setRuleInformAfterDays("");
      setRuleInformPeriod("DAYS");
      setRulePayMultiplier("");
      setRuleAllowAttachment(false);
      setRuleAttachReqAfterDays("");
      setRuleCountHolidayAfter(false);
      setRuleCountHolidayBefore(false);
      setRuleOptionalHolidayOnly(false);
      setRuleCountWeekoffAfter(false);
      setRuleCountWeekoffBefore(false);
      setRuleStatus(true);
    }
    setIsRuleFormOpen(true);
    setErrorMsg("");
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy || !ruleLeaveTypeId) return;

    setIsSaving(true);
    setErrorMsg("");

    const payload = {
      leavePolicyId: selectedPolicy.leavePolicyId,
      leaveTypeId: Number(ruleLeaveTypeId),
      isPaid: ruleIsPaid,
      minLeaveDays: ruleMinLeaveDays ? Number(ruleMinLeaveDays) : null,
      maxLeaveDays: ruleMaxLeaveDays ? Number(ruleMaxLeaveDays) : null,
      annualRequestLimit: ruleAnnualLimit ? Number(ruleAnnualLimit) : null,
      countHolidayDuring: ruleCountHoliday,
      countWeekoffDuring: ruleCountWeekoff,
      requestSubmissionDays: ruleReqSubDays ? Number(ruleReqSubDays) : null,
      requestSubmissionPeriod: ruleReqSubDays ? ruleReqSubPeriod : null,
      informLeaveGreaterThan: ruleInformLeaveGreater ? Number(ruleInformLeaveGreater) : null,
      informAfterDays: ruleInformAfterDays ? Number(ruleInformAfterDays) : null,
      informPeriod: ruleInformAfterDays ? ruleInformPeriod : null,
      payMultiplier: rulePayMultiplier ? Number(rulePayMultiplier) : null,
      allowFileAttachment: ruleAllowAttachment,
      attachmentRequiredAfterDays: ruleAllowAttachment && ruleAttachReqAfterDays ? Number(ruleAttachReqAfterDays) : null,
      countHolidayAfter: ruleCountHolidayAfter,
      countHolidayBefore: ruleCountHolidayBefore,
      optionalHolidayOnly: ruleOptionalHolidayOnly,
      countWeekoffAfter: ruleCountWeekoffAfter,
      countWeekoffBefore: ruleCountWeekoffBefore,
      status: ruleStatus,
    };

    try {
      if (editingRule) {
        const res = await updateLeavePolicyRuleApi(editingRule.leavePolicyRuleId, payload);
        if (res.success) {
          setSaveSuccessMsg("Policy rule updated successfully!");
          setIsRuleFormOpen(false);
          setEditingRule(null);
          // Refresh rules list
          const rulesRes = await fetchLeavePolicyRules();
          if (rulesRes.success && Array.isArray(rulesRes.data)) {
            setRules(rulesRes.data);
          }
        } else {
          throw new Error(res.error || "Failed to update policy rule.");
        }
      } else {
        const res = await createLeavePolicyRuleApi(payload);
        if (res.success) {
          setSaveSuccessMsg("Policy rule attached successfully!");
          setIsRuleFormOpen(false);
          // Refresh rules list
          const rulesRes = await fetchLeavePolicyRules();
          if (rulesRes.success && Array.isArray(rulesRes.data)) {
            setRules(rulesRes.data);
          }
        } else {
          throw new Error(res.error || "Failed to attach policy rule.");
        }
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving the rule.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRuleDelete = async (ruleId: number) => {
    if (!selectedPolicy) return;
    if (!confirm("Are you sure you want to remove this leave type policy rule?")) return;

    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const res = await deleteLeavePolicyRuleApi(ruleId);
      if (res.success) {
        setSaveSuccessMsg("Policy rule removed successfully!");
        // Refresh rules list
        const rulesRes = await fetchLeavePolicyRules();
        if (rulesRes.success && Array.isArray(rulesRes.data)) {
          setRules(rulesRes.data);
        }
      } else {
        throw new Error(res.error || "Failed to remove policy rule.");
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while removing the rule.");
    }
  };

  const selectedPolicyRules = selectedPolicy
    ? rules.filter((r) => r.leavePolicyId === selectedPolicy.leavePolicyId)
    : [];

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
          <span className="text-slate-900 font-bold">Leave Policy</span>
        </div>

        {/* Add Policy Button */}
        {viewState === "read" && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Policy</span>
          </button>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              List of Policies
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Loading...</span>
              </div>
            ) : policies.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">
                No leave policies configured
              </p>
            ) : (
              policies.map((p) => {
                const isSelected = selectedPolicy?.leavePolicyId === p.leavePolicyId;
                return (
                  <div
                    key={p.leavePolicyId}
                    onClick={() => handleSelectPolicy(p)}
                    className={`group w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <span>{p.policyName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, p.leavePolicyId)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all"
                        title="Delete Leave Policy"
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

        {/* Right Side Info/Form Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs relative min-h-[300px] space-y-6">
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
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-[#012d28] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Policy</span>
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                        Policy Name
                      </span>
                      <p className="font-bold text-slate-800 text-sm">{selectedPolicy.policyName}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                        Policy Code
                      </span>
                      <p className="font-mono font-bold text-slate-800 text-sm">{selectedPolicy.policyCode}</p>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                        Remarks
                      </span>
                      <p className="font-semibold text-slate-600 leading-relaxed">
                        {selectedPolicy.remarks || "-"}
                      </p>
                    </div>

                    <div className="space-y-1">
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
                  No policies selected. Click "+ Add New Policy" to configure one.
                </div>
              )
            ) : (
              // Add / Edit Form
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {viewState === "add" ? "Add New Policy" : "Edit Policy"}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Policy Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Standard Company Leave Policy"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Policy Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. STD_PL"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={formRemarks}
                      onChange={(e) => setFormRemarks(e.target.value)}
                      placeholder="Policy remarks or details..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  {/* Status checkbox */}
                  <div className="space-y-2 md:col-span-2 flex items-center gap-2 pt-2">
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

          {/* Sub-section: Attached Leave Rules (Visible only when viewing a policy in read state) */}
          {viewState === "read" && selectedPolicy && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-xs font-extrabold text-brand-primary uppercase tracking-wider">
                    Policy Rules & Constraints
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Attach leave type limits and exclusion rules to this policy.
                  </p>
                </div>

                {!isRuleFormOpen && (
                  <button
                    onClick={() => handleOpenRuleForm()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/15 text-brand-primary font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Leave Rule</span>
                  </button>
                )}
              </div>

              {/* Rule Attachment Form */}
              {isRuleFormOpen ? (
                <form onSubmit={handleRuleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <h5 className="font-bold text-slate-800">
                      {editingRule ? "Edit Leave Rule" : "Attach New Leave Rule"}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsRuleFormOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Leave Type Selector */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Leave Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={ruleLeaveTypeId}
                        onChange={(e) => setRuleLeaveTypeId(e.target.value)}
                        disabled={!!editingRule}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-800 bg-white focus:outline-none"
                      >
                        {leaveTypes.map((type) => (
                          <option key={type.leaveTypeId} value={type.leaveTypeId}>
                            {type.leaveName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Paid/Unpaid Status */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Leave Category
                      </label>
                      <div className="flex items-center gap-4 py-1.5">
                        <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            checked={ruleIsPaid}
                            onChange={() => setRuleIsPaid(true)}
                            className="text-brand-primary focus:ring-brand-primary"
                          />
                          Paid Leave
                        </label>
                        <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            checked={!ruleIsPaid}
                            onChange={() => setRuleIsPaid(false)}
                            className="text-brand-primary focus:ring-brand-primary"
                          />
                          Unpaid Leave
                        </label>
                      </div>
                    </div>

                    {/* Min Leave Days */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Min Days Per Request
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={ruleMinLeaveDays}
                        onChange={(e) => setRuleMinLeaveDays(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>

                    {/* Max Leave Days */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Max Days Per Request
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={ruleMaxLeaveDays}
                        onChange={(e) => setRuleMaxLeaveDays(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>

                    {/* Annual Limit */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Annual Request Limit (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={ruleAnnualLimit}
                        onChange={(e) => setRuleAnnualLimit(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>

                    {/* Request Submission Days & Period */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Request Submission Advance
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={ruleReqSubDays}
                          onChange={(e) => setRuleReqSubDays(e.target.value)}
                          placeholder="e.g. 3"
                          className="w-2/3 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                        />
                        <select
                          value={ruleReqSubPeriod}
                          onChange={(e) => setRuleReqSubPeriod(e.target.value)}
                          className="w-1/3 border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-800 bg-white focus:outline-none"
                        >
                          <option value="DAYS">DAYS</option>
                          <option value="WEEKS">WEEKS</option>
                          <option value="MONTHS">MONTHS</option>
                        </select>
                      </div>
                    </div>

                    {/* Inform Delay Alert Configuration */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Inform Delay Threshold
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={ruleInformAfterDays}
                          onChange={(e) => setRuleInformAfterDays(e.target.value)}
                          placeholder="e.g. 5"
                          className="w-2/3 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                        />
                        <select
                          value={ruleInformPeriod}
                          onChange={(e) => setRuleInformPeriod(e.target.value)}
                          className="w-1/3 border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-800 bg-white focus:outline-none"
                        >
                          <option value="DAYS">DAYS</option>
                          <option value="WEEKS">WEEKS</option>
                          <option value="MONTHS">MONTHS</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Inform Greater Than (Days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={ruleInformLeaveGreater}
                        onChange={(e) => setRuleInformLeaveGreater(e.target.value)}
                        placeholder="e.g. 3"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>

                    {/* Unpaid Pay Multiplier */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Salary Deduction Pay Multiplier
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={rulePayMultiplier}
                        onChange={(e) => setRulePayMultiplier(e.target.value)}
                        placeholder="e.g. 1.0"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>

                    {/* File Attachment Upload Rules */}
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Attachment Requirement
                      </label>
                      <div className="flex items-center gap-2 py-1.5 font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          id="ruleAllowAttachment"
                          checked={ruleAllowAttachment}
                          onChange={(e) => setRuleAllowAttachment(e.target.checked)}
                          className="rounded-sm text-brand-primary focus:ring-brand-primary"
                        />
                        <label htmlFor="ruleAllowAttachment" className="cursor-pointer">Permit Uploads</label>
                      </div>
                    </div>

                    {ruleAllowAttachment && (
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                          Mandatory Upload After (Days)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={ruleAttachReqAfterDays}
                          onChange={(e) => setRuleAttachReqAfterDays(e.target.value)}
                          placeholder="e.g. 3"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Calender rules checkboxes */}
                    <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                        Calendar Exclusions
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1 font-semibold text-slate-700">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleCountHoliday}
                            onChange={(e) => setRuleCountHoliday(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Count Holidays during leave duration
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleCountHolidayBefore}
                            onChange={(e) => setRuleCountHolidayBefore(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Count Holidays immediately before leave
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleCountHolidayAfter}
                            onChange={(e) => setRuleCountHolidayAfter(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Count Holidays immediately after leave
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleOptionalHolidayOnly}
                            onChange={(e) => setRuleOptionalHolidayOnly(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Optional Holidays only
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleCountWeekoff}
                            onChange={(e) => setRuleCountWeekoff(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Count Weekoffs during leave duration
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleCountWeekoffBefore}
                            onChange={(e) => setRuleCountWeekoffBefore(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Count Weekoffs immediately before leave
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleCountWeekoffAfter}
                            onChange={(e) => setRuleCountWeekoffAfter(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Count Weekoffs immediately after leave
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ruleStatus}
                            onChange={(e) => setRuleStatus(e.target.checked)}
                            className="rounded-sm text-brand-primary focus:ring-brand-primary"
                          />
                          Rule Status (Active)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setIsRuleFormOpen(false)}
                      disabled={isSaving}
                      className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Rule
                    </button>
                  </div>
                </form>
              ) : selectedPolicyRules.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">
                  No leave rules attached to this policy yet. Click "+ Attach Leave Rule" to attach one.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Leave Type</th>
                        <th className="py-2.5 px-3 text-center">Type</th>
                        <th className="py-2.5 px-3 text-center">Min/Max days</th>
                        <th className="py-2.5 px-3 text-center">Annual limit</th>
                        <th className="py-2.5 px-3 text-center">Count Holiday/Weekoff</th>
                        <th className="py-2.5 px-3 w-16 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedPolicyRules.map((rule) => {
                        const lt = leaveTypes.find((t) => t.leaveTypeId === rule.leaveTypeId);
                        return (
                          <tr key={rule.leavePolicyRuleId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-900">
                              {lt ? lt.leaveName : `Leave Type ID: ${rule.leaveTypeId}`}
                            </td>
                            <td className="py-3 px-3 text-center font-bold">
                              {rule.isPaid ? (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md text-[10px]">Paid</span>
                              ) : (
                                <span className="text-rose-700 bg-rose-50 border border-rose-200/50 px-2 py-0.5 rounded-md text-[10px]">Unpaid</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-medium text-slate-600">
                              {rule.minLeaveDays ?? "-"} / {rule.maxLeaveDays ?? "-"}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-800">{rule.annualRequestLimit ?? "Unlimited"}</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-500">
                              {rule.countHolidayDuring ? "H" : ""} {rule.countWeekoffDuring ? "W" : ""}
                              {!rule.countHolidayDuring && !rule.countWeekoffDuring ? "-" : ""}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenRuleForm(rule)}
                                  className="p-1 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-md transition-colors"
                                  title="Edit Rule"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRuleDelete(rule.leavePolicyRuleId)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Remove Rule"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
