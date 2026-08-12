"use client";

import React, { useState } from "react";
import { CalendarDays, FileSpreadsheet } from "lucide-react";
import { LeaveTypesDetailView } from "./LeaveTypesDetailView";

export const LeaveTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<"cards" | "leave-types">("cards");

  const leaveCards = [
    {
      id: "leave-types",
      title: "Leave Types",
      description: "Define types of leaves (Sick, Casual, Earned, etc.).",
      icon: CalendarDays,
    },
  ];

  const handleCardClick = (id: string) => {
    if (id === "leave-types") {
      setViewMode("leave-types");
    }
  };

  if (viewMode === "leave-types") {
    return (
      <LeaveTypesDetailView
        onBack={() => setViewMode("cards")}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-[#013e37] tracking-tight">
          Leave
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Manage leave configuration, accrual rules, holiday lists, and default settings.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
