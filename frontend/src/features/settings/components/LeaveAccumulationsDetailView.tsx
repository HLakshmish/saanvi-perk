"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Plus, Trash2, Check, Loader2, ArrowLeft, X, ShieldAlert, UserPlus, Search } from "lucide-react";
import {
  fetchLeavePolicies,
  fetchLeaveTypes,
  fetchLeavePolicyAccumulations,
  createLeavePolicyAccumulationApi,
  updateLeavePolicyAccumulationApi,
  deleteLeavePolicyAccumulationApi,
  fetchLeaveAccumulations,
  createLeaveAccumulation,
  updateLeaveAccumulation,
  deleteLeaveAccumulation,
} from "../api/settings.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";
import { LeaveAllocationFormModal } from "./LeaveAllocationFormModal";
import { fetchLeaveRequests } from "@/features/leaves/api/leaves.api";



interface LeaveAccumulationsDetailViewProps {
  onBack: () => void;
}

interface LeavePolicy {
  leavePolicyId: number;
  policyName: string;
  policyCode: string;
  leavePolicyAccumulations?: LeavePolicyAccumulation[];
}

interface LeaveType {
  leaveTypeId: number;
  leaveName: string;
  leaveCode: string;
}

interface LeavePolicyAccumulation {
  leavePolicyAccumulationId: number;
  leavePolicyId: number;
  leaveTypeId: number;
  autoAccumulate: boolean;
  considerDateOfJoining: boolean;
  considerDateOfProbation: boolean;
  accumulationStartDays: number | null;
  accumulationAmount: number | null;
  accumulationFrequency: string | null;
  accumulationDay: number | null;
  accumulationMonth: number | null;
  expiryPeriod: string | null;
  basedOnDaysPresent: boolean;
  presencePeriod: string | null;
  considerForEncashment: boolean;
  maxLeaveBalance: number | null;
  maxAccumulationPerYear: number | null;
  maxNegativeBalance: number | null;
  maxCarryForward: number | null;
  remainingLeaveAction: string | null;
  status: boolean;
}

export const LeaveAccumulationsDetailView: React.FC<LeaveAccumulationsDetailViewProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);

  // Leave Types & Accumulations State
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [accumulations, setAccumulations] = useState<LeavePolicyAccumulation[]>([]);

  // Employee Accumulations States
  const [subTab, setSubTab] = useState<"employees" | "rules">("employees");
  const [employeeAllocations, setEmployeeAllocations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<any | null>(null);
  const [allocSearchText, setAllocSearchText] = useState("");
  const [allocDefaultLeaveTypeId, setAllocDefaultLeaveTypeId] = useState<number | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);



  // Form State for rules
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccumulation, setEditingAccumulation] = useState<LeavePolicyAccumulation | null>(null);

  // Fields Form State
  const [formLeaveTypeId, setFormLeaveTypeId] = useState<string>("");
  const [formAutoAccumulate, setFormAutoAccumulate] = useState<boolean>(true);
  const [formConsiderDOJ, setFormConsiderDOJ] = useState<boolean>(false);
  const [formConsiderProbation, setFormConsiderProbation] = useState<boolean>(false);
  const [formAccrualAmount, setFormAccrualAmount] = useState<string>("");
  const [formFrequency, setFormFrequency] = useState<string>("Monthly");
  const [formMaxBalance, setFormMaxBalance] = useState<string>("");
  const [formMaxCarryForward, setFormMaxCarryForward] = useState<string>("");
  const [formConsiderEncashment, setFormConsiderEncashment] = useState<boolean>(false);
  const [formAccStartDays, setFormAccStartDays] = useState<string>("0");
  const [formAccDay, setFormAccDay] = useState<string>("");
  const [formAccMonth, setFormAccMonth] = useState<string>("");
  const [formExpiryPeriod, setFormExpiryPeriod] = useState<string>("0");
  const [formBasedOnDaysPresent, setFormBasedOnDaysPresent] = useState<boolean>(false);
  const [formPresencePeriod, setFormPresencePeriod] = useState<string>("");
  const [formMaxAccPerYear, setFormMaxAccPerYear] = useState<string>("");
  const [formMaxNegativeBalance, setFormMaxNegativeBalance] = useState<string>("");
  const [formRemainingLeaveAction, setFormRemainingLeaveAction] = useState<string>("CARRY_FORWARD");
  const [formStatus, setFormStatus] = useState<boolean>(true);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async (selectPolicyId?: number) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [policiesRes, typesRes, accsRes, allocsRes, employeesList, requestsRes] = await Promise.all([
        fetchLeavePolicies(),
        fetchLeaveTypes(),
        fetchLeavePolicyAccumulations(),
        fetchLeaveAccumulations(),
        getEmployees(),
        fetchLeaveRequests().catch(() => ({ success: false, data: [] })),
      ]);

      if (policiesRes.success && policiesRes.data) {
        setPolicies(policiesRes.data);
        if (policiesRes.data.length > 0) {
          const toSelect = selectPolicyId
            ? policiesRes.data.find((p: LeavePolicy) => p.leavePolicyId === selectPolicyId) || policiesRes.data[0]
            : policiesRes.data[0];
          setSelectedPolicy(toSelect);
        } else {
          setSelectedPolicy(null);
        }
      }

      if (typesRes.success && Array.isArray(typesRes.data)) {
        setLeaveTypes(typesRes.data);
      }

      if (accsRes.success && Array.isArray(accsRes.data)) {
        setAccumulations(accsRes.data);
      }

      if (allocsRes.success && Array.isArray(allocsRes.data)) {
        setEmployeeAllocations(allocsRes.data);
      }

      if (Array.isArray(employeesList)) {
        setEmployees(employeesList);
      }

      if (requestsRes.success && Array.isArray(requestsRes.data)) {
        setLeaveRequests(requestsRes.data);
      }
    } catch (err: any) {
      setErrorMsg("Failed to load leave accumulations data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPolicy = (policy: LeavePolicy) => {
    if (isFormOpen) {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setSelectedPolicy(policy);
    setIsFormOpen(false);
    setErrorMsg("");
  };


  const handleOpenForm = (acc?: LeavePolicyAccumulation) => {
    if (acc) {
      setEditingAccumulation(acc);
      setFormLeaveTypeId(String(acc.leaveTypeId));
      setFormAutoAccumulate(acc.autoAccumulate);
      setFormConsiderDOJ(acc.considerDateOfJoining);
      setFormConsiderProbation(acc.considerDateOfProbation);
      setFormAccrualAmount(acc.accumulationAmount !== null ? String(acc.accumulationAmount) : "");
      setFormFrequency(acc.accumulationFrequency || "Monthly");
      setFormMaxBalance(acc.maxLeaveBalance !== null ? String(acc.maxLeaveBalance) : "");
      setFormMaxCarryForward(acc.maxCarryForward !== null ? String(acc.maxCarryForward) : "");
      setFormConsiderEncashment(acc.considerForEncashment);
      setFormAccStartDays(acc.accumulationStartDays !== null ? String(acc.accumulationStartDays) : "0");
      setFormAccDay(acc.accumulationDay !== null ? String(acc.accumulationDay) : "");
      setFormAccMonth(acc.accumulationMonth !== null ? String(acc.accumulationMonth) : "");
      setFormExpiryPeriod(acc.expiryPeriod || "");
      setFormBasedOnDaysPresent(acc.basedOnDaysPresent);
      setFormPresencePeriod(acc.presencePeriod || "");
      setFormMaxAccPerYear(acc.maxAccumulationPerYear !== null ? String(acc.maxAccumulationPerYear) : "");
      setFormMaxNegativeBalance(acc.maxNegativeBalance !== null ? String(acc.maxNegativeBalance) : "");
      setFormRemainingLeaveAction(acc.remainingLeaveAction || "CARRY_FORWARD");
      setFormStatus(acc.status !== undefined ? acc.status : true);
    } else {
      setEditingAccumulation(null);
      setFormLeaveTypeId(leaveTypes[0]?.leaveTypeId ? String(leaveTypes[0].leaveTypeId) : "");
      setFormAutoAccumulate(true);
      setFormConsiderDOJ(false);
      setFormConsiderProbation(false);
      setFormAccrualAmount("");
      setFormFrequency("Monthly");
      setFormMaxBalance("");
      setFormMaxCarryForward("");
      setFormConsiderEncashment(false);
      setFormAccStartDays("0");
      setFormAccDay("");
      setFormAccMonth("");
      setFormExpiryPeriod("");
      setFormBasedOnDaysPresent(false);
      setFormPresencePeriod("");
      setFormMaxAccPerYear("");
      setFormMaxNegativeBalance("");
      setFormRemainingLeaveAction("CARRY_FORWARD");
      setFormStatus(true);
    }
    setIsFormOpen(true);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy || !formLeaveTypeId) return;

    setIsSaving(true);
    setErrorMsg("");

    const payload = {
      leavePolicyId: selectedPolicy.leavePolicyId,
      leaveTypeId: Number(formLeaveTypeId),
      autoAccumulate: formAutoAccumulate,
      considerDateOfJoining: formConsiderDOJ,
      considerDateOfProbation: formConsiderProbation,
      accumulationAmount: formAccrualAmount ? Number(formAccrualAmount) : null,
      accumulationFrequency: formAutoAccumulate ? formFrequency : null,
      maxLeaveBalance: formMaxBalance ? Number(formMaxBalance) : null,
      maxCarryForward: formMaxCarryForward ? Number(formMaxCarryForward) : null,
      considerForEncashment: formConsiderEncashment,
      accumulationStartDays: formAccStartDays ? Number(formAccStartDays) : 0,
      accumulationDay: formAccDay ? Number(formAccDay) : null,
      accumulationMonth: formAccMonth ? Number(formAccMonth) : null,
      expiryPeriod: formExpiryPeriod || null,
      basedOnDaysPresent: formBasedOnDaysPresent,
      presencePeriod: formBasedOnDaysPresent && formPresencePeriod ? formPresencePeriod : null,
      maxAccumulationPerYear: formMaxAccPerYear ? Number(formMaxAccPerYear) : null,
      maxNegativeBalance: formMaxNegativeBalance ? Number(formMaxNegativeBalance) : null,
      remainingLeaveAction: formRemainingLeaveAction || null,
      status: formStatus,
    };

    try {
      if (editingAccumulation) {
        const res = await updateLeavePolicyAccumulationApi(
          editingAccumulation.leavePolicyAccumulationId,
          payload
        );
        if (res.success) {
          setSaveSuccessMsg("Accumulation rule updated successfully!");
          setIsFormOpen(false);
          setEditingAccumulation(null);
          // Refresh list
          const listRes = await fetchLeavePolicyAccumulations();
          if (listRes.success && Array.isArray(listRes.data)) {
            setAccumulations(listRes.data);
          }
        } else {
          throw new Error(res.error || "Failed to update accumulation rule.");
        }
      } else {
        const res = await createLeavePolicyAccumulationApi(payload);
        if (res.success) {
          setSaveSuccessMsg("Accumulation rule added successfully!");
          setIsFormOpen(false);
          // Refresh list
          const listRes = await fetchLeavePolicyAccumulations();
          if (listRes.success && Array.isArray(listRes.data)) {
            setAccumulations(listRes.data);
          }
        } else {
          throw new Error(res.error || "Failed to create accumulation rule.");
        }
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedPolicy) return;
    if (!confirm("Are you sure you want to remove this accumulation configuration?")) return;

    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const res = await deleteLeavePolicyAccumulationApi(id);
      if (res.success) {
        setSaveSuccessMsg("Accumulation rule deleted successfully!");
        // Refresh list
        const listRes = await fetchLeavePolicyAccumulations();
        if (listRes.success && Array.isArray(listRes.data)) {
          setAccumulations(listRes.data);
        }
      } else {
        throw new Error(res.error || "Failed to delete accumulation rule.");
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while deleting.");
    }
  };

  const handleSaveAllocation = async (payload: any) => {
    try {
      let res;
      if (editingAllocation) {
        res = await updateLeaveAccumulation(editingAllocation.leaveAccumulationId, payload);
      } else {
        res = await createLeaveAccumulation(payload);
      }
      if (res.success) {
        setSaveSuccessMsg(editingAllocation ? "Leave allocation updated successfully!" : "Leave allocated successfully!");
        // Refresh allocations and requests
        const [allocsRes, requestsRes] = await Promise.all([
          fetchLeaveAccumulations(),
          fetchLeaveRequests().catch(() => ({ success: false, data: [] }))
        ]);
        if (allocsRes.success && Array.isArray(allocsRes.data)) {
          setEmployeeAllocations(allocsRes.data);
        }
        if (requestsRes.success && Array.isArray(requestsRes.data)) {
          setLeaveRequests(requestsRes.data);
        }
        setTimeout(() => setSaveSuccessMsg(""), 4000);
        return true;
      } else {
        throw new Error(res.error || "Failed to save leave allocation.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving leave allocation.");
      return false;
    }
  };

  const handleDeleteAllocation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee leave allocation?")) return;
    setErrorMsg("");
    setSaveSuccessMsg("");
    try {
      const res = await deleteLeaveAccumulation(id);
      if (res.success) {
        setSaveSuccessMsg("Leave allocation deleted successfully!");
        const [allocsRes, requestsRes] = await Promise.all([
          fetchLeaveAccumulations(),
          fetchLeaveRequests().catch(() => ({ success: false, data: [] }))
        ]);
        if (allocsRes.success && Array.isArray(allocsRes.data)) {
          setEmployeeAllocations(allocsRes.data);
        }
        if (requestsRes.success && Array.isArray(requestsRes.data)) {
          setLeaveRequests(requestsRes.data);
        }
        setTimeout(() => setSaveSuccessMsg(""), 4000);
      } else {
        throw new Error(res.error || "Failed to delete leave allocation.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while deleting leave allocation.");
    }
  };


  const selectedPolicyAccs = selectedPolicy
    ? accumulations.filter((acc) => acc.leavePolicyId === selectedPolicy.leavePolicyId)
    : [];

  return (
    <>
      <div className="space-y-6 animate-fade-in">
      {/* Top Header Breadcrumb & Add Button */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-[#013e37] font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leave</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Leave Accumulations</span>
        </div>

        {/* Add Accumulation / Allocation Button */}
        {!isFormOpen && selectedPolicy && (
          <div className="flex gap-2">
            {subTab === "employees" ? (
              <button
                onClick={() => {
                  setEditingAllocation(null);
                  setAllocDefaultLeaveTypeId(null);
                  setIsAllocationModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] font-bold text-xs rounded-xl shadow-md shadow-[#013e37]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Allocate to Employees</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenForm()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] font-bold text-xs rounded-xl shadow-md shadow-[#013e37]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Configure Accumulation</span>
              </button>
            )}
          </div>
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
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Select Policy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Policy
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-[#013e37]" />
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
                        ? "bg-[#013e37]/10 text-[#013e37] border-[#013e37]/20"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <span>{p.policyName}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-[#013e37] translate-x-0.5" : "text-slate-400"}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Accumulation Form or List */}
        <div className="lg:col-span-3">
          {isFormOpen ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {editingAccumulation ? "Edit Accumulation Rule" : "Configure Accumulation"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      disabled={isSaving}
                      className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffefb3]" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Save
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                  {/* Leave Type Select */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Leave Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formLeaveTypeId}
                      onChange={(e) => setFormLeaveTypeId(e.target.value)}
                      disabled={!!editingAccumulation}
                      className="w-full border border-slate-300 bg-white rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    >
                      {leaveTypes.map((t) => (
                        <option key={t.leaveTypeId} value={t.leaveTypeId}>
                          {t.leaveName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto Accumulate toggle */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Auto Accrual Enable
                    </label>
                    <div className="flex items-center gap-4 py-1.5 font-semibold text-slate-700">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formAutoAccumulate}
                          onChange={(e) => setFormAutoAccumulate(e.target.checked)}
                          className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                        />
                        Automatically accumulate leaves
                      </label>
                    </div>
                  </div>

                  {/* Accumulation Frequency (Conditional) */}
                  {formAutoAccumulate && (
                    <>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                          Accumulation Frequency
                        </label>
                        <select
                          value={formFrequency}
                          onChange={(e) => setFormFrequency(e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Half-Yearly">Half-Yearly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                          Accumulation Amount (Days)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          required
                          value={formAccrualAmount}
                          onChange={(e) => setFormAccrualAmount(e.target.value)}
                          placeholder="e.g. 1.25"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Accrual Start Milestones */}
                  <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Accrual Eligibility Constraints
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1 font-semibold text-slate-700">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConsiderDOJ}
                          onChange={(e) => setFormConsiderDOJ(e.target.checked)}
                          className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                        />
                        Consider Date of Joining
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConsiderProbation}
                          onChange={(e) => setFormConsiderProbation(e.target.checked)}
                          className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                        />
                        Consider Probation Completion Date
                      </label>
                    </div>
                  </div>

                  {/* Year end carry limits */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Max Leave Balance limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formMaxBalance}
                      onChange={(e) => setFormMaxBalance(e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Max Carry Forward limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formMaxCarryForward}
                      onChange={(e) => setFormMaxCarryForward(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Encashment Options
                    </label>
                    <div className="flex items-center gap-4 py-1.5 font-semibold text-slate-700">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConsiderEncashment}
                          onChange={(e) => setFormConsiderEncashment(e.target.checked)}
                          className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                        />
                        Allow encashment of remaining leaves
                      </label>
                    </div>
                  </div>

                  {/* Accrual Day & Month */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Accumulation Day (Day of Month)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formAccDay}
                      onChange={(e) => setFormAccDay(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Accumulation Month (Month of Year)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formAccMonth}
                      onChange={(e) => setFormAccMonth(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Accrual Start Delay */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Accumulation Start Days (Offset)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formAccStartDays}
                      onChange={(e) => setFormAccStartDays(e.target.value)}
                      placeholder="e.g. 0"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Expiry Period */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Expiry Period (e.g. 1 Year)
                    </label>
                    <input
                      type="text"
                      value={formExpiryPeriod}
                      onChange={(e) => setFormExpiryPeriod(e.target.value)}
                      placeholder="e.g. 12 Months / 1 Year"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Presence-based Accrual */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Accrual Based on Attendance
                    </label>
                    <div className="flex items-center gap-2 py-1.5 font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        id="formBasedOnDaysPresent"
                        checked={formBasedOnDaysPresent}
                        onChange={(e) => setFormBasedOnDaysPresent(e.target.checked)}
                        className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                      />
                      <label htmlFor="formBasedOnDaysPresent" className="cursor-pointer">Based on Days Present</label>
                    </div>
                  </div>

                  {formBasedOnDaysPresent && (
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                        Min Presence Period (e.g. 15 Days)
                      </label>
                      <input
                        type="text"
                        value={formPresencePeriod}
                        onChange={(e) => setFormPresencePeriod(e.target.value)}
                        placeholder="e.g. 15 Days"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Limits and Overdrafts */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Max Accumulation Per Year
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formMaxAccPerYear}
                      onChange={(e) => setFormMaxAccPerYear(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Max Allowed Negative Balance
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formMaxNegativeBalance}
                      onChange={(e) => setFormMaxNegativeBalance(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Remaining Leave Action */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Remaining Leave Action
                    </label>
                    <select
                      value={formRemainingLeaveAction}
                      onChange={(e) => setFormRemainingLeaveAction(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="CARRY_FORWARD">CARRY_FORWARD</option>
                      <option value="ENCHASH">ENCHASH</option>
                      <option value="LAPSE">LAPSE</option>
                    </select>
                  </div>

                  {/* Accumulation Status checkbox */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Rule Status
                    </label>
                    <div className="flex items-center gap-2 py-1.5 font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        id="formStatusCheckbox"
                        checked={formStatus}
                        onChange={(e) => setFormStatus(e.target.checked)}
                        className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                      />
                      <label htmlFor="formStatusCheckbox" className="cursor-pointer">Active</label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              {/* Sub-tab selection */}
              <div className="flex border-b border-slate-200 gap-4 mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSubTab("employees")}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    subTab === "employees" ? "border-[#013e37] text-[#013e37]" : "border-transparent text-slate-500 hover:text-[#013e37]"
                  }`}
                >
                  Employee Allocations
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab("rules")}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    subTab === "rules" ? "border-[#013e37] text-[#013e37]" : "border-transparent text-slate-500 hover:text-[#013e37]"
                  }`}
                >
                  Policy Accumulation Rules
                </button>
              </div>

              {subTab === "employees" ? (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by employee name or code..."
                        value={allocSearchText}
                        onChange={(e) => setAllocSearchText(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Employee Allocations Table */}
                  {(() => {
                    const filteredAllocations = employeeAllocations.filter((alloc) => {
                      if (selectedPolicy && alloc.leavePolicyId !== selectedPolicy.leavePolicyId) {
                        return false;
                      }
                      if (allocSearchText.trim()) {
                        const emp = employees.find((e) => String(e.id) === String(alloc.userId));
                        if (!emp) return false;
                        const q = allocSearchText.toLowerCase();
                        return emp.name.toLowerCase().includes(q) || emp.employeeCode.toLowerCase().includes(q);
                      }
                      return true;
                    });

                    if (filteredAllocations.length === 0) {
                      return (
                        <div className="p-12 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">
                          No leave accumulation records found. Click "Allocate to Employees" to assign leave balances.
                        </div>
                      );
                    }

                    return (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse text-xs text-slate-700">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">
                              <th className="py-2.5 px-3">Employee</th>
                              <th className="py-2.5 px-3">Leave Type</th>
                              <th className="py-2.5 px-3 text-center">Allocated</th>
                              <th className="py-2.5 px-3 text-center">Balance</th>
                              <th className="py-2.5 px-3 text-center">Accumulation Date</th>
                              <th className="py-2.5 px-3 text-center">Period</th>
                              <th className="py-2.5 px-3 text-center">Availability</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 w-16 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredAllocations.map((alloc) => {
                              const emp = employees.find((e) => String(e.id) === String(alloc.userId));
                              const lt = leaveTypes.find((t) => t.leaveTypeId === alloc.leaveTypeId);
                              
                              // Calculate balance dynamically
                              const availedDays = leaveRequests
                                .filter(
                                  (req: any) =>
                                    Number(req.userId) === Number(alloc.userId) &&
                                    Number(req.leaveTypeId) === Number(alloc.leaveTypeId) &&
                                    String(req.status).toUpperCase() === "APPROVED"
                                )
                                .reduce((sum: number, req: any) => sum + Number(req.numberOfDays), 0);
                              
                              const balance = Number(alloc.numberOfLeaves) - availedDays;

                              return (
                                <tr key={alloc.leaveAccumulationId} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-slate-900">{emp ? emp.name : "Unknown Employee"}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{emp ? emp.employeeCode : `User ID: ${alloc.userId}`}</div>
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-900">
                                    {lt ? lt.leaveName : `Leave Type ID: ${alloc.leaveTypeId}`}
                                  </td>
                                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                                    {alloc.numberOfLeaves}
                                  </td>
                                  <td className="py-3 px-3 text-center font-bold text-emerald-700">
                                    {balance}
                                  </td>
                                  <td className="py-3 px-3 text-center font-medium text-slate-600">
                                    {new Date(alloc.accumulationDate).toLocaleDateString("en-GB")}
                                  </td>
                                  <td className="py-3 px-3 text-center font-medium text-slate-600">
                                    {new Date(alloc.accumulationPeriodFrom).toLocaleDateString("en-GB")} - {new Date(alloc.accumulationPeriodTo).toLocaleDateString("en-GB")}
                                  </td>
                                  <td className="py-3 px-3 text-center font-medium text-slate-600">
                                    {new Date(alloc.availabilityPeriodFrom).toLocaleDateString("en-GB")} - {new Date(alloc.availabilityPeriodTo).toLocaleDateString("en-GB")}
                                  </td>
                                  <td className="py-3 px-3 text-center font-semibold">
                                    {alloc.status ? (
                                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md text-[10px]">Active</span>
                                    ) : (
                                      <span className="text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[10px]">Inactive</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingAllocation(alloc);
                                          setAllocDefaultLeaveTypeId(alloc.leaveTypeId);
                                          setIsAllocationModalOpen(true);
                                        }}
                                        className="p-1 text-slate-400 hover:text-[#013e37] hover:bg-slate-100 rounded-md transition-colors"
                                        title="Edit Allocation"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAllocation(alloc.leaveAccumulationId)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                        title="Delete Allocation"
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
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Accumulation Rules: {selectedPolicy?.policyName || "No Policy Selected"}
                    </h3>
                  </div>

                  {selectedPolicyAccs.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">
                      No accumulation rules attached to this policy yet. Click "Configure Accumulation" to set up auto accrual.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse text-xs text-slate-700">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-3">Leave Type</th>
                            <th className="py-2.5 px-3 text-center">Auto Accrual</th>
                            <th className="py-2.5 px-3 text-center">Rate</th>
                            <th className="py-2.5 px-3 text-center">Frequency</th>
                            <th className="py-2.5 px-3 text-center">Carry limit</th>
                            <th className="py-2.5 px-3 text-center">Max balance</th>
                            <th className="py-2.5 px-3 text-center">Encashment</th>
                            <th className="py-2.5 px-3 w-16 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {selectedPolicyAccs.map((acc) => {
                            const lt = leaveTypes.find((t) => t.leaveTypeId === acc.leaveTypeId);
                            return (
                              <tr key={acc.leavePolicyAccumulationId} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-3 font-bold text-slate-900">
                                  {lt ? lt.leaveName : `Leave Type ID: ${acc.leaveTypeId}`}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold">
                                  {acc.autoAccumulate ? (
                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md text-[10px]">Active</span>
                                  ) : (
                                    <span className="text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[10px]">Inactive</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center font-bold text-slate-800">
                                  {acc.accumulationAmount !== null ? `${acc.accumulationAmount} d` : "-"}
                                </td>
                                <td className="py-3 px-3 text-center font-medium text-slate-600">{acc.accumulationFrequency || "-"}</td>
                                <td className="py-3 px-3 text-center font-bold text-slate-800">{acc.maxCarryForward ?? "Unlimited"}</td>
                                <td className="py-3 px-3 text-center font-bold text-slate-800">{acc.maxLeaveBalance ?? "Unlimited"}</td>
                                <td className="py-3 px-3 text-center font-semibold">
                                  {acc.considerForEncashment ? "Yes" : "No"}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingAllocation(null);
                                        setAllocDefaultLeaveTypeId(acc.leaveTypeId);
                                        setIsAllocationModalOpen(true);
                                      }}
                                      className="p-1 text-slate-400 hover:text-[#013e37] hover:bg-slate-100 rounded-md transition-colors"
                                      title="Allocate to Employees"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenForm(acc)}
                                      className="p-1 text-slate-400 hover:text-[#013e37] hover:bg-slate-100 rounded-md transition-colors"
                                      title="Edit Rule"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(acc.leavePolicyAccumulationId)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                      title="Delete Configuration"
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
          )}
        </div>
      </div>
    </div>

      {/* Allocation form modal */}
      <LeaveAllocationFormModal
        isOpen={isAllocationModalOpen}
        onClose={() => {
          setIsAllocationModalOpen(false);
          setEditingAllocation(null);
        }}
        onSave={handleSaveAllocation}
        employees={employees}
        leaveTypes={leaveTypes}
        policies={policies}
        allocationRecord={editingAllocation}
        defaultPolicyId={selectedPolicy?.leavePolicyId}
        defaultLeaveTypeId={allocDefaultLeaveTypeId}
      />
    </>
  );
};
