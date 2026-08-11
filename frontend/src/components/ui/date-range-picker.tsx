import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dateRangeStr: string) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isOpen,
  onClose,
  onApply,
  initialStartDate = new Date(2026, 7, 1), // Default Aug 1, 2026
  initialEndDate = new Date(2026, 7, 31),   // Default Aug 31, 2026
}) => {
  const [tempStartDate, setTempStartDate] = useState<Date | null>(initialStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(initialEndDate);
  const [leftCalendarMonth, setLeftCalendarMonth] = useState<Date>(new Date(initialStartDate.getFullYear(), initialStartDate.getMonth(), 1));

  const formatDateString = (date: Date | null): string => {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // Keyboard manual inputs states
  const [startInputVal, setStartInputVal] = useState(formatDateString(initialStartDate));
  const [endInputVal, setEndInputVal] = useState(formatDateString(initialEndDate));

  if (!isOpen) return null;

  // Derive right calendar month (always consecutive)
  const rightCalendarMonth = new Date(
    leftCalendarMonth.getFullYear(),
    leftCalendarMonth.getMonth() + 1,
    1
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    return { totalDays, startDayOfWeek };
  };

  const handlePrevMonth = () => {
    setLeftCalendarMonth(
      new Date(leftCalendarMonth.getFullYear(), leftCalendarMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setLeftCalendarMonth(
      new Date(leftCalendarMonth.getFullYear(), leftCalendarMonth.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (day: number, monthDate: Date) => {
    const clickedDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(clickedDate);
      setStartInputVal(formatDateString(clickedDate));
      setTempEndDate(null);
      setEndInputVal("");
    } else {
      if (clickedDate < tempStartDate) {
        setTempStartDate(clickedDate);
        setStartInputVal(formatDateString(clickedDate));
      } else {
        setTempEndDate(clickedDate);
        setEndInputVal(formatDateString(clickedDate));
      }
    }
  };

  const handleStartInputChange = (val: string) => {
    setStartInputVal(val);
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = val.match(regex);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2000 && year <= 2100) {
        const newDate = new Date(year, month, day);
        if (!isNaN(newDate.getTime())) {
          setTempStartDate(newDate);
          setLeftCalendarMonth(new Date(year, month, 1));
        }
      }
    }
  };

  const handleEndInputChange = (val: string) => {
    setEndInputVal(val);
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = val.match(regex);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2000 && year <= 2100) {
        const newDate = new Date(year, month, day);
        if (!isNaN(newDate.getTime())) {
          setTempEndDate(newDate);
        }
      }
    }
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isStartOfRange = (day: number, monthDate: Date): boolean => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    return !!(tempStartDate && date.getTime() === tempStartDate.getTime());
  };

  const isEndOfRange = (day: number, monthDate: Date): boolean => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    return !!(tempEndDate && date.getTime() === tempEndDate.getTime());
  };

  const isInRange = (day: number, monthDate: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false;
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    return date > tempStartDate && date < tempEndDate;
  };

  const handleApplyClick = () => {
    if (tempStartDate && tempEndDate) {
      onApply(`${formatDateString(tempStartDate)} - ${formatDateString(tempEndDate)}`);
    } else if (tempStartDate) {
      onApply(`${formatDateString(tempStartDate)} - ${formatDateString(tempStartDate)}`);
    }
    onClose();
  };

  const renderCalendarGrid = (monthDate: Date) => {
    const { totalDays, startDayOfWeek } = getDaysInMonth(monthDate);
    const blanks = Array.from({ length: startDayOfWeek });
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 text-center text-xs gap-y-1.5 font-semibold text-slate-700">
        {blanks.map((_, i) => (
          <span key={`blank-${i}`} className="py-1"></span>
        ))}
        {days.map((day) => {
          const isStart = isStartOfRange(day, monthDate);
          const isEnd = isEndOfRange(day, monthDate);
          const inRange = isInRange(day, monthDate);

          let cellClass = "py-1 select-none cursor-pointer hover:bg-slate-100 rounded-md transition-colors";
          if (isStart) {
            cellClass = "flex justify-center items-center bg-[#013e37] text-[#ffefb3] font-bold rounded-l-xl py-1 select-none cursor-pointer shadow-2xs";
          } else if (isEnd) {
            cellClass = "flex justify-center items-center bg-[#013e37] text-[#ffefb3] font-bold rounded-r-xl py-1 select-none cursor-pointer shadow-2xs";
          } else if (inRange) {
            cellClass = "py-1 bg-[#013e37]/15 text-[#013e37] font-bold border-y border-[#013e37]/20 select-none cursor-pointer";
          }

          return (
            <span
              key={`day-${day}`}
              onClick={() => handleDayClick(day, monthDate)}
              className={cellClass}
            >
              {day}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[660px] overflow-hidden flex flex-col relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer z-10"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Row: From & To inputs */}
        <div className="grid grid-cols-2 gap-6 p-6 pr-14 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-8">From</span>
            <div className="relative flex-1">
              <input
                type="text"
                value={startInputVal}
                onChange={(e) => handleStartInputChange(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-6">To</span>
            <div className="relative flex-1">
              <input
                type="text"
                value={endInputVal}
                onChange={(e) => handleEndInputChange(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] shadow-2xs"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Calendar Sheets Container */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 justify-between">
          {/* Left Calendar (Prev Month Controls) */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#013e37] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#013e37]">
                {getMonthName(leftCalendarMonth)}
              </span>
              <div className="w-6" /> {/* Placeholder spacing */}
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {renderCalendarGrid(leftCalendarMonth)}
          </div>

          {/* Right Calendar (Next Month Controls) */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-6" /> {/* Placeholder spacing */}
              <span className="text-xs font-bold text-[#013e37]">
                {getMonthName(rightCalendarMonth)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#013e37] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {renderCalendarGrid(rightCalendarMonth)}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white hover:bg-slate-50 font-bold shadow-2xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyClick}
            className="px-6 py-2 bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] font-bold text-sm rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
