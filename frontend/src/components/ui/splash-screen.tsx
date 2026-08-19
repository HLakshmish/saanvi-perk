"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

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
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinished) {
        onFinished();
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onFinished]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-primary text-white select-none overflow-hidden"
      style={{
        background: "radial-gradient(circle at center, #025950 0%, #013f39 60%, #002b27 100%)",
      }}
    >
      {/* Ambient background glowing circles */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        {/* Animated Glowing Logo Frame */}
        <div className="relative mb-6">
          <div className="absolute -inset-2.5 rounded-3xl bg-emerald-400/30 blur-md animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/95 backdrop-blur-md p-4 shadow-[0_0_40px_rgba(52,211,153,0.35)] border border-white/40 flex items-center justify-center">
            <Image
              src="/icon1.png"
              alt="Logo"
              width={100}
              height={100}
              priority
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Brand */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm mb-6">
          Nexus HRMS
        </h2>

        {/* Spinner Loader */}
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 animate-spin drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
        </div>
      </div>
    </div>
  );
};
