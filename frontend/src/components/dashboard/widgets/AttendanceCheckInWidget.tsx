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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#4f39f6] via-indigo-600 to-violet-700 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">
            Attendance
          </span>
          <h3 className="text-lg font-bold">Daily Check In</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 text-xs px-2.5 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
          <MapPin className="w-3.5 h-3.5 text-indigo-200" />
          <span className="font-semibold">Office HQ</span>
        </div>
      </div>

      {/* Timer display */}
      <div className="my-4 text-center py-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 relative z-10">
        <div className="text-[11px] text-indigo-200 font-semibold mb-1.5 uppercase tracking-wider">
          Time Elapsed Today
        </div>
        <div className="text-4xl font-mono font-extrabold tracking-wider">
          {formatTime(seconds)}
        </div>

        {/* Progress bar */}
        <div className="mt-3 mx-4 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-indigo-300 font-medium mt-1.5">
          {progressPercent.toFixed(0)}% of 8hr workday
        </p>
      </div>

      {/* Status indicator */}
      {isCheckedIn && (
        <div className="flex items-center gap-1.5 justify-center mb-2 relative z-10">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-300 font-semibold">You are clocked in</span>
        </div>
      )}

      {/* Check In/Out button */}
      <button
        onClick={() => setIsCheckedIn(!isCheckedIn)}
        className={`relative z-10 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
          isCheckedIn
            ? "bg-white text-rose-600 hover:bg-rose-50 shadow-rose-500/20"
            : "bg-white text-emerald-600 hover:bg-emerald-50 shadow-emerald-500/20"
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
