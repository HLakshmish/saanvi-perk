"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { RefreshCw } from "lucide-react";

interface SplashScreenProps {
  userName?: string;
  role?: string;
  onFinished?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinished,
  durationMs = 2000,
}) => {
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    // Detect slow page load / network delay (> 3.5s)
    const slowTimer = setTimeout(() => {
      setIsSlowNetwork(true);
    }, 3500);

    // Show refresh option if taking very long (> 9s)
    const refreshTimer = setTimeout(() => {
      setShowRefresh(true);
    }, 9000);

    const finishTimer = setTimeout(() => {
      if (onFinished) {
        onFinished();
      }
    }, durationMs);

    return () => {
      clearTimeout(slowTimer);
      clearTimeout(refreshTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinished]);

  const handleRefresh = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #091421ff 0%, #092848ff 70%, #143a62ff 100%, #ffffff 100%)",
      }}
    >
      {/* Centered Minimalist Brand Logo & Name */}
      <div className="flex items-center gap-2.5 animate-scale-in">
        <img
          src="/icon1.png"
          alt="Nexus Logo"
          className="w-9 h-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
        />
        <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] font-sans">
          Nexus
        </h2>
      </div>

      {/* Subtle Slow Network Messages (Absolute positioned at the bottom, so they don't disrupt center alignment) */}
      {isSlowNetwork && (
        <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-fade-in px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 text-[#0b2544] text-[10px] font-bold shadow-2xs backdrop-blur-xs">
            <span>Loading Workspace...</span>
          </div>

          {showRefresh && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 text-[11px] text-[#184474] hover:text-[#0b2544] underline underline-offset-4 font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tap to refresh</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
