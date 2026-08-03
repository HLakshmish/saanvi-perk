"use client";

import React from "react";
import { Cake, User } from "lucide-react";
import { BirthdayPeer } from "@/types/dashboard";

interface CheersToPeersProps {
  peers?: BirthdayPeer[];
}

export const CheersToPeersWidget: React.FC<CheersToPeersProps> = ({ peers }) => {
  const defaultPeers: BirthdayPeer[] = [
    { id: "1", name: "Ranjitha R", date: "04 AUG" },
  ];

  const list = peers || defaultPeers;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
      <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-3">
        Cheers To Peers
      </h3>

      <div className="space-y-3">
        {list.map((peer) => (
          <div
            key={peer.id}
            className="p-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/80 to-orange-50/50"
          >
            {/* Header banner */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-3">
              <Cake className="w-4 h-4 text-amber-600" />
              <span>Happy Birthday!</span>
            </div>

            {/* Peer info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                    {peer.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Is celebrating her birthday
                  </p>
                </div>
              </div>

              {/* Date pill */}
              <div className="bg-white px-2.5 py-1 rounded-md border border-amber-200 text-center shadow-2xs">
                <span className="text-xs font-extrabold text-amber-900 block leading-tight">
                  {peer.date.split(" ")[0]}
                </span>
                <span className="text-[9px] font-bold text-amber-600 uppercase block leading-tight">
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
