"use client";

import React from "react";
import { Play, Square, MapPin } from "lucide-react";

interface AttendanceCardProps {
  isCheckedIn: boolean;
  seconds: number;
  progressPercent: number;
  formatTime: (totalSecs: number) => string;
  onToggleCheckIn: () => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  isCheckedIn,
  seconds,
  progressPercent,
  formatTime,
  onToggleCheckIn,
}) => {
  return (
    <div className="relative overflow-hidden bg-[#013e37] border border-[#ffefb3]/20 p-5 rounded-2xl text-[#ffefb3] shadow-md flex flex-col justify-between min-h-[250px]">
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#ffefb3]/75 uppercase tracking-wide">
            Attendance
          </span>
          <h3 className="text-base font-extrabold text-[#ffefb3]">Daily Work Status</h3>
        </div>
        <div className="flex items-center gap-1 bg-white/10 text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs border border-[#ffefb3]/20">
          <MapPin className="w-3 h-3 text-[#ffefb3]/85" />
          <span className="font-bold">Office HQ</span>
        </div>
      </div>

      <div className="my-3 text-center py-2.5 bg-white/10 rounded-xl backdrop-blur-xs border border-[#ffefb3]/15">
        <div className="text-[9px] text-[#ffefb3]/80 font-bold uppercase tracking-wider mb-1">
          Time Logged Today
        </div>
        <div className="text-3xl font-mono font-extrabold tracking-widest text-[#ffefb3]">
          {formatTime(seconds)}
        </div>
        <div className="mt-2.5 mx-4 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ffefb3] rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[9px] text-[#ffefb3]/70 font-semibold mt-1">
          {progressPercent.toFixed(0)}% of 8hr workday
        </p>
      </div>

      {isCheckedIn && (
        <div className="flex items-center gap-1.5 justify-center mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffefb3] animate-ping" />
          <span className="text-[10px] text-[#ffefb3] font-bold">You are clocked in</span>
        </div>
      )}

      <button
        onClick={onToggleCheckIn}
        className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
          isCheckedIn
            ? "bg-rose-600 text-white hover:bg-rose-700 border border-rose-500"
            : "bg-[#ffefb3] text-[#013e37] hover:bg-[#ffe794] border border-[#ffefb3]"
        }`}
      >
        {isCheckedIn ? (
          <>
            <Square className="w-3.5 h-3.5" />
            <span>Check Out</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Check In</span>
          </>
        )}
      </button>
    </div>
  );
};
