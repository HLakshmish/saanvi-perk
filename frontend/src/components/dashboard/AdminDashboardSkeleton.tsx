"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Top Banner Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 sm:w-64" />
          <Skeleton className="h-4 w-32 sm:w-44" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Row 1: 4-Column KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-12 h-3" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Row 2: 3-Column Widget Grid (Holidays, Quick Links, Payroll) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-2.5">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: 3-Column Widget Grid (Policies, Probations, Cheers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
