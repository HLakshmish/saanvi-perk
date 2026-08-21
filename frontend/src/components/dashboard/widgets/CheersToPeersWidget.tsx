"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PartyPopper, Cake, Briefcase, CalendarHeart } from "lucide-react";
import { getUpcomingEvents } from "@/features/employees/api/employees.api";

interface EventPerson {
  userId: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: string | null;
  profilePic: string | null;
  isToday: boolean;
  eventDate: string;
}

interface BirthdayEvent extends EventPerson {
  type: "birthday";
  dateOfBirth: string;
}

interface AnniversaryEvent extends EventPerson {
  type: "anniversary";
  joiningDate: string;
  years: number;
}

type CombinedEvent = BirthdayEvent | AnniversaryEvent;

export const CheersToPeersWidget: React.FC = () => {
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [anniversaries, setAnniversaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const res = await getUpcomingEvents(7);
      if (res.success && res.data) {
        setBirthdays(res.data.birthdays || []);
        setAnniversaries(res.data.anniversaries || []);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return { day, month };
  };

  const combinedEvents: CombinedEvent[] = useMemo(() => {
    const bEvents: BirthdayEvent[] = birthdays.map((b) => ({
      ...b,
      type: "birthday",
    }));
    const aEvents: AnniversaryEvent[] = anniversaries.map((a) => ({
      ...a,
      type: "anniversary",
    }));

    const all = [...bEvents, ...aEvents];

    // Sort: today's events first, then chronologically by eventDate
    all.sort((x, y) => {
      if (x.isToday && !y.isToday) return -1;
      if (!x.isToday && y.isToday) return 1;
      return new Date(x.eventDate).getTime() - new Date(y.eventDate).getTime();
    });

    return all;
  }, [birthdays, anniversaries]);

  const totalEvents = combinedEvents.length;

  const renderEventCard = (event: CombinedEvent) => {
    const { day, month } = formatDate(event.eventDate);
    const isBirthday = event.type === "birthday";

    return (
      <div
        key={`${event.type}-${event.userId}`}
        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 transition-all duration-200 hover:border-brand-primary/30 hover:bg-brand-primary-light/30 group"
      >
        {/* Left: Avatar / DP with Icon Indicator */}
        <div className="relative shrink-0">
          {event.profilePic ? (
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-100 flex items-center justify-center">
              <img
                src={event.profilePic}
                alt={`${event.firstName} ${event.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-xs shadow-xs">
              {event.firstName?.charAt(0)}
              {event.lastName?.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center z-10">
            {isBirthday ? (
              <Cake className="w-3 h-3 text-brand-primary" />
            ) : (
              <Briefcase className="w-3 h-3 text-brand-primary" />
            )}
          </div>
        </div>

        {/* Middle: Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 text-xs leading-tight group-hover:text-brand-primary transition-colors truncate">
              {event.firstName} {event.lastName}
            </h4>
            {event.isToday && (
              <span className="text-[9px] font-extrabold text-brand-primary bg-brand-primary-light border border-brand-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Today
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">
            {isBirthday
              ? `Birthday · ${event.designation || "Team Member"}`
              : `${(event as AnniversaryEvent).years} ${(event as AnniversaryEvent).years === 1 ? "Year" : "Years"} Anniversary · ${event.designation || "Team Member"}`}
          </p>
        </div>

        {/* Right: Date Badge */}
        <div className="bg-brand-primary text-brand-btn-text rounded-xl px-3 py-1.5 flex flex-col items-center justify-center min-w-[48px] shadow-xs shrink-0 font-bold">
          <span className="text-sm font-black leading-none">{day}</span>
          <span className="text-[9px] font-extrabold uppercase mt-0.5 opacity-90 tracking-wider">
            {month}
          </span>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2.5">
        <CalendarHeart className="w-6 h-6 text-slate-300" />
      </div>
      <p className="text-xs font-bold text-slate-400">No celebrations</p>
      <p className="text-[10px] text-slate-300 mt-0.5">No birthdays or work anniversaries this week.</p>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-28 mb-1.5" />
                <div className="h-2 bg-slate-100 rounded w-20" />
              </div>
              <div className="w-12 h-10 bg-slate-200 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      );
    }

    if (totalEvents === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
        {combinedEvents.map((event) => renderEventCard(event))}
      </div>
    );
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <PartyPopper className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cheers To Peers</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Birthdays and Work Anniversaries
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary-light border border-brand-primary/20 px-2.5 py-1 rounded-full">
            {totalEvents} Upcoming
          </span>
        </div>

        {/* List Content */}
        {renderContent()}
      </div>
    </div>
  );
};
