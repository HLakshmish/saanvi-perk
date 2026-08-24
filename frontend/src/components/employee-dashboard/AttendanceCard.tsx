"use client";

import { Loader2, CheckCircle2, Clock } from "lucide-react";

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

  return (
    <div className="relative overflow-hidden bg-brand-primary border border-white/20 p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-white shadow-lg flex flex-col justify-between">
      {/* Decorative backdrop circular glow overlay */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand-accent/10 pointer-events-none blur-xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 z-10">
        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
          Check In / Out
        </h3>
      </div>

      {/* Center Circular Timer Gauge */}
      <div className="my-3 flex flex-col items-center justify-center z-10">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex flex-col items-center justify-center rounded-full border-3 border-white/90 shadow-[0_0_30px_rgba(251,106,34,0.25)] bg-radial from-white/10 to-transparent">
          {/* Subtle outer accent ring */}
          <div className="absolute inset-1.5 rounded-full border border-white/30 pointer-events-none" />

          <Clock className={`w-4 h-4 text-white mb-1.5 ${isCheckedIn ? "animate-pulse" : ""}`} />
          <div className="text-[1.3rem] sm:text-2xl font-mono font-extrabold tracking-wider text-white select-none">
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      {/* Subtle Horizontal Divider */}
      <div className="w-full h-px bg-white/15 my-2 z-10" />

      {/* CHECK-IN / CHECK-OUT TIME Section */}
      <div className="flex flex-col items-center z-10 mb-1">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase mb-0.5">
          {isCheckedOut ? "Check-Out Time" : "Check-In Time"}
        </span>
        <span className="text-base sm:text-lg font-bold text-white tracking-wide">
          {formatCheckInDisplay(isCheckedOut ? checkOutTime : checkInTime)}
        </span>
      </div>

      {/* Bottom Action Buttons: Check In & Check Out */}
      <div className="z-10 pt-1.5 grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Check In Button */}
        {isCheckedIn ? (
          <button
            disabled={true}
            className="py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm border border-brand-accent bg-transparent text-brand-accent flex items-center justify-center cursor-default"
          >
            <span>Checked In</span>
          </button>
        ) : (
          <button
            onClick={onCheckIn}
            disabled={isCheckedOut || isLoadingLocation}
            className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${isCheckedOut
              ? "bg-transparent text-white/30 border border-white/15 cursor-not-allowed"
              : "bg-transparent text-brand-accent hover:bg-brand-accent/10 border border-brand-accent cursor-pointer"
              }`}
          >
            {isLoadingLocation && !isCheckedOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
                <span>Checking In...</span>
              </>
            ) : (
              <span>Check In</span>
            )}
          </button>
        )}

        {/* Check Out Button */}
        {isCheckedOut ? (
          <button
            disabled={true}
            className="py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm border border-brand-accent bg-transparent text-brand-accent flex items-center justify-center cursor-default"
          >
            <span>Checked Out</span>
          </button>
        ) : (
          <button
            onClick={onCheckOut}
            disabled={!isCheckedIn || isLoadingLocation}
            className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${!isCheckedIn
              ? "bg-transparent text-white/30 border border-white/15 cursor-not-allowed"
              : "bg-transparent text-brand-accent hover:bg-brand-accent/10 border border-brand-accent cursor-pointer"
              }`}
          >
            {isLoadingLocation && isCheckedIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
                <span>Checking Out...</span>
              </>
            ) : (
              <span>Check Out</span>
            )}
          </button>
        )}
      </div>

      {/* Confirmation Message when checked out for today */}
      {isCheckedOut && (
        <div className="z-10 mt-3 py-2 px-3 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-white">
            You&apos;ve successfully checked out for today
          </span>
        </div>
      )}
    </div>
  );
};

