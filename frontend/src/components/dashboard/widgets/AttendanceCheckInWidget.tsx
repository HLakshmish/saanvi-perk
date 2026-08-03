"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Square, MapPin } from "lucide-react";

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

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-xl text-white shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">
            Attendance Punch
          </span>
          <h3 className="text-lg font-bold">Daily Check In / Out</h3>
        </div>
        <div className="flex items-center gap-1 bg-white/10 text-xs px-2.5 py-1 rounded-full backdrop-blur-xs">
          <MapPin className="w-3.5 h-3.5 text-blue-200" />
          <span>Office HQ</span>
        </div>
      </div>

      <div className="my-4 text-center py-3 bg-white/10 rounded-lg backdrop-blur-xs border border-white/10">
        <div className="text-xs text-blue-200 font-medium mb-1">Time Elapsed Today</div>
        <div className="text-3xl font-mono font-extrabold tracking-wider">
          {formatTime(seconds)}
        </div>
      </div>

      <button
        onClick={() => setIsCheckedIn(!isCheckedIn)}
        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
          isCheckedIn
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-emerald-500 hover:bg-emerald-600 text-white"
        }`}
      >
        {isCheckedIn ? (
          <>
            <Square className="w-4 h-4 fill-current" />
            Check Out (Clock Out)
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            Check In (Clock In)
          </>
        )}
      </button>
    </div>
  );
};
