"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Plus, Trash2, Check, Loader2, ArrowLeft, X, ShieldAlert, Sparkles, SlidersHorizontal, Calendar, RefreshCw } from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import {
  fetchYearEndProcesses,
  createYearEndProcessApi,
  deleteYearEndProcessApi,
  fetchLeaveTypes,
  fetchLeavePolicies,
} from "../api/settings.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";

interface YearEndProcessDetailViewProps {
  onBack: () => void;
}

interface YearEndProcess {
  processId: number;
  companyId: number;
  userId: number;
  leaveTypeId: number;
  leavePolicyId: number | null;
  year: number;
  closingBalance: number;
  carryForwardLeaves: number;
  encashedLeaves: number;
  lapsedLeaves: number;
  encashmentAmount: number | null;
  processedBy: number | null;
  processDate: string;
  remarks: string | null;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LeaveType {
  leaveTypeId: number;
  leaveName: string;
  leaveCode: string;
}

interface LeavePolicy {
  leavePolicyId: number;
  policyName: string;
  policyCode: string;
}

export const YearEndProcessDetailView: React.FC<YearEndProcessDetailViewProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewState, setViewState] = useState<"read" | "add">("read");

  const [processes, setProcesses] = useState<YearEndProcess[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<YearEndProcess | null>(null);

  // References
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);

  // Form State
  const [formUserId, setFormUserId] = useState<string>("");
  const [formLeaveTypeId, setFormLeaveTypeId] = useState<string>("");
  const [formLeavePolicyId, setFormLeavePolicyId] = useState<string>("");
  const [formYear, setFormYear] = useState<string>(new Date().getFullYear().toString());
  const [formClosingBalance, setFormClosingBalance] = useState<string>("0");
  const [formCarryForward, setFormCarryForward] = useState<string>("0");
  const [formEncashed, setFormEncashed] = useState<string>("0");
  const [formLapsed, setFormLapsed] = useState<string>("0");
  const [formEncashmentAmount, setFormEncashmentAmount] = useState<string>("");
  const [formRemarks, setFormRemarks] = useState<string>("");

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
      const [procRes, empList, typesRes, policiesRes] = await Promise.all([
        fetchYearEndProcesses(),
        getEmployees(),
        fetchLeaveTypes(),
        fetchLeavePolicies(),
      ]);

      if (empList) setEmployees(empList);
      if (typesRes.success && Array.isArray(typesRes.data)) setLeaveTypes(typesRes.data);
      if (policiesRes.success && Array.isArray(policiesRes.data)) setLeavePolicies(policiesRes.data);

      if (procRes.success && procRes.data) {
        setProcesses(procRes.data);
        if (procRes.data.length > 0) {
          const toSelect = selectId
            ? procRes.data.find((item: YearEndProcess) => item.processId === selectId) || procRes.data[0]
            : procRes.data[0];
          setSelectedProcess(toSelect);
        } else {
          setSelectedProcess(null);
        }
      }
    } catch (err: any) {
      setErrorMsg("Failed to load Year End Processes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectProcess = (proc: YearEndProcess) => {
    setSelectedProcess(proc);
    setViewState("read");
    setErrorMsg("");
  };

  const handleStartAdd = () => {
    setViewState("add");
    setFormUserId("");
    setFormLeaveTypeId("");
    setFormLeavePolicyId("");
    setFormYear(new Date().getFullYear().toString());
    setFormClosingBalance("0");
    setFormCarryForward("0");
    setFormEncashed("0");
    setFormLapsed("0");
    setFormEncashmentAmount("");
    setFormRemarks("");
    setErrorMsg("");
  };

  const handleCancel = () => {
    setViewState("read");
    setErrorMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formUserId) {
      setErrorMsg("Please select an Employee.");
      return;
    }
    if (!formLeaveTypeId) {
      setErrorMsg("Please select a Leave Type.");
      return;
    }
    if (!formYear) {
      setErrorMsg("Please enter a Year.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccessMsg("");

    const payload = {
      userId: Number(formUserId),
      leaveTypeId: Number(formLeaveTypeId),
      leavePolicyId: formLeavePolicyId ? Number(formLeavePolicyId) : null,
      year: Number(formYear),
      closingBalance: Number(formClosingBalance),
      carryForwardLeaves: Number(formCarryForward),
      encashedLeaves: Number(formEncashed),
      lapsedLeaves: Number(formLapsed),
      encashmentAmount: formEncashmentAmount ? Number(formEncashmentAmount) : null,
      remarks: formRemarks.trim() || null,
      status: true,
    };

    try {
      const res = await createYearEndProcessApi(payload);
      if (res.success && res.data) {
        setSaveSuccessMsg("Year End Process executed successfully!");
        setViewState("read");
        await loadData(res.data.processId);
      } else {
        throw new Error(res.error || "Failed to execute Year End Process.");
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
    if (!confirm("Are you sure you want to delete this process record?")) return;

    setErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const res = await deleteYearEndProcessApi(id);
      if (res.success) {
        setSaveSuccessMsg("Year End Process record deleted successfully!");
        const updatedList = processes.filter((item) => item.processId !== id);
        setProcesses(updatedList);
        if (selectedProcess?.processId === id) {
          if (updatedList.length > 0) {
            setSelectedProcess(updatedList[0]);
          } else {
            setSelectedProcess(null);
          }
        }
      } else {
        throw new Error(res.error || "Failed to delete record.");
      }
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while deleting.");
    }
  };

  // Helper lookups
  const getEmployeeName = (uId: number) => {
    const emp = employees.find((e) => String(e.id) === String(uId));
    return emp ? `${emp.name} (${emp.employeeCode})` : `Employee ID: ${uId}`;
  };

  const getLeaveTypeName = (ltId: number) => {
    const lt = leaveTypes.find((t) => t.leaveTypeId === ltId);
    return lt ? `${lt.leaveName} (${lt.leaveCode})` : `Leave Type ID: ${ltId}`;
  };

  const getPolicyName = (lpId: number | null) => {
    if (!lpId) return "-";
    const lp = leavePolicies.find((p) => p.leavePolicyId === lpId);
    return lp ? lp.policyName : `Policy ID: ${lpId}`;
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
          <span className="text-slate-900 font-bold">Year End Process</span>
        </div>

        {/* Add Button */}
        {viewState === "read" && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Execute Year End</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left List Column + Right Form/Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: List of Processed Year Ends */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Processed Records
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Loading...</span>
              </div>
            ) : processes.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">
                No processed years found
              </p>
            ) : (
              processes.map((proc) => {
                const isSelected = selectedProcess?.processId === proc.processId;
                const empName = employees.find((e) => String(e.id) === String(proc.userId))?.name || `Employee #${proc.userId}`;
                return (
                  <div
                    key={proc.processId}
                    onClick={() => handleSelectProcess(proc)}
                    className={`group w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate max-w-[150px]">{empName}</span>
                      <span className="text-[10px] text-slate-400">{proc.year} - {leaveTypes.find(lt => lt.leaveTypeId === proc.leaveTypeId)?.leaveCode || proc.leaveTypeId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, proc.processId)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all"
                        title="Delete record"
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

        {/* Right Side: Details or Add Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 relative min-h-[350px]">
          {viewState === "read" ? (
            selectedProcess ? (
              <div className="space-y-6">
                {/* Detail View Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Process Record details
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">
                    Processed Date: {new Date(selectedProcess.processDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Employee
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {getEmployeeName(selectedProcess.userId)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Year
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedProcess.year}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Leave Type
                    </span>
                    <p className="font-semibold text-slate-800 text-sm">
                      {getLeaveTypeName(selectedProcess.leaveTypeId)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Leave Policy
                    </span>
                    <p className="font-semibold text-slate-800 text-sm">
                      {getPolicyName(selectedProcess.leavePolicyId)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Closing Balance
                    </span>
                    <p className="font-bold text-slate-700 text-sm">
                      {selectedProcess.closingBalance}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Carry Forward
                    </span>
                    <p className="font-bold text-emerald-700 text-sm">
                      {selectedProcess.carryForwardLeaves}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Encashed Leaves
                    </span>
                    <p className="font-bold text-amber-700 text-sm">
                      {selectedProcess.encashedLeaves}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Lapsed Leaves
                    </span>
                    <p className="font-bold text-rose-700 text-sm">
                      {selectedProcess.lapsedLeaves}
                    </p>
                  </div>

                  {selectedProcess.encashmentAmount !== null && (
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                        Encashment Amount
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {selectedProcess.encashmentAmount}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1 md:col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Remarks
                    </span>
                    <p className="font-medium text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                      {selectedProcess.remarks || "No remarks provided"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-xs text-slate-400 font-semibold">
                No Year End process execution selected. Click "Execute Year End" to run a process.
              </div>
            )
          ) : (
            /* Execution Form */
            <form onSubmit={handleSave} className="space-y-6">
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Execute Year End Process
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
                    Run Process
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                {/* Employee Selection */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formUserId}
                    onChange={(e) => setFormUserId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary bg-white"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leave Type Selection */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Leave Type <span className="text-rose-500">*</span>
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

                {/* Leave Policy Selection */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Leave Policy
                  </label>
                  <select
                    value={formLeavePolicyId}
                    onChange={(e) => setFormLeavePolicyId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary bg-white"
                  >
                    <option value="">-- Select Leave Policy (Optional) --</option>
                    {leavePolicies.map((p) => (
                      <option key={p.leavePolicyId} value={p.leavePolicyId}>
                        {p.policyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Input */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max="2100"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Closing Balance */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Closing Balance <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formClosingBalance}
                    onChange={(e) => setFormClosingBalance(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Carry Forward */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Carry Forward Balance <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCarryForward}
                    onChange={(e) => setFormCarryForward(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Encashed Leaves */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Encashed Leaves <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formEncashed}
                    onChange={(e) => setFormEncashed(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Lapsed Leaves */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Lapsed Leaves <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formLapsed}
                    onChange={(e) => setFormLapsed(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Encashment Amount */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Encashment Amount (Amount Paid)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formEncashmentAmount}
                    onChange={(e) => setFormEncashmentAmount(e.target.value)}
                    placeholder="e.g. 1500.00"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="Enter any notes about this year-end run..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
