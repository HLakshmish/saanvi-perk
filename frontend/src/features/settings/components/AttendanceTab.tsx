"use client";

import React, { useState } from "react";
import {
  Sparkles,
  SlidersHorizontal,
  CalendarRange,
} from "lucide-react";
import { WeekOffConfigDetailView } from "./WeekOffConfigDetailView";
import { AssignWeekOffDetailView } from "./AssignWeekOffDetailView";
import { CalendarDetailView } from "./CalendarDetailView";

type ViewMode =
  | "cards"
  | "week-off-config"
  | "assign-week-off"
  | "holidays-list";

export const AttendanceTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const attendanceCards = [
    {
      id: "holidays-list",
      title: "Holidays List",
      description: "Create a custom list of Holidays and add to your Organization's Calendar.",
      icon: Sparkles,
    },
    {
      id: "week-off-config",
      title: "Week-off Configuration",
      description: "Create a custom list of week-offs.",
      icon: SlidersHorizontal,
    },
    {
      id: "assign-week-off",
      title: "Assign Week-off",
      description: "Assign respective week-off to employees.",
      icon: CalendarRange,
    },
  ];

  const handleCardClick = (id: string) => {
    if (id === "week-off-config") {
      setViewMode("week-off-config");
    } else if (id === "assign-week-off") {
      setViewMode("assign-week-off");
    } else if (id === "holidays-list") {
      setViewMode("holidays-list");
    }
  };

  if (viewMode === "week-off-config") {
    return <WeekOffConfigDetailView onBack={() => setViewMode("cards")} />;
  }

  if (viewMode === "assign-week-off") {
    return <AssignWeekOffDetailView onBack={() => setViewMode("cards")} />;
  }

  if (viewMode === "holidays-list") {
    return <CalendarDetailView onBackToOrganization={() => setViewMode("cards")} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-brand-primary tracking-tight">
          Attendance
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          You can manage your company accounts info, activity, security options here.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {attendanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-brand-primary/40 transition-all cursor-pointer group flex items-start gap-4"
            >
              {/* Circular Icon Box */}
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-105 group-hover:bg-brand-primary group-hover:text-brand-btn-text group-hover:border-brand-primary transition-all">
                <Icon className="w-5 h-5" />
              </div>

              {/* Text info */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
