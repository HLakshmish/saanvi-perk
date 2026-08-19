"use client";

import React from "react";
import { PartyPopper, User, Heart, Sparkles } from "lucide-react";
import { BirthdayPeer } from "@/types/dashboard";

interface CheersToPeersProps {
  peers?: BirthdayPeer[];
}

export const CheersToPeersWidget: React.FC = () => {
  const defaultPeers: BirthdayPeer[] = [
    { id: "1", name: "Virat Kohli", date: "04 AUG" },
  ];

  const list = defaultPeers;

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <PartyPopper className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cheers To Peers</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Celebrations</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary-light border border-brand-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-primary animate-spin" />
            <span>Today</span>
          </span>
        </div>

        <div className="space-y-3">
          {list.map((peer) => (
            <div
              key={peer.id}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border border-emerald-200/60 transition-all group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-brand-primary flex items-center gap-1.5 uppercase tracking-wide">
                  🎂 Birthday Celebration 🎉
                </span>
              </div>

              {/* Peer info */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-black text-sm shadow-xs">
                    {peer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs leading-tight group-hover:text-brand-primary transition-colors">
                      {peer.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Celebrating birthday today
                    </p>
                  </div>
                </div>

                {/* Date pill */}
                <div className="bg-white px-3 py-1 rounded-xl border border-brand-primary/20 text-center shadow-2xs shrink-0">
                  <span className="text-sm font-black text-brand-primary block leading-tight">
                    {peer.date.split(" ")[0]}
                  </span>
                  <span className="text-[9px] font-extrabold text-brand-primary/70 uppercase block leading-tight">
                    {peer.date.split(" ")[1]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
