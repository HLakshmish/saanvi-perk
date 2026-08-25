"use client";

import React, { useEffect, useState } from "react";
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
        background:
          "linear-gradient(to bottom, #091421ff 0%, #092848ff 70%, #143a62ff 100%, #ffffff 100%)",
      }}
    >
      <style>{`
        @keyframes splashScaleInOut {
          0%, 100% {
            transform: scale(0.95);
            filter: drop-shadow(0 4px 14px rgba(0,0,0,0.25));
          }
          50% {
            transform: scale(1.12);
            filter: drop-shadow(0 0 25px rgba(56,189,248,0.45));
          }
        }

        @keyframes splashRippleRing {
          0% {
            transform: scale(0.7);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }

        @keyframes splashAura {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.3);
          }
        }

        .splash-icon-anim {
          animation: splashScaleInOut 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .splash-ripple-1 {
          animation: splashRippleRing 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }

        .splash-ripple-2 {
          animation: splashRippleRing 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 1.2s;
        }

        .splash-aura-glow {
          animation: splashAura 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient background glow behind logo */}
      <div className="relative flex items-center justify-center">
        {/* Expanding pulse ripple rings */}
        <div className="absolute w-28 h-28 rounded-full border border-sky-400/30 splash-ripple-1 pointer-events-none" />
        <div className="absolute w-28 h-28 rounded-full border border-sky-300/20 splash-ripple-2 pointer-events-none" />

        {/* Soft radial glow aura */}
        <div className="absolute w-36 h-36 rounded-full bg-sky-500/20 blur-2xl splash-aura-glow pointer-events-none" />

        {/* Centered Minimalist Brand Logo & Name with Scale In/Out */}
        <div className="relative z-10 flex items-center gap-3.5 splash-icon-anim">
          <div className="relative flex items-center justify-center">
            <img
              src="/icon1.png"
              alt="Nexus Logo"
              className="w-11 h-11 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-300"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] font-sans">
            Nexus
          </h2>
        </div>
      </div>

      {/* Subtle Slow Network Messages */}
      {isSlowNetwork && (
        <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-fade-in px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 text-[#0b2544] text-[11px] font-bold shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span>Loading Workspace...</span>
          </div>

          {showRefresh && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 text-xs text-sky-200 hover:text-white underline underline-offset-4 font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tap to refresh</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
