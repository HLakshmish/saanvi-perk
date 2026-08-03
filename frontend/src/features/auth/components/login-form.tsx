"use client";

import React from "react";
import Image from "next/image";

import { useLogin } from "../hooks/use-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const {
    credentials,
    errors,
    isLoading,
    successMessage,
    handleChange,
    handleSubmit,
  } = useLogin();

  const [showPassword, setShowPassword] = React.useState(false);
  const [activeSlide, setActiveSlide] = React.useState(0);

  const bannerSlides = [
    {
      title: "Empowering Workplace Success",
      description: "Unleash collaboration and performance metrics with Saanvi Perk's next-generation HR environment."
    },
    {
      title: "Simplified Attendance Tracking",
      description: "Clock-ins, leaves, and team calendars synced instantly on your dashboard."
    },
    {
      title: "Comprehensive Benefit Ecosystem",
      description: "Manage paychecks, health savings, and employee perks in a central portal."
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  return (
    <>
      <style>{`
        /* Hide native browser password reveal eye icons */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear,
        input[type="password"]::-webkit-contacts-auto-fill-button,
        input[type="password"]::-webkit-credentials-auto-fill-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Force inputs, labels, and placeholders to light mode values */
        .forced-light-theme input {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #e2e8f0 !important;
        }
        .forced-light-theme input::placeholder {
          color: #94a3b8 !important;
        }
        .forced-light-theme input:hover {
          border-color: #cbd5e1 !important;
        }
        .forced-light-theme input:focus {
          border-color: #0f172a !important;
          box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.05) !important;
        }
        .forced-light-theme label {
          color: #374151 !important;
        }
      `}</style>

      {/* Viewport container with soft mint-green backdrop */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#e8f4ec] transition-colors duration-500 overflow-y-auto relative select-none forced-light-theme">
        
        {/* Floating background decorative pill shapes */}
        <div className="absolute top-[10%] left-[8%] w-36 h-36 bg-white/40 rounded-full blur-sm pointer-events-none"></div>
        <div className="absolute bottom-[12%] left-[5%] w-24 h-24 bg-white/30 rounded-3xl transform rotate-45 pointer-events-none"></div>
        <div className="absolute top-[15%] right-[6%] w-20 h-20 bg-white/40 rounded-2xl transform -rotate-12 pointer-events-none"></div>
        <div className="absolute bottom-[8%] right-[10%] w-32 h-10 bg-white/20 rounded-full transform rotate-12 pointer-events-none"></div>

        {/* Centered Split-Screen Rounded Card */}
        <div className="relative w-full max-w-5xl rounded-[2.5rem] bg-white border border-slate-200/50 shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[650px] transition-all duration-300 pointer-events-auto select-text">
          
          {/* Left Side: Form Panel */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-14 overflow-y-auto bg-white">
            
            {/* Top Brand Header */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/company_logo.png"
                alt="Saanvi Perk Logo"
                width={96}
                height={33}
                priority
                style={{ height: "auto" }}
                className="object-contain"
              />
            </div>

            {/* Mid Form Section */}
            <div className="space-y-6 my-auto">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                  Welcome Back!
                </h1>
                <p className="text-sm text-slate-500">
                  Please enter your email and password to log in to your account.
                </p>
              </div>

              {/* Alerts */}
              {errors.general && (
                <div className="rounded-xl border border-red-200/80 bg-red-50/50 px-4 py-3 text-sm text-red-600 flex items-start gap-2 animate-in fade-in duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{errors.general}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-green-200/80 bg-green-50/50 px-4 py-3 text-sm text-green-600 flex items-start gap-2 animate-in fade-in duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  className="border-slate-200 focus:ring-slate-500/10 focus:border-slate-800 py-3 text-base rounded-xl transition-all duration-200 shadow-sm"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password || ""}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    className="pr-12 border-slate-200 focus:ring-slate-500/10 focus:border-slate-800 py-3 text-base rounded-xl transition-all duration-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-[29px] z-10 p-1.5 rounded-md text-slate-400 hover:text-slate-655 hover:bg-slate-100/50 transition-colors cursor-pointer focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Solid Black Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 h-12 text-base font-semibold text-white bg-black hover:bg-slate-900 active:scale-[0.98] rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : null}
                  <span>Sign In</span>
                </button>

              </form>
            </div>

            {/* Bottom Support & Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <div className="text-xs text-slate-500">
                <span>Need help? Contact support at </span>
                <a
                  href="mailto:support@saanviperk.com"
                  className="text-emerald-600 hover:underline font-semibold"
                >
                  support@saanviperk.com
                </a>
              </div>
              <div className="text-xs text-slate-400">
                All rights reserved © {new Date().getFullYear()} Saanvi Perk.
              </div>
            </div>

          </div>

          {/* Right Side: Visual & Slide Panel */}
          <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-slate-100">
            {/* Custom Generated HRMS Image */}
            <Image
              src="/images/hrms_banner.png"
              alt="Saanvi Perk HRMS"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            
            {/* Frosted Glass Overlay Slide Box */}
            <div className="absolute bottom-8 inset-x-8 backdrop-blur-lg bg-black/30 border border-white/10 rounded-3xl p-6 text-white shadow-lg transition-all duration-500">
              <h3 className="text-xl font-bold leading-snug mb-2 transition-all duration-500">
                {bannerSlides[activeSlide].title}
              </h3>
              <p className="text-sm text-white/80 transition-all duration-500">
                {bannerSlides[activeSlide].description}
              </p>
            </div>

            {/* Next Slide Arrow Button */}
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % bannerSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none cursor-pointer z-20"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

          </div>

        </div>

      </div>
    </>
  );
}