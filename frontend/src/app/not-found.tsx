"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#f4fbf7] flex flex-col items-center justify-center p-4 sm:p-6 relative select-none font-sans overflow-hidden">
      {/* Soft ambient background shapes */}
      <div className="absolute top-[12%] left-[10%] w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[15%] right-[10%] w-44 h-44 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[20%] right-[15%] w-24 h-24 bg-brand-primary/5 rounded-3xl transform rotate-12 pointer-events-none" />
      <div className="absolute bottom-[18%] left-[12%] w-28 h-28 bg-emerald-400/10 rounded-2xl transform -rotate-12 pointer-events-none" />

      {/* Main 404 Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white border border-brand-primary/15 rounded-3xl p-6 sm:p-8 shadow-xl text-center flex flex-col items-center animate-fade-in">
        {/* Animated Compass Icon Illustration */}
        <div className="relative mb-5">
          {/* Pulsing halo */}
          <div className="absolute -inset-3 rounded-full bg-emerald-400/20 blur-md animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-brand-primary to-[#035249] text-white flex items-center justify-center shadow-lg border-2 border-emerald-300/40">
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-300 animate-[spin_8s_linear_infinite]" />
          </div>
        </div>

        {/* 404 Badge */}
        <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/15 mb-2">
          Error 404
        </span>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight mb-2">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xs mb-6">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-brand-primary bg-white border border-brand-primary/20 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 font-medium mt-6 pt-4 border-t border-slate-100 w-full">
          Nexus HRMS • Workplace Management System
        </p>
      </div>
    </div>
  );
}
