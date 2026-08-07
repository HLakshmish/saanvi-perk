"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  CalendarRecord,
  HolidayRecord,
  getCalendars,
  createCalendar,
  deleteCalendar,
  getHolidays,
  createHoliday,
  deleteHoliday,
} from "../api/calendar.api";

interface CalendarManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarManagementModal: React.FC<CalendarManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [calendars, setCalendars] = useState<CalendarRecord[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<number | null>(null);
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Calendar Form state
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const [newCalendarCode, setNewCalendarCode] = useState("");
  const [newCalendarName, setNewCalendarName] = useState("");

  // New Holiday Form state
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [newHolidayCode, setNewHolidayCode] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<"HOLIDAY" | "WEEK_OFF">("HOLIDAY");

  useEffect(() => {
    if (isOpen) {
      loadCalendars();
    }
  }, [isOpen]);

  const loadCalendars = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await getCalendars();
    setIsLoading(false);
    if (res.success && res.data) {
      setCalendars(res.data);
      if (res.data.length > 0) {
        setSelectedCalendarId(res.data[0].calendarId);
        loadHolidays(res.data[0].calendarId);
      }
    } else {
      setErrorMsg(res.error || "Failed to load calendars");
    }
  };

  const loadHolidays = async (calId: number) => {
    const res = await getHolidays(calId);
    if (res.success && res.data) {
      setHolidays(res.data);
    } else {
      setHolidays([]);
    }
  };

  const handleSelectCalendar = (id: number) => {
    setSelectedCalendarId(id);
    loadHolidays(id);
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarCode || !newCalendarName) return;

    setIsLoading(true);
    const res = await createCalendar({
      calendarCode: newCalendarCode.toUpperCase(),
      calendarName: newCalendarName,
    });
    setIsLoading(false);

    if (res.success) {
      setShowAddCalendar(false);
      setNewCalendarCode("");
      setNewCalendarName("");
      await loadCalendars();
    } else {
      setErrorMsg(res.error || "Could not create calendar");
    }
  };

  const handleDeleteCalendar = async (id: number) => {
    if (!confirm("Are you sure you want to delete this calendar?")) return;
    const res = await deleteCalendar(id);
    if (res.success) {
      await loadCalendars();
    } else {
      setErrorMsg(res.error || "Could not delete calendar");
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendarId || !newHolidayCode || !newHolidayName || !newStartDate || !newEndDate) return;

    setIsLoading(true);
    const res = await createHoliday({
      calendarId: selectedCalendarId,
      holidayCode: newHolidayCode.toUpperCase(),
      holidayName: newHolidayName,
      startDate: new Date(newStartDate).toISOString(),
      endDate: new Date(newEndDate).toISOString(),
      holidayType: newHolidayType,
    });
    setIsLoading(false);

    if (res.success) {
      setShowAddHoliday(false);
      setNewHolidayCode("");
      setNewHolidayName("");
      setNewStartDate("");
      setNewEndDate("");
      loadHolidays(selectedCalendarId);
    } else {
      setErrorMsg(res.error || "Could not create holiday");
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!confirm("Delete this holiday entry?")) return;
    const res = await deleteHoliday(id);
    if (res.success && selectedCalendarId) {
      loadHolidays(selectedCalendarId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4f39f6]/10 text-[#4f39f6] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Office Calendar Management</h2>
              <p className="text-xs text-slate-500">Configure company calendars, working days, and official holidays</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Calendars list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Company Calendars</h3>
              <button
                onClick={() => setShowAddCalendar(!showAddCalendar)}
                className="px-3 py-1.5 rounded-lg bg-[#4f39f6] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#4330db] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Calendar</span>
              </button>
            </div>

            {/* Add Calendar Form */}
            {showAddCalendar && (
              <form onSubmit={handleCreateCalendar} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Calendar Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. CAL2026"
                      value={newCalendarCode}
                      onChange={(e) => setNewCalendarCode(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Calendar Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Standard 2026 Office Calendar"
                      value={newCalendarName}
                      onChange={(e) => setNewCalendarName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCalendar(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#4f39f6] text-white text-xs font-bold hover:bg-[#4330db]"
                  >
                    Save Calendar
                  </button>
                </div>
              </form>
            )}

            {/* Calendar Chips */}
            {isLoading ? (
              <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#4f39f6]" />
                <span>Loading calendars...</span>
              </div>
            ) : calendars.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-2">No custom calendars created yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {calendars.map((cal) => {
                  const isSelected = cal.calendarId === selectedCalendarId;
                  return (
                    <div
                      key={cal.calendarId}
                      onClick={() => handleSelectCalendar(cal.calendarId)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#4f39f6]/10 border-[#4f39f6] text-[#4f39f6]"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span>{cal.calendarName}</span>
                      <span className="text-[10px] opacity-75 font-mono">({cal.calendarCode})</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCalendar(cal.calendarId);
                        }}
                        className="ml-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Holidays under selected calendar */}
          {selectedCalendarId && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Holidays for Selected Calendar
                </h3>
                <button
                  onClick={() => setShowAddHoliday(!showAddHoliday)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Holiday</span>
                </button>
              </div>

              {/* Add Holiday Form */}
              {showAddHoliday && (
                <form onSubmit={handleCreateHoliday} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Holiday Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. HOL-IND-DAY"
                        value={newHolidayCode}
                        onChange={(e) => setNewHolidayCode(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Holiday Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Independence Day"
                        value={newHolidayName}
                        onChange={(e) => setNewHolidayName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Start Date *</label>
                      <input
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">End Date *</label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Type *</label>
                      <select
                        value={newHolidayType}
                        onChange={(e) => setNewHolidayType(e.target.value as "HOLIDAY" | "WEEK_OFF")}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 font-semibold"
                      >
                        <option value="HOLIDAY">Official Holiday</option>
                        <option value="WEEK_OFF">Week Off</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddHoliday(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      Save Holiday
                    </button>
                  </div>
                </form>
              )}

              {/* Holidays Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Holiday Name</th>
                      <th className="py-2.5 px-3">Start Date</th>
                      <th className="py-2.5 px-3">End Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {holidays.map((h) => (
                      <tr key={h.holidayId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{h.holidayCode}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{h.holidayName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {new Date(h.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {new Date(h.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#4f39f6]/10 text-[#4f39f6]">
                            {h.holidayType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteHoliday(h.holidayId)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {holidays.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                          No holidays registered for this calendar. Click &quot;Add Holiday&quot; above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
