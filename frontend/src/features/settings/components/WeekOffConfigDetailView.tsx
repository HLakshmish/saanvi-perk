"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Edit2,
  Calendar,
  Check,
  X,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  WeekOffRecord,
  WeekOffRuleInput,
} from "../types/weekOff.types";
import {
  getWeekOffs,
  createWeekOff,
  updateWeekOff,
  deleteWeekOff,
} from "../api/weekOff.api";

interface WeekOffConfigDetailViewProps {
  onBack: () => void;
}

export const WeekOffConfigDetailView: React.FC<WeekOffConfigDetailViewProps> = ({
  onBack,
}) => {
  const [weekOffs, setWeekOffs] = useState<WeekOffRecord[]>([]);
  const [selectedWeekOff, setSelectedWeekOff] = useState<WeekOffRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewState, setViewState] = useState<"read" | "edit" | "add">("read");

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [rules, setRules] = useState<WeekOffRuleInput[]>([
    { frequency: "Every", dayOfWeek: "Sunday", duration: "All day" },
  ]);

  const loadData = async (selectId?: number) => {
    setIsLoading(true);
    try {
      const res = await getWeekOffs();
      if (res.success && res.data) {
        setWeekOffs(res.data);
        if (res.data.length > 0) {
          const toSelect = selectId
            ? res.data.find((w) => w.weekOffId === selectId) || res.data[0]
            : res.data[0];
          setSelectedWeekOff(toSelect);
          populateForm(toSelect);
        } else {
          setSelectedWeekOff(null);
        }
      }
    } catch (err) {
      console.error("Failed to load week-offs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateForm = (item: WeekOffRecord) => {
    setFormCode(item.code || "");
    setFormName(item.name || "");
    setRules(
      item.rules && item.rules.length > 0
        ? item.rules.map((r) => ({
            frequency: r.frequency as any,
            dayOfWeek: r.dayOfWeek as any,
            duration: r.duration as any,
          }))
        : [{ frequency: "Every", dayOfWeek: "Sunday", duration: "All day" }]
    );
  };

  const handleSelectWeekOff = (item: WeekOffRecord) => {
    if (viewState !== "read") {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setSelectedWeekOff(item);
    populateForm(item);
    setViewState("read");
  };

  const handleStartAdd = () => {
    setViewState("add");
    setFormCode("");
    setFormName("");
    setRules([
      { frequency: "Every", dayOfWeek: "Sunday", duration: "All day" },
    ]);
  };

  const handleStartEdit = () => {
    if (!selectedWeekOff) return;
    setViewState("edit");
    populateForm(selectedWeekOff);
  };

  const handleCancel = () => {
    setViewState("read");
    if (selectedWeekOff) {
      populateForm(selectedWeekOff);
    }
  };

  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      { frequency: "Every", dayOfWeek: "Saturday", duration: "All day" },
    ]);
  };

  const handleRemoveRule = (index: number) => {
    if (rules.length <= 1) {
      toast.error("At least one rule is required.");
      return;
    }
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRuleChange = (
    index: number,
    field: keyof WeekOffRuleInput,
    value: string
  ) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      toast.error("Please provide both policy code and name.");
      return;
    }
    if (rules.length === 0) {
      toast.error("Please add at least one week-off rule.");
      return;
    }

    setIsSaving(true);
    try {
      if (viewState === "add") {
        const res = await createWeekOff({
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          rules,
        });
        if (res.success && res.data) {
          toast.success("Week-off configuration created successfully!");
          await loadData(res.data.weekOffId);
          setViewState("read");
        } else {
          toast.error(res.error || "Failed to create week-off");
        }
      } else if (viewState === "edit" && selectedWeekOff) {
        const res = await updateWeekOff(selectedWeekOff.weekOffId, {
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          rules,
        });
        if (res.success && res.data) {
          toast.success("Week-off configuration updated successfully!");
          await loadData(selectedWeekOff.weekOffId);
          setViewState("read");
        } else {
          toast.error(res.error || "Failed to update week-off");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWeekOff) return;
    if (!confirm(`Are you sure you want to delete "${selectedWeekOff.name}"?`)) return;

    setIsSaving(true);
    try {
      const res = await deleteWeekOff(selectedWeekOff.weekOffId);
      if (res.success) {
        toast.success("Week-off configuration deleted.");
        await loadData();
        setViewState("read");
      } else {
        toast.error(res.error || "Failed to delete week-off");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = weekOffs.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Week-off Configuration
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Create and manage recurring week-off schedules and rules.
            </p>
          </div>
        </div>

        {viewState === "read" && (
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Week-Off</span>
          </button>
        )}
      </div>

      {/* Main Split Layout: Left List + Right Details / Form Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Column: Master List */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs flex flex-col space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search policies..."
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
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Policies Found</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                  Click &ldquo;Add Week-Off&rdquo; to create one.
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected =
                  viewState !== "add" &&
                  selectedWeekOff?.weekOffId === item.weekOffId;
                return (
                  <div
                    key={item.weekOffId}
                    onClick={() => handleSelectWeekOff(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none group ${
                      isSelected
                        ? "bg-brand-primary-light border-brand-primary text-brand-primary shadow-2xs"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider inline-block mb-1 ${
                            isSelected
                              ? "bg-brand-primary text-brand-btn-text"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.code}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">
                          {item.rules?.length || 0} Rule{(item.rules?.length || 0) !== 1 ? "s" : ""}
                        </p>
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

        {/* Right Column: Details or Edit/Add Form Pane */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
          {viewState === "read" && selectedWeekOff ? (
            /* READ VIEW */
            <div className="space-y-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-brand-primary text-brand-btn-text tracking-wider">
                      {selectedWeekOff.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ID #{selectedWeekOff.weekOffId}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {selectedWeekOff.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Active Rules Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Configured Week-Off Rules ({selectedWeekOff.rules?.length || 0})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedWeekOff.rules?.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-3xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-primary-light text-brand-primary border border-brand-primary/10 flex items-center justify-center font-black text-xs shrink-0">
                          {rule.dayOfWeek.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">
                            {rule.dayOfWeek}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            {rule.frequency} Occurrence · {rule.duration}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Off Day
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 text-xs text-slate-500 font-medium">
                Employees assigned to this policy will automatically have these days recorded as off-days in attendance and leave calculations.
              </div>
            </div>
          ) : viewState === "add" || viewState === "edit" ? (
            /* ADD / EDIT FORM */
            <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {viewState === "add"
                        ? "Create Week-Off Policy"
                        : `Edit Policy: ${selectedWeekOff?.name}`}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Configure code, name, and recurring rule schedules.
                    </p>
                  </div>
                </div>

                {/* Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Policy Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WO-STD"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold uppercase shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Policy Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Standard Weekend (Sun + 2nd/4th Sat)"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold shadow-2xs"
                    />
                  </div>
                </div>

                {/* Rules Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Week-Off Rules <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="text-brand-primary hover:underline font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-2.5 shadow-3xs"
                      >
                        <div className="w-7 h-7 rounded-xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>

                        {/* Frequency */}
                        <div className="w-full sm:w-1/3">
                          <select
                            value={rule.frequency}
                            onChange={(e) =>
                              handleRuleChange(idx, "frequency", e.target.value)
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none shadow-2xs"
                          >
                            {[
                              "Every",
                              "First",
                              "Second",
                              "Third",
                              "Fourth",
                              "Fifth",
                            ].map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Day of Week */}
                        <div className="w-full sm:w-1/3">
                          <select
                            value={rule.dayOfWeek}
                            onChange={(e) =>
                              handleRuleChange(idx, "dayOfWeek", e.target.value)
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none shadow-2xs"
                          >
                            {[
                              "Sunday",
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                            ].map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Duration */}
                        <div className="w-full sm:w-1/3">
                          <select
                            value={rule.duration}
                            onChange={(e) =>
                              handleRuleChange(idx, "duration", e.target.value)
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none shadow-2xs"
                          >
                            {[
                              "All day",
                              "First half",
                              "Second half",
                            ].map((dur) => (
                              <option key={dur} value={dur}>
                                {dur}
                              </option>
                            ))}
                          </select>
                        </div>

                        {rules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRule(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                            title="Remove Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
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
                  <span>{viewState === "add" ? "Create Policy" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <SlidersHorizontal className="w-10 h-10 text-slate-300 mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">Select a Policy</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Select a week-off configuration from the left pane to view or edit its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
