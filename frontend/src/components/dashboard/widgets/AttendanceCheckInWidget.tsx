"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Square, MapPin, CheckCircle2 } from "lucide-react";

export const AttendanceCheckInWidget: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min((seconds / (8 * 3600)) * 100, 100); // Based on 8hr workday

  return (
    <div className="relative overflow-hidden bg-brand-primary border border-[#ffefb3]/20 p-5 rounded-2xl text-brand-btn-text shadow-md flex flex-col justify-between">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-xs font-bold text-brand-btn-text/75 uppercase tracking-wide">
            Attendance
          </span>
          <h3 className="text-lg font-extrabold text-brand-btn-text">Daily Check In</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 text-xs px-2.5 py-1.5 rounded-xl backdrop-blur-sm border border-[#ffefb3]/20 text-brand-btn-text">
          <MapPin className="w-3.5 h-3.5 text-brand-btn-text/85" />
          <span className="font-bold">Office HQ</span>
        </div>
      </div>

      {/* Timer display */}
      <div className="my-4 text-center py-4 bg-white/10 rounded-xl backdrop-blur-sm border border-[#ffefb3]/20 relative z-10">
        <div className="text-[11px] text-brand-btn-text/80 font-bold mb-1.5 uppercase tracking-wider">
          Time Elapsed Today
        </div>
        <div className="text-4xl font-mono font-extrabold tracking-wider text-brand-btn-text">
          {formatTime(seconds)}
        </div>

        {/* Progress bar */}
        <div className="mt-3 mx-4 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ffefb3] rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-brand-btn-text/75 font-medium mt-1.5">
          {progressPercent.toFixed(0)}% of 8hr workday
        </p>
      </div>

      {/* Status indicator */}
      {isCheckedIn && (
        <div className="flex items-center gap-1.5 justify-center mb-2 relative z-10">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-btn-text" />
          <span className="text-xs text-brand-btn-text font-bold">You are clocked in</span>
        </div>
      )}

      {/* Check In/Out button */}
      <button
        onClick={() => setIsCheckedIn(!isCheckedIn)}
        className={`relative z-10 w-full py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
          isCheckedIn
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : "bg-[#ffefb3] text-brand-primary hover:bg-[#ffe794]"
        }`}
      >
        {isCheckedIn ? (
          <>
            <Square className="w-4 h-4" />
            Check Out
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Check In
          </>
        )}
      </button>
    </div>
  );
};
