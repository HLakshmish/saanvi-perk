"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const EmployeeDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-8">
      {/* 1. Hero Carousel Card Skeleton */}
      <div className="relative">
        <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
            <Skeleton className="h-3.5 w-24 sm:w-32" />
          </div>
          <Skeleton className="h-10 w-20 rounded-xl shrink-0" />
        </div>
        {/* Dots placeholder */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <Skeleton className="w-5 h-1.5 rounded-full" />
          <Skeleton className="w-1.5 h-1.5 rounded-full" />
          <Skeleton className="w-1.5 h-1.5 rounded-full" />
        </div>
      </div>

      {/* 2. Attendance Card Skeleton */}
      <div className="relative overflow-hidden bg-brand-primary/90 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md space-y-3">
        <Skeleton className="h-4 w-28 bg-white/20" />

        {/* Center Circular Dial Skeleton */}
        <div className="my-2 flex flex-col items-center justify-center">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-3 border-white/20 bg-white/5 flex flex-col items-center justify-center space-y-1.5">
            <Skeleton className="w-4 h-4 rounded-full bg-white/30" />
            <Skeleton className="h-7 w-32 bg-white/30" />
          </div>
        </div>

        <div className="w-full h-px bg-white/15 my-1.5" />

        {/* CHECK-IN TIME Skeleton */}
        <div className="flex flex-col items-center space-y-1">
          <Skeleton className="h-2 w-18 bg-white/20" />
          <Skeleton className="h-4.5 w-24 bg-white/25" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <Skeleton className="h-10 rounded-xl sm:rounded-2xl bg-white/25" />
          <Skeleton className="h-10 rounded-xl sm:rounded-2xl bg-white/15" />
        </div>
      </div>

      {/* 3. Quick Hub Skeleton */}
      <div className="bg-white border border-slate-200/85 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl" />
                <Skeleton className="w-3 h-3 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
