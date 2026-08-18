"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { Employee } from "@/features/employees/types/employees.types";

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

interface LeaveAccumulationRecord {
  leaveAccumulationId: number;
  companyId: number;
  userId: number;
  leaveTypeId: number;
  leavePolicyId: number | null;
  accumulationDate: string;
  numberOfLeaves: number;
  isOpeningBalance: boolean;
  accumulationPeriodFrom: string;
  accumulationPeriodTo: string;
  availabilityPeriodFrom: string;
  availabilityPeriodTo: string;
  note: string | null;
  status: boolean;
}

interface LeaveAllocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<boolean>;
  employees: Employee[];
  leaveTypes: LeaveType[];
  policies: LeavePolicy[];
  allocationRecord: LeaveAccumulationRecord | null; // Null for create, record for edit
  defaultPolicyId?: number | null;
  defaultLeaveTypeId?: number | null;
}

export const LeaveAllocationFormModal: React.FC<LeaveAllocationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  leaveTypes,
  policies,
  allocationRecord,
  defaultPolicyId,
  defaultLeaveTypeId,
}) => {
  const [userId, setUserId] = useState<string>("");
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [leavePolicyId, setLeavePolicyId] = useState<string>("");
  const [numberOfLeaves, setNumberOfLeaves] = useState<string>("");
  const [accumulationDate, setAccumulationDate] = useState<string>("");
  const [accumulationPeriodFrom, setAccumulationPeriodFrom] = useState<string>("");
  const [accumulationPeriodTo, setAccumulationPeriodTo] = useState<string>("");
  const [availabilityPeriodFrom, setAvailabilityPeriodFrom] = useState<string>("");
  const [availabilityPeriodTo, setAvailabilityPeriodTo] = useState<string>("");
  const [isOpeningBalance, setIsOpeningBalance] = useState<boolean>(false);
  const [status, setStatus] = useState<boolean>(true);
  const [note, setNote] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search filter for employees selection
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (allocationRecord) {
        setUserId(String(allocationRecord.userId));
        setLeaveTypeId(String(allocationRecord.leaveTypeId));
        setLeavePolicyId(allocationRecord.leavePolicyId ? String(allocationRecord.leavePolicyId) : "");
        setNumberOfLeaves(String(allocationRecord.numberOfLeaves));
        setAccumulationDate(allocationRecord.accumulationDate.split("T")[0]);
        setAccumulationPeriodFrom(allocationRecord.accumulationPeriodFrom.split("T")[0]);
        setAccumulationPeriodTo(allocationRecord.accumulationPeriodTo.split("T")[0]);
        setAvailabilityPeriodFrom(allocationRecord.availabilityPeriodFrom.split("T")[0]);
        setAvailabilityPeriodTo(allocationRecord.availabilityPeriodTo.split("T")[0]);
        setIsOpeningBalance(allocationRecord.isOpeningBalance);
        setStatus(allocationRecord.status);
        setNote(allocationRecord.note || "");
        
        // Find matching employee to prepopulate search text
        const emp = employees.find((e) => String(e.id) === String(allocationRecord.userId));
        setEmployeeSearch(emp ? `${emp.name} (${emp.employeeCode})` : "");
      } else {
        setUserId("");
        setEmployeeSearch("");
        setLeaveTypeId(defaultLeaveTypeId ? String(defaultLeaveTypeId) : leaveTypes[0]?.leaveTypeId ? String(leaveTypes[0].leaveTypeId) : "");
        setLeavePolicyId(defaultPolicyId ? String(defaultPolicyId) : "");
        setNumberOfLeaves("");
        
        const todayStr = new Date().toISOString().split("T")[0];
        setAccumulationDate(todayStr);
        
        // Default periods: current year
        const currentYear = new Date().getFullYear();
        setAccumulationPeriodFrom(`${currentYear}-01-01`);
        setAccumulationPeriodTo(`${currentYear}-12-31`);
        setAvailabilityPeriodFrom(`${currentYear}-01-01`);
        setAvailabilityPeriodTo(`${currentYear}-12-31`);
        
        setIsOpeningBalance(false);
        setStatus(true);
        setNote("");
      }
      setErrorMsg(null);
    }
  }, [isOpen, allocationRecord, defaultPolicyId, defaultLeaveTypeId, leaveTypes, employees]);

  useEffect(() => {
    if (!employeeSearch.trim()) {
      setFilteredEmployees(employees);
    } else {
      const q = employeeSearch.toLowerCase();
      setFilteredEmployees(
        employees.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.employeeCode.toLowerCase().includes(q) ||
            (e.email && e.email.toLowerCase().includes(q))
        )
      );
    }
  }, [employeeSearch, employees]);

  if (!isOpen) return null;

  const formatDateToISO = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00Z").toISOString();
  };

  const handleSelectEmployee = (emp: Employee) => {
    setUserId(String(emp.id));
    setEmployeeSearch(`${emp.name} (${emp.employeeCode})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMsg("Please select an employee.");
      return;
    }
    if (!leaveTypeId) {
      setErrorMsg("Please select a leave type.");
      return;
    }
    if (!numberOfLeaves || isNaN(Number(numberOfLeaves)) || Number(numberOfLeaves) < 0) {
      setErrorMsg("Please enter a valid number of leaves.");
      return;
    }
    if (!accumulationDate) {
      setErrorMsg("Please select an accumulation date.");
      return;
    }
    if (!accumulationPeriodFrom || !accumulationPeriodTo) {
      setErrorMsg("Please select accumulation period dates.");
      return;
    }
    if (!availabilityPeriodFrom || !availabilityPeriodTo) {
      setErrorMsg("Please select availability period dates.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: any = {
      userId: Number(userId),
      leaveTypeId: Number(leaveTypeId),
      leavePolicyId: leavePolicyId ? Number(leavePolicyId) : null,
      numberOfLeaves: Number(numberOfLeaves),
      accumulationDate: formatDateToISO(accumulationDate),
      accumulationPeriodFrom: formatDateToISO(accumulationPeriodFrom),
      accumulationPeriodTo: formatDateToISO(accumulationPeriodTo),
      availabilityPeriodFrom: formatDateToISO(availabilityPeriodFrom),
      availabilityPeriodTo: formatDateToISO(availabilityPeriodTo),
      isOpeningBalance,
      status,
      note: note.trim() || null,
    };

    try {
      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving leave allocation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-[#013e37] uppercase tracking-wider">
              {allocationRecord ? "Edit Leave Allocation" : "Allocate Leaves to Employee"}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
              Assign leave balance to employee account
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Employee Selector */}
            <div className="space-y-1 relative md:col-span-2">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Select Employee <span className="text-rose-500">*</span>
              </label>
              
              <input
                type="text"
                placeholder="Search employee by name or code..."
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  if (userId) setUserId(""); // Clear selected if typing
                }}
                disabled={!!allocationRecord}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
              />

              {/* Dropdown search results */}
              {!allocationRecord && !userId && employeeSearch.trim().length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100">
                  {filteredEmployees.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 font-semibold">
                      No matching employees found
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="font-bold text-slate-800">
                          {emp.name} <span className="text-slate-400 text-[10px] font-semibold">({emp.employeeCode})</span>
                        </div>
                        <div className="text-slate-500 font-medium text-[10px]">
                          {emp.department} • {emp.designation}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Leave Type Select */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Leave Type <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                disabled={!!allocationRecord}
                className="w-full border border-slate-300 bg-white rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              >
                <option value="" disabled>Select Leave Type</option>
                {leaveTypes.map((t) => (
                  <option key={t.leaveTypeId} value={t.leaveTypeId}>
                    {t.leaveName} ({t.leaveCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Policy Select */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Leave Policy (Optional)
              </label>
              <select
                value={leavePolicyId}
                onChange={(e) => setLeavePolicyId(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              >
                <option value="">None / Standalone Allocation</option>
                {policies.map((p) => (
                  <option key={p.leavePolicyId} value={p.leavePolicyId}>
                    {p.policyName} ({p.policyCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Leaves */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Number of Leaves <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 12 or 7.5"
                value={numberOfLeaves}
                onChange={(e) => setNumberOfLeaves(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Accumulation Date */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Accumulation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={accumulationDate}
                onChange={(e) => setAccumulationDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Accumulation Period From */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Accumulation Period From <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={accumulationPeriodFrom}
                onChange={(e) => setAccumulationPeriodFrom(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Accumulation Period To */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Accumulation Period To <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={accumulationPeriodTo}
                onChange={(e) => setAccumulationPeriodTo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Availability Period From */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Availability Period From <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={availabilityPeriodFrom}
                onChange={(e) => setAvailabilityPeriodFrom(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Availability Period To */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Availability Period To <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={availabilityPeriodTo}
                onChange={(e) => setAvailabilityPeriodTo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Opening Balance checkbox */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Opening Balance
              </label>
              <div className="flex items-center gap-2 py-1.5 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  id="modalIsOpeningBalance"
                  checked={isOpeningBalance}
                  onChange={(e) => setIsOpeningBalance(e.target.checked)}
                  className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                />
                <label htmlFor="modalIsOpeningBalance" className="cursor-pointer">Mark as Opening Balance</label>
              </div>
            </div>

            {/* Status checkbox */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Status
              </label>
              <div className="flex items-center gap-2 py-1.5 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  id="modalStatus"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="rounded-sm text-[#013e37] focus:ring-[#013e37]"
                />
                <label htmlFor="modalStatus" className="cursor-pointer">Active</label>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-100">
              <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                Note / Remarks
              </label>
              <textarea
                placeholder="Enter any note or reason for this allocation..."
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#013e37] hover:bg-[#012d28] disabled:bg-[#013e37]/70 text-[#ffefb3] rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffefb3]" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {allocationRecord ? "Update Allocation" : "Allocate Leaves"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
