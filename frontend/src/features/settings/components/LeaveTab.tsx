"use client";

import React, { useState } from "react";
import { CalendarDays, Sliders, CalendarPlus } from "lucide-react";
import { LeaveTypesDetailView } from "./LeaveTypesDetailView";
import { LeavePolicyDetailView } from "./LeavePolicyDetailView";
import { LeaveAccumulationsDetailView } from "./LeaveAccumulationsDetailView";

type ViewMode = "cards" | "leave-types" | "leave-policy" | "leave-accumulations";

export const LeaveTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const leaveCards = [
    {
      id: "leave-types",
      title: "Leave Types",
      description: "Create different types of leaves and give them a code, these leave types will appear in leave policies.",
      icon: CalendarDays,
    },
    {
      id: "leave-policy",
      title: "Leave Policy",
      description: "Define different types of leave and setup its policies here.",
      icon: Sliders,
    },
    {
      id: "leave-accumulations",
      title: "Leave Accumulations",
      description: "Allocate leaves to employees and set up the accumulation and availability period.",
      icon: CalendarPlus,
    },
  ];

  const handleCardClick = (id: string) => {
    if (id === "leave-types" || id === "leave-policy" || id === "leave-accumulations") {
      setViewMode(id as ViewMode);
    }
  };

  if (viewMode === "leave-types") {
    return <LeaveTypesDetailView onBack={() => setViewMode("cards")} />;
  }

  if (viewMode === "leave-policy") {
    return <LeavePolicyDetailView onBack={() => setViewMode("cards")} />;
  }

  if (viewMode === "leave-accumulations") {
    return <LeaveAccumulationsDetailView onBack={() => setViewMode("cards")} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-[#013e37] tracking-tight">
          Leave Configuration
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Manage leave types, policy limits, rules, auto accumulations, and availability periods.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {leaveCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-[#013e37]/40 transition-all cursor-pointer group flex items-start gap-4"
            >
              {/* Circular Icon Box */}
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#013e37] shrink-0 group-hover:scale-105 group-hover:bg-[#013e37] group-hover:text-[#ffefb3] group-hover:border-[#013e37] transition-all">
                <Icon className="w-5 h-5" />
              </div>

              {/* Text info */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#013e37] transition-colors">
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
