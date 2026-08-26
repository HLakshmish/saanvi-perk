"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Edit2,
  Calendar,
  UserCheck,
  Check,
  X,
  Loader2,
  ChevronRight,
  Users,
} from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import {
  WeekOffRecord,
  WeekOffAssignRecord,
} from "../types/weekOff.types";
import {
  getWeekOffs,
  getAssignedWeekOffs,
  assignWeekOff,
} from "../api/weekOff.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";

interface AssignWeekOffDetailViewProps {
  onBack: () => void;
}

export const AssignWeekOffDetailView: React.FC<AssignWeekOffDetailViewProps> = ({
  onBack,
}) => {
  const [assignments, setAssignments] = useState<WeekOffAssignRecord[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<WeekOffAssignRecord | null>(null);
  const [weekOffs, setWeekOffs] = useState<WeekOffRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [empSearchQuery, setEmpSearchQuery] = useState("");
  const [viewState, setViewState] = useState<"read" | "add">("read");

  // Form State
  const [formWeekOffId, setFormWeekOffId] = useState<number | "">("");
  const [formSelectedUserIds, setFormSelectedUserIds] = useState<number[]>([]);
  const [formStartDate, setFormStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formEndDate, setFormEndDate] = useState<string>("");

  const loadData = async (selectId?: number) => {
    setIsLoading(true);
    try {
      const [assignRes, weekOffRes, empRes] = await Promise.all([
        getAssignedWeekOffs(),
        getWeekOffs(),
        getEmployees(),
      ]);

      if (weekOffRes.success && weekOffRes.data) {
        setWeekOffs(weekOffRes.data);
      }
      if (Array.isArray(empRes)) {
        setEmployees(empRes);
      }
      if (assignRes.success && assignRes.data) {
        setAssignments(assignRes.data);
        if (assignRes.data.length > 0) {
          const toSelect = selectId
            ? assignRes.data.find((a) => a.weekOffAssignId === selectId) || assignRes.data[0]
            : assignRes.data[0];
          setSelectedAssignment(toSelect);
        } else {
          setSelectedAssignment(null);
        }
      }
    } catch (err) {
      console.error("Failed to load assign week off data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectAssignment = (item: WeekOffAssignRecord) => {
    if (viewState !== "read") {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setSelectedAssignment(item);
    setViewState("read");
  };

  const handleStartAdd = () => {
    setViewState("add");
    setFormWeekOffId(weekOffs.length > 0 ? weekOffs[0].weekOffId : "");
    setFormSelectedUserIds([]);
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setEmpSearchQuery("");
  };

  const handleCancel = () => {
    setViewState("read");
  };

  const handleSelectAllEmployees = () => {
    const visibleEmpIds = filteredEmployeesForModal.map((e) => Number(e.id));
    const allSelected = visibleEmpIds.every((id) => formSelectedUserIds.includes(id));

    if (allSelected) {
      setFormSelectedUserIds((prev) => prev.filter((id) => !visibleEmpIds.includes(id)));
    } else {
      setFormSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleEmpIds])));
    }
  };

  const handleToggleUser = (id: number) => {
    setFormSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWeekOffId) {
      toast.error("Please select a week-off policy.");
      return;
    }
    if (formSelectedUserIds.length === 0) {
      toast.error("Please select at least one employee.");
      return;
    }
    if (!formStartDate) {
      toast.error("Please select an effective start date.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await assignWeekOff({
        weekOffId: Number(formWeekOffId),
        userIds: formSelectedUserIds,
        startDate: new Date(formStartDate).toISOString(),
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
      });

      if (res.success) {
        toast.success("Week-off policy assigned to selected employees!");
        await loadData();
        setViewState("read");
      } else {
        toast.error(res.error || "Failed to assign week-off");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const name = `${a.user?.firstName || ""} ${a.user?.lastName || ""}`.toLowerCase();
    const code = a.user?.employeeCode?.toLowerCase() || "";
    const policyName = a.weekOff?.name?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || code.includes(q) || policyName.includes(q);
  });

  const filteredEmployeesForModal = employees.filter((emp) => {
    const q = empSearchQuery.toLowerCase();
    const name = emp.name?.toLowerCase() || "";
    const code = emp.employeeCode?.toLowerCase() || "";
    const email = emp.email?.toLowerCase() || "";
    return name.includes(q) || code.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-primary/15 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-brand-primary tracking-tight">
              Assign Week-off
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Assign recurring week-off schedules to employees.
            </p>
          </div>
        </div>

        {viewState === "read" && (
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Assign to Employees</span>
          </button>
        )}
      </div>

      {/* Main Split Layout: Left List + Right Details / Form Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Column: Assignments Master List */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs flex flex-col space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse space-y-2"
                  >
                    <div className="h-3.5 bg-slate-200 rounded w-28" />
                    <div className="h-2.5 bg-slate-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Assignments</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                  Click &ldquo;Assign to Employees&rdquo; to create one.
                </p>
              </div>
            ) : (
              filteredAssignments.map((item, index) => {
                const isSelected =
                  viewState !== "add" &&
                  selectedAssignment?.weekOffAssignId === item.weekOffAssignId;
                const empName = item.user
                  ? `${item.user.firstName} ${item.user.lastName || ""}`.trim()
                  : `Employee #${item.userId}`;

                return (
                  <div
                    key={item.weekOffAssignId ? `assign-${item.weekOffAssignId}` : `assign-${index}`}
                    onClick={() => handleSelectAssignment(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none group ${
                      isSelected
                        ? "bg-brand-primary-light border-brand-primary text-brand-primary shadow-2xs"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight truncate">
                          {empName}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          {item.weekOff?.name || "Standard Policy"}
                        </p>
                        <span className="text-[9px] font-bold text-brand-primary uppercase mt-1 inline-block">
                          {item.weekOff?.code}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 mt-1 transition-transform ${
                          isSelected
                            ? "text-brand-primary translate-x-0.5"
                            : "text-slate-300 group-hover:text-slate-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Details or Assign Form Pane */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
          {viewState === "read" && selectedAssignment ? (
            /* READ VIEW */
            <div className="space-y-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-sm shadow-xs">
                    {selectedAssignment.user
                      ? selectedAssignment.user.firstName.charAt(0)
                      : "E"}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {selectedAssignment.user
                        ? `${selectedAssignment.user.firstName} ${selectedAssignment.user.lastName || ""}`.trim()
                        : `Employee #${selectedAssignment.userId}`}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      {selectedAssignment.user?.employeeCode || `User ID: ${selectedAssignment.userId}`}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  Active
                </span>
              </div>

              {/* Policy & Duration Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Policy
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {selectedAssignment.weekOff?.name || "Standard Policy"}
                  </span>
                  <span className="text-[10px] font-extrabold text-brand-primary uppercase">
                    {selectedAssignment.weekOff?.code}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Effective Period
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {selectedAssignment.startDate
                      ? new Date(selectedAssignment.startDate).toLocaleDateString("en-GB").replace(/\//g, "-")
                      : "N/A"}{" "}
                    <span className="text-slate-400 font-normal">to</span>{" "}
                    {selectedAssignment.endDate
                      ? new Date(selectedAssignment.endDate).toLocaleDateString("en-GB").replace(/\//g, "-")
                      : "Ongoing"}
                  </span>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Active Off-Day Rules ({selectedAssignment.weekOff?.rules?.length || 0})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAssignment.weekOff?.rules?.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">
                          {rule.dayOfWeek}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          {rule.frequency} Occurrence · {rule.duration}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Off Day
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : viewState === "add" ? (
            /* ASSIGN FORM PANE */
            <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Assign Week-off to Employees
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Select a policy, date range, and choose target employees.
                  </p>
                </div>

                {/* Policy Select & Dates */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Select Week-off Policy <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formWeekOffId}
                      onChange={(e) => setFormWeekOffId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-slate-900 bg-white shadow-2xs"
                    >
                      <option value="" disabled>
                        -- Select Policy --
                      </option>
                      {weekOffs.map((w) => (
                        <option key={w.weekOffId} value={w.weekOffId}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Start Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Employees Multi-Select Area */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Select Employees ({formSelectedUserIds.length} Selected){" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="relative min-w-[180px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Filter employees..."
                          value={empSearchQuery}
                          onChange={(e) => setEmpSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSelectAllEmployees}
                        className="text-brand-primary hover:underline font-extrabold text-xs cursor-pointer whitespace-nowrap"
                      >
                        {filteredEmployeesForModal.every((e) =>
                          formSelectedUserIds.includes(Number(e.id))
                        )
                          ? "Deselect Filtered"
                          : "Select All Filtered"}
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 p-1.5 custom-scrollbar bg-slate-50/50">
                    {filteredEmployeesForModal.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">
                        No employees matching filter.
                      </p>
                    ) : (
                      filteredEmployeesForModal.map((emp, index) => {
                        const empId = Number(emp.id);
                        const isChecked = formSelectedUserIds.includes(empId);
                        const empName = emp.name || `Employee #${empId}`;
                        return (
                          <label
                            key={emp.id ? `emp-${emp.id}` : `emp-${index}`}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer select-none transition-colors ${
                              isChecked
                                ? "bg-brand-primary-light/60 border border-brand-primary/20"
                                : "hover:bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleUser(empId)}
                              className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-extrabold text-xs text-slate-900 block truncate leading-tight">
                                {empName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {emp.employeeCode || emp.email || `ID: ${empId}`}
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-extrabold text-brand-btn-text bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Assign Policy</span>
                </button>
              </div>
            </form>
          ) : (
            /* EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">Select an Assignment</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Select an assigned employee from the left pane to view their week-off schedule.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
