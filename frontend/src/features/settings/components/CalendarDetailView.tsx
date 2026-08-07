"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import {
  CalendarRecord,
  HolidayRecord,
  getCalendars,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/features/organization/api/calendar.api";

interface CalendarDetailViewProps {
  onBackToOrganization: () => void;
}

interface HolidayRowInput {
  id: string;
  holidayName: string;
  startDate: string;
  endDate: string;
}

export const CalendarDetailView: React.FC<CalendarDetailViewProps> = ({
  onBackToOrganization,
}) => {
  const [calendars, setCalendars] = useState<CalendarRecord[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarRecord | null>(null);
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-Page Form Modes (No Popups)
  const [mode, setMode] = useState<"view" | "add-calendar" | "edit-calendar">("view");
  const [showInlineAddHoliday, setShowInlineAddHoliday] = useState(false);

  // Holiday Inline Editing State
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null);
  const [editHolName, setEditHolName] = useState("");
  const [editHolStartDate, setEditHolStartDate] = useState("");
  const [editHolEndDate, setEditHolEndDate] = useState("");

  // Calendar form inputs
  const [calCode, setCalCode] = useState("");
  const [calName, setCalName] = useState("");
  const [calRemarks, setCalRemarks] = useState("");

  // Multiple Holiday Row Inputs
  const [holidayRows, setHolidayRows] = useState<HolidayRowInput[]>([
    { id: "1", holidayName: "", startDate: "", endDate: "" },
  ]);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await getCalendars();
    setIsLoading(false);

    if (res.success && res.data) {
      setCalendars(res.data);
      if (res.data.length > 0) {
        setSelectedCalendar(res.data[0]);
        loadHolidays(res.data[0].calendarId);
      } else {
        setSelectedCalendar(null);
        setHolidays([]);
      }
    } else {
      setCalendars([]);
      setSelectedCalendar(null);
      setHolidays([]);
    }
  };

  const loadHolidays = async (calId: number) => {
    const res = await getHolidays(calId);
    if (res.success && res.data) {
      const sorted = [...res.data].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      setHolidays(sorted);
    } else {
      setHolidays([]);
    }
  };

  const handleSelectCalendar = (cal: CalendarRecord) => {
    setSelectedCalendar(cal);
    setMode("view");
    setShowInlineAddHoliday(false);
    setEditingHolidayId(null);
    loadHolidays(cal.calendarId);
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calCode || !calName) return;

    setIsLoading(true);
    const res = await createCalendar({
      calendarCode: calCode.toUpperCase(),
      calendarName: calName,
      remarks: calRemarks,
    });
    setIsLoading(false);

    if (res.success && res.data) {
      setCalCode("");
      setCalName("");
      setCalRemarks("");
      setMode("view");
      await loadCalendars();
    } else {
      setErrorMsg(res.error || "Failed to create calendar");
    }
  };

  const handleUpdateCalendar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCalendar) return;

    setIsLoading(true);
    const res = await updateCalendar(selectedCalendar.calendarId, {
      calendarCode: calCode,
      calendarName: calName,
      remarks: calRemarks,
    });
    setIsLoading(false);

    if (res.success) {
      setMode("view");
      await loadCalendars();
    } else {
      setErrorMsg(res.error || "Failed to update calendar");
    }
  };

  const handleDeleteCalendar = async () => {
    if (!selectedCalendar) return;
    if (!confirm(`Are you sure you want to delete "${selectedCalendar.calendarName}"?`)) return;

    setIsLoading(true);
    const res = await deleteCalendar(selectedCalendar.calendarId);
    setIsLoading(false);

    if (res.success) {
      setMode("view");
      await loadCalendars();
    } else {
      setErrorMsg(res.error || "Failed to delete calendar");
    }
  };

  // Dynamic Multiple Holiday Row Handlers
  const handleAddHolidayRow = () => {
    setHolidayRows((prev) => [
      ...prev,
      { id: String(Date.now()), holidayName: "", startDate: "", endDate: "" },
    ]);
  };

  const handleRemoveHolidayRow = (id: string) => {
    if (holidayRows.length === 1) return;
    setHolidayRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleHolidayRowChange = (id: string, field: keyof HolidayRowInput, value: string) => {
    setHolidayRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleBatchCreateHolidays = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendar) return;

    const validRows = holidayRows.filter((r) => r.holidayName.trim() && r.startDate);
    if (validRows.length === 0) {
      setErrorMsg("Please fill in at least one holiday name and start date.");
      return;
    }

    setIsLoading(true);
    try {
      const promises = validRows.map((r) => {
        const startObj = new Date(r.startDate);
        const endObj = r.endDate ? new Date(r.endDate) : startObj;
        const code = r.holidayName.substring(0, 3).toUpperCase();
        return createHoliday({
          calendarId: selectedCalendar.calendarId,
          holidayCode: code,
          holidayName: r.holidayName,
          startDate: startObj.toISOString(),
          endDate: endObj.toISOString(),
          holidayType: "HOLIDAY",
        });
      });

      await Promise.all(promises);
      setIsLoading(false);
      setShowInlineAddHoliday(false);
      setHolidayRows([{ id: "1", holidayName: "", startDate: "", endDate: "" }]);
      loadHolidays(selectedCalendar.calendarId);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg("Failed to save holiday list.");
    }
  };

  // Single Holiday Editing Handlers
  const handleStartEditHoliday = (h: HolidayRecord) => {
    setEditingHolidayId(h.holidayId);
    setEditHolName(h.holidayName);
    try {
      const s = new Date(h.startDate).toISOString().split("T")[0];
      const e = new Date(h.endDate).toISOString().split("T")[0];
      setEditHolStartDate(s);
      setEditHolEndDate(e);
    } catch (err) {
      setEditHolStartDate("");
      setEditHolEndDate("");
    }
  };

  const handleSaveEditHoliday = async (id: number) => {
    if (!selectedCalendar || !editHolName || !editHolStartDate) return;

    const sObj = new Date(editHolStartDate);
    const eObj = editHolEndDate ? new Date(editHolEndDate) : sObj;

    setIsLoading(true);
    const res = await updateHoliday(id, {
      holidayName: editHolName,
      startDate: sObj.toISOString(),
      endDate: eObj.toISOString(),
    });
    setIsLoading(false);

    if (res.success) {
      setEditingHolidayId(null);
      loadHolidays(selectedCalendar.calendarId);
    } else {
      setErrorMsg(res.error || "Failed to update holiday");
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!confirm("Remove this holiday?")) return;
    const res = await deleteHoliday(id);
    if (res.success && selectedCalendar) {
      loadHolidays(selectedCalendar.calendarId);
    }
  };

  const filteredCalendars = calendars.filter((c) =>
    c.calendarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.calendarCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateWithDay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        weekday: "short",
      }).replace(/(\w+), (\d+ \w+ \d+)/, "$2 , $1");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans">
      {/* ─── Breadcrumb & Top Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <button
            onClick={onBackToOrganization}
            className="text-slate-900 font-bold hover:text-blue-600 transition-colors cursor-pointer"
          >
            Organization Masters
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 font-medium">Calendar</span>
        </div>

        {/* Right Action: + Add Calendar */}
        {mode !== "add-calendar" && (
          <button
            onClick={() => {
              setCalCode("");
              setCalName("");
              setCalRemarks("");
              setMode("add-calendar");
            }}
            className="px-4 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Calendar</span>
          </button>
        )}
      </div>

      {/* ─── Main 2-Column Split Body (In-Page) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs min-h-[500px] flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: List of Calendars */}
        <div className="w-full md:w-72 border-r border-slate-200/80 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <p className="text-xs font-semibold text-slate-400">List of Calendars</p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading...</span>
              </div>
            ) : filteredCalendars.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No calendars found
              </div>
            ) : (
              filteredCalendars.map((cal) => {
                const isSelected = selectedCalendar?.calendarId === cal.calendarId && mode !== "add-calendar";
                return (
                  <button
                    key={cal.calendarId}
                    onClick={() => handleSelectCalendar(cal)}
                    className={`w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/50 text-blue-600 border-l-4 border-blue-600 pl-3 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{cal.calendarName}</span>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: In-Page Content / Details / Forms */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-white">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: IN-PAGE ADD NEW CALENDAR FORM */}
          {mode === "add-calendar" ? (
            <form onSubmit={handleCreateCalendar} className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Add New Calendar
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold shadow-xs"
                  >
                    Save Calendar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Code Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. IND"
                    value={calCode}
                    onChange={(e) => setCalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Calendar Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={calName}
                    onChange={(e) => setCalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={calRemarks}
                  onChange={(e) => setCalRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </form>
          ) : selectedCalendar ? (
            /* MODE 2: CALENDAR DETAILS VIEW & INLINE EDITING */
            <div className="space-y-6">
              {/* Header: NAME / UPPERCASE TITLE & Edit Details */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {mode === "edit-calendar" ? selectedCalendar.calendarName : "NAME"}
                </h2>

                {mode !== "edit-calendar" && (
                  <button
                    onClick={() => {
                      setCalCode(selectedCalendar.calendarCode);
                      setCalName(selectedCalendar.calendarName);
                      setCalRemarks(selectedCalendar.remarks || "");
                      setMode("edit-calendar");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                )}
              </div>

              {/* Fields: EDIT MODE MATCHING UPLOADED SCREENSHOT */}
              {mode === "edit-calendar" ? (
                <div className="space-y-8 animate-fade-in pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        <span className="text-red-500 font-bold mr-1">*</span>Code Name
                      </label>
                      <input
                        type="text"
                        value={calCode}
                        onChange={(e) => setCalCode(e.target.value)}
                        className="w-full border-b border-slate-300 focus:border-blue-600 bg-transparent py-1 text-sm font-semibold text-slate-900 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        <span className="text-red-500 font-bold mr-1">*</span>Calendar Name
                      </label>
                      <input
                        type="text"
                        value={calName}
                        onChange={(e) => setCalName(e.target.value)}
                        className="w-full border-b border-slate-300 focus:border-blue-600 bg-transparent py-1 text-sm font-semibold text-slate-900 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Remarks</label>
                    <input
                      type="text"
                      value={calRemarks}
                      onChange={(e) => setCalRemarks(e.target.value)}
                      className="w-full border-b border-slate-300 focus:border-blue-600 bg-transparent py-1 text-xs text-slate-900 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Bottom Action Buttons Row Matching Screenshot */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleDeleteCalendar}
                      className="px-5 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("view")}
                      className="px-5 py-1.5 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateCalendar()}
                      className="px-6 py-1.5 rounded-lg bg-[#0066ff] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Code Name</p>
                      <p className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">
                        {selectedCalendar.calendarCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Calendar Name</p>
                      <p className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">
                        {selectedCalendar.calendarName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Remarks</p>
                    <p className="text-xs font-medium text-slate-700 border-b border-slate-200 pb-2 min-h-[24px]">
                      {selectedCalendar.remarks || "—"}
                    </p>
                  </div>
                </>
              )}

              {/* ─── Holidays Section (Visible in View Mode) ─── */}
              {mode !== "edit-calendar" && (
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                      Holidays - {holidays.length}
                    </h3>
                    <button
                      onClick={() => {
                        setHolidayRows([{ id: "1", holidayName: "", startDate: "", endDate: "" }]);
                        setShowInlineAddHoliday(!showInlineAddHoliday);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New</span>
                    </button>
                  </div>

                  {/* MULTI-ROW HOLIDAY ADD FORM (IN-PAGE) */}
                  {showInlineAddHoliday && (
                    <form onSubmit={handleBatchCreateHolidays} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <p className="text-xs font-bold text-slate-800">Add Multiple Holidays List</p>
                        <button
                          type="button"
                          onClick={handleAddHolidayRow}
                          className="text-xs font-bold text-[#0066ff] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Row</span>
                        </button>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {holidayRows.map((row, idx) => (
                          <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                            <div className="sm:col-span-4">
                              <label className="text-[10px] font-bold text-slate-600 block">Holiday Name *</label>
                              <input
                                type="text"
                                placeholder={`e.g. ${idx === 0 ? "Republic Day" : "Good Friday"}`}
                                value={row.holidayName}
                                onChange={(e) => handleHolidayRowChange(row.id, "holidayName", e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                                required
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[10px] font-bold text-slate-600 block">Start Date *</label>
                              <input
                                type="date"
                                value={row.startDate}
                                onChange={(e) => handleHolidayRowChange(row.id, "startDate", e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-900"
                                required
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[10px] font-bold text-slate-600 block">End Date</label>
                              <input
                                type="date"
                                value={row.endDate}
                                onChange={(e) => handleHolidayRowChange(row.id, "endDate", e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-900"
                              />
                            </div>
                            <div className="sm:col-span-2 flex justify-end">
                              {holidayRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHolidayRow(row.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Remove Row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setShowInlineAddHoliday(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold shadow-xs"
                        >
                          Save All Holidays ({holidayRows.length})
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Holidays Table */}
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 font-bold text-slate-800 text-xs">
                          <th className="py-3 px-4">Holiday Name</th>
                          <th className="py-3 px-4">Start Date - Day</th>
                          <th className="py-3 px-4">End Date - Day</th>
                          <th className="py-3 px-4 text-center">Days</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {holidays.map((h) => {
                          const isEditingThis = editingHolidayId === h.holidayId;
                          return isEditingThis ? (
                            <tr key={h.holidayId} className="bg-blue-50/40 border-b border-blue-200">
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={editHolName}
                                  onChange={(e) => setEditHolName(e.target.value)}
                                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white text-slate-900"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="date"
                                  value={editHolStartDate}
                                  onChange={(e) => setEditHolStartDate(e.target.value)}
                                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white text-slate-900"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="date"
                                  value={editHolEndDate}
                                  onChange={(e) => setEditHolEndDate(e.target.value)}
                                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white text-slate-900"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800">1</td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleSaveEditHoliday(h.holidayId)}
                                    className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                                    title="Save Changes"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingHolidayId(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={h.holidayId} className="hover:bg-slate-50/70 transition-colors text-slate-700">
                              <td className="py-3.5 px-4 font-medium text-slate-900">{h.holidayName}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-600">{formatDateWithDay(h.startDate)}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-600">{formatDateWithDay(h.endDate)}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-800">1</td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleStartEditHoliday(h)}
                                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                    title="Edit Holiday"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHoliday(h.holidayId)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                    title="Delete Holiday"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {holidays.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                              No holidays added yet. Click &quot;+ Add New&quot; to add holidays.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs font-medium">
              Select a calendar from the left list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
