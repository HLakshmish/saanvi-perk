"use client";

import React from "react";

interface EmployeeStatsProps {
  headcount?: number;
  atWork?: number;
  onLeave?: number;
  absent?: number;
}

export const EmployeeStatsWidget: React.FC<EmployeeStatsProps> = ({
  headcount = 38,
  atWork = 21,
  onLeave = 0,
  absent = 17,
}) => {
  const stats = [
    {
      label: "Total Headcount",
      value: headcount,
      subtext: "+4 joined this month",
      badge: "Active Roster",
      avatar: "/images/avatars/headcount.jpg",
    },
    {
      label: "At Work Currently",
      value: atWork,
      subtext: "55.2% checked in today",
      badge: "Live Clocked",
      avatar: "/images/avatars/atwork.jpg",
      isLive: true,
    },
    {
      label: "On Leave Today",
      value: onLeave,
      subtext: "No pending leave logs",
      badge: "Approved",
      avatar: "/images/avatars/onleave.jpg",
    },
    {
      label: "Absent",
      value: absent,
      subtext: "Awaiting morning punch",
      badge: "Pending",
      avatar: "/images/avatars/absent.jpg",
    },
  ];

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-4 mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          return (
            <div
              key={stat.label}
              className="bg-white rounded-3xl border border-slate-200/70 p-5 shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden group cursor-pointer h-36 flex flex-col justify-between"
            >
              {/* Straight background illustration card aligned to the right (fully inside, white bg, green object) */}
              <div className="absolute bottom-2.5 right-2.5 w-24 h-24 transform group-hover:scale-105 transition-all duration-300 pointer-events-none opacity-95 group-hover:opacity-100 overflow-hidden rounded-3xl bg-white shadow-xs border border-slate-100 flex items-center justify-center">
                {/* Decorative subtle background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] z-10" />
                <img
                  src={stat.avatar}
                  alt={stat.label}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Top badge */}
              <div className="relative z-10 self-start">
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-brand-primary/15 bg-brand-primary-light text-brand-primary">
                  {stat.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <span>{stat.badge}</span>
                </div>
              </div>

              {/* Stat details on the left */}
              <div className="relative z-10 pr-20">
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-brand-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-[13px] font-extrabold text-slate-800 leading-tight">
                  {stat.label}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
                  {stat.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
