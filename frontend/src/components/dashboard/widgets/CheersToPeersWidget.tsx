"use client";

import React from "react";
import { PartyPopper, User, Heart } from "lucide-react";
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
    <div className="bg-white p-5 rounded-2xl border border-brand-primary/15 shadow-2xs flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <PartyPopper className="w-4 h-4 text-brand-primary" />
        </div>
        <h3 className="font-bold text-brand-primary text-sm">Cheers To Peers</h3>
      </div>

      <div className="space-y-3">
        {list.map((peer) => (
          <div
            key={peer.id}
            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-primary/30 transition-all group"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary mb-3">
              <span>🎂 Happy Birthday!</span>
            </div>

            {/* Peer info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary text-brand-btn-text flex items-center justify-center font-bold shadow-2xs">
                  <User className="w-5 h-5 text-brand-btn-text" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-primary transition-colors">
                    {peer.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Celebrating birthday today
                  </p>
                </div>
              </div>

              {/* Date pill */}
              <div className="bg-white px-3 py-1.5 rounded-xl border border-brand-primary/20 text-center shadow-2xs">
                <span className="text-sm font-extrabold text-brand-primary block leading-tight">
                  {peer.date.split(" ")[0]}
                </span>
                <span className="text-[9px] font-bold text-brand-primary/70 uppercase block leading-tight">
                  {peer.date.split(" ")[1]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
