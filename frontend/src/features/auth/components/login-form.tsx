"use client";

import React from "react";
import Image from "next/image";

import { useLogin } from "../hooks/use-login";
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
      description: "Unleash collaboration and performance metrics with Nexus next-generation HR environment."
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

        /* Color palette: text/headings #013e37 & background #f4fbf7 */
        .forced-light-theme input {
          background-color: #ffffff !important;
          color: #013e37 !important;
          border-color: rgba(1, 62, 55, 0.2) !important;
        }
        .forced-light-theme input::placeholder {
          color: rgba(1, 62, 55, 0.45) !important;
        }
        .forced-light-theme input:hover {
          border-color: rgba(1, 62, 55, 0.4) !important;
        }
        .forced-light-theme input:focus,
        .forced-light-theme input:focus-visible {
          border-color: #013e37 !important;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.12) !important;
          outline: none !important;
        }
        .forced-light-theme label {
          color: #013e37 !important;
          font-weight: 700 !important;
        }
      `}</style>

      {/* Viewport container with soft mint-tinted neutral background (#f4fbf7) */}
      <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-[#f4fbf7] transition-colors duration-500 overflow-y-auto relative select-none forced-light-theme font-sans">
        
        {/* Floating background decorative shapes */}
        <div className="absolute top-[10%] left-[8%] w-24 sm:w-36 h-24 sm:h-36 bg-[#013e37]/5 rounded-full blur-xs pointer-events-none"></div>
        <div className="absolute bottom-[12%] left-[5%] w-16 sm:w-24 h-16 sm:h-24 bg-[#013e37]/5 rounded-2xl sm:rounded-3xl transform rotate-45 pointer-events-none"></div>
        <div className="absolute top-[15%] right-[6%] w-16 sm:w-20 h-16 sm:h-20 bg-[#013e37]/5 rounded-xl sm:rounded-2xl transform -rotate-12 pointer-events-none"></div>
        <div className="absolute bottom-[8%] right-[10%] w-24 sm:w-32 h-8 sm:h-10 bg-[#013e37]/5 rounded-full transform rotate-12 pointer-events-none"></div>

        {/* Centered Split-Screen Responsive Card */}
        <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-white border border-[#013e37]/15 shadow-xl overflow-hidden flex flex-col md:flex-row h-auto md:min-h-[540px] md:max-h-[600px] transition-all duration-300 pointer-events-auto select-text">
          
          {/* Left Side: Form Panel */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-8 md:p-10 overflow-y-auto bg-white">
            
            {/* Top Brand Header */}
            <div className="flex items-center justify-center w-full mb-5 sm:mb-6">
              <Image
                src="/icon1.png"
                alt="Nexus Logo"
                width={90}
                height={90}
                className="h-16 sm:h-20 w-auto object-contain transition-all hover:scale-105 duration-300"
                priority
              />
            </div>

            {/* Mid Form Section */}
            <div className="space-y-5 my-auto">
              <div className="space-y-1 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013e37]">
                  Welcome Back!
                </h1>
                <p className="text-xs sm:text-sm text-[#013e37]/75 font-medium">
                  Please enter your email and password to log in.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  className="border-[#013e37]/20 focus:ring-[#013e37]/15 focus:border-[#013e37] focus:outline-none py-2.5 text-sm rounded-lg transition-all duration-200 shadow-2xs text-[#013e37]"
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
                    className="pr-10 border-[#013e37]/20 focus:ring-[#013e37]/15 focus:border-[#013e37] focus:outline-none py-2.5 text-sm rounded-lg transition-all duration-200 shadow-2xs text-[#013e37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 bottom-2.5 z-10 p-1 rounded-md text-[#013e37]/60 hover:text-[#013e37] hover:bg-[#013e37]/10 transition-colors cursor-pointer focus:outline-none"
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

                {/* Submit Button with #013e37 background & #FFEFB3 text */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 h-10 sm:h-11 text-sm font-bold text-[#FFEFB3] bg-[#013e37] hover:bg-[#012d28] active:scale-[0.98] rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 text-[#FFEFB3]"
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
            <div className="mt-6 pt-4 border-t border-[#013e37]/10 space-y-1.5 text-center sm:text-left">
              <div className="text-[11px] sm:text-xs text-[#013e37]/75 font-medium">
                <span>Need help? Contact support at </span>
                <a
                  href="mailto:support@saanvinexus.com"
                  className="text-[#013e37] hover:underline font-bold"
                >
                  support@saanvinexus.com
                </a>
              </div>
              <div className="text-[10px] sm:text-xs text-[#013e37]/50 font-medium">
                All rights reserved © {new Date().getFullYear()} Nexus.
              </div>
            </div>

          </div>

          {/* Right Side: Visual & Slide Panel (Hidden on Mobile) */}
          <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-slate-100 min-h-[500px]">
            {/* Custom HRMS Image Banner */}
            <Image
              src="/images/hrms_banner.png"
              alt="Saanvi Perk HRMS"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            
            {/* Frosted Glass Overlay Slide Box */}
            <div className="absolute bottom-6 inset-x-6 backdrop-blur-md bg-[#013e37]/85 border border-[#FFEFB3]/20 rounded-2xl p-5 text-[#FFEFB3] shadow-lg transition-all duration-500">
              <h3 className="text-base sm:text-lg font-bold leading-snug mb-1 transition-all duration-500 text-[#FFEFB3]">
                {bannerSlides[activeSlide].title}
              </h3>
              <p className="text-xs text-[#FFEFB3]/90 transition-all duration-500 font-medium">
                {bannerSlides[activeSlide].description}
              </p>
            </div>

            {/* Next Slide Arrow Button */}
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % bannerSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#013e37] hover:bg-[#012d28] text-[#FFEFB3] flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none cursor-pointer z-20"
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