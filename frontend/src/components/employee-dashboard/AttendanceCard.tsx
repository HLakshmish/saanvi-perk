"use client";

import React from "react";
import { Play, Square, Loader2, CheckCircle2 } from "lucide-react";

interface AttendanceCardProps {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkOutTime?: string | null;
  seconds: number;
  formatTime: (totalSecs: number) => string;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isLoadingLocation?: boolean;
}

// Convert any format (e.g. "10:54:13", "10:54:13 AM", ISO string, or "10:54 AM") to "10:54 AM"
const formatCheckInDisplay = (time: string | null | undefined): string => {
  if (!time) return "--:-- --";

  const trimmed = time.trim();

  // If already "10:54 AM" (hh:mm AM/PM)
  if (/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // If "10:54:13" or "10:54:13 AM"
  const timeRegex = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?$/i;
  const match = trimmed.match(timeRegex);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    let meridiem = match[3] ? match[3].toUpperCase() : "";

    if (!meridiem) {
      meridiem = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
    }

    const displayHours = hours.toString().padStart(2, "0");
    return `${displayHours}:${minutes} ${meridiem}`;
  }

  // Try parsing ISO date
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  } catch (e) {
    // fallback
  }

  return trimmed;
};

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  isCheckedIn,
  checkInTime,
  checkOutTime,
  seconds,
  formatTime,
  onCheckIn,
  onCheckOut,
  isLoadingLocation = false,
}) => {
  const isCheckedOut = !isCheckedIn && !!checkOutTime;
  const displayCheckInTime = formatCheckInDisplay(checkInTime);
  const displayCheckOutTime = formatCheckInDisplay(checkOutTime);

  return (
    <div className="relative overflow-hidden bg-[#013e37] border border-[#ffefb3]/25 p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-[#ffefb3] shadow-md flex flex-col justify-between">
      {/* Decorative backdrop glow circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      {/* Top Bar: Title */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#ffefb3] tracking-tight">
            Check In / Out
          </h3>
        </div>
      </div>

      {/* Center Hero: Working Hours & Check-In / Check-Out Time */}
      <div className="my-3.5 p-4 bg-white/10 rounded-2xl backdrop-blur-xs border border-[#ffefb3]/15 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Left: Working Hours */}
          <div className="text-center sm:text-left sm:border-r sm:border-[#ffefb3]/15 sm:pr-4">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-widest text-[#ffefb3]">
              {formatTime(seconds)}
            </div>
          </div>

          {/* Right: Dynamic Check-In or Check-Out Time */}
          <div className="flex flex-col items-center sm:items-start justify-center p-3 bg-black/10 sm:bg-white/5 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#ffefb3]/80 font-bold uppercase tracking-wider mb-1">
              {isCheckedOut ? "Check-Out Time" : "Check-In Time"}
            </span>
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-white">
              {isCheckedOut ? displayCheckOutTime : displayCheckInTime}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons: Check In & Check Out */}
      <div className="z-10 pt-1 grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Check In Button */}
        <button
          onClick={onCheckIn}
          disabled={isCheckedIn || isLoadingLocation}
          className={`py-3 px-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] cursor-pointer ${
            isCheckedIn
              ? "bg-white/10 text-white/50 border border-white/10 cursor-not-allowed"
              : "bg-[#ffefb3] text-[#013e37] hover:bg-[#ffe794] border border-[#ffefb3] shadow-black/20"
          }`}
        >
          {isLoadingLocation && !isCheckedIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking In...</span>
            </>
          ) : isCheckedIn ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Checked In</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Check In</span>
            </>
          )}
        </button>

        {/* Check Out Button */}
        <button
          onClick={onCheckOut}
          disabled={!isCheckedIn || isLoadingLocation}
          className={`py-3 px-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] cursor-pointer ${
            !isCheckedIn
              ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
              : "bg-rose-600 text-white hover:bg-rose-700 border border-rose-500 shadow-rose-900/30"
          }`}
        >
          {isLoadingLocation && isCheckedIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking Out...</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Check Out</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
