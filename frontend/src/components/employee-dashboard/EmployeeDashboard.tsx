"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserById,
  getDesignations,
} from "@/features/employees/api/employees.api";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";
import { getHolidays } from "@/features/organization/api/calendar.api";
import {
  createAttendanceCheckIn,
  updateAttendanceCheckOut,
} from "@/features/attendance/api/attendance.api";

// Import modular widgets
import { AttendanceCard } from "./AttendanceCard";
import { QuickActions } from "./QuickActions";
import { LeaveSummary } from "./LeaveSummary";

interface EmployeeDashboardProps {
  userName: string;
  companyName: string;
  onTabChange: (tab: string) => void;
}

const CHECKIN_ACTIVE_KEY = "sa_checkin_active";
const CHECKIN_TIMESTAMP_KEY = "sa_checkin_timestamp";
const CHECKIN_DISPLAY_KEY = "sa_checkin_display";
const CHECKIN_COORDS_KEY = "sa_checkin_coords";
const CHECKOUT_DISPLAY_KEY = "sa_checkout_display";
const CHECKOUT_TIMESTAMP_KEY = "sa_checkout_timestamp";
const WORKED_SECONDS_KEY = "sa_worked_seconds";

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  userName: propUserName,
  companyName,
  onTabChange,
}) => {
  const router = useRouter();

  // Authentication and Profile States
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [designations, setDesignations] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Holidays State
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);

  // Attendance Widget State (with persistence)
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [lastCoords, setLastCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Greeting Message
  const [greeting, setGreeting] = useState("Hello");

  // Load user token and attendance status on mount
  useEffect(() => {
    // 1. Resolve greeting based on time of day
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("Good morning");
    else if (hrs < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // 2. Resolve user ID from JWT token
    const currentId = getCurrentUserId();
    setUserId(currentId);

    // 3. Restore persisted Check-In & Timer state
    if (typeof window !== "undefined") {
      const active = localStorage.getItem(CHECKIN_ACTIVE_KEY);
      const timestamp = localStorage.getItem(CHECKIN_TIMESTAMP_KEY);
      const displayTime = localStorage.getItem(CHECKIN_DISPLAY_KEY);
      const coordsJson = localStorage.getItem(CHECKIN_COORDS_KEY);
      const checkoutDisplay = localStorage.getItem(CHECKOUT_DISPLAY_KEY);
      const checkoutTs = localStorage.getItem(CHECKOUT_TIMESTAMP_KEY);
      const savedWorkedSeconds = localStorage.getItem(WORKED_SECONDS_KEY);

      const today = new Date();
      const checkinDate = timestamp ? new Date(timestamp) : null;
      const checkoutDate = checkoutTs ? new Date(checkoutTs) : null;

      const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const isCheckinToday = checkinDate && !isNaN(checkinDate.getTime()) && isSameDay(checkinDate, today);
      const isCheckoutToday = checkoutDate && !isNaN(checkoutDate.getTime()) && isSameDay(checkoutDate, today);

      // If data is from a previous day, auto-reset for the new day
      if ((timestamp && !isCheckinToday) || (checkoutTs && !isCheckoutToday)) {
        localStorage.removeItem(CHECKIN_ACTIVE_KEY);
        localStorage.removeItem(CHECKIN_TIMESTAMP_KEY);
        localStorage.removeItem(CHECKIN_DISPLAY_KEY);
        localStorage.removeItem(CHECKIN_COORDS_KEY);
        localStorage.removeItem(CHECKOUT_DISPLAY_KEY);
        localStorage.removeItem(CHECKOUT_TIMESTAMP_KEY);
        localStorage.removeItem(WORKED_SECONDS_KEY);
        setIsCheckedIn(false);
        setCheckInTime(null);
        setCheckOutTime(null);
        setSeconds(0);
      } else if (active === "true" && isCheckinToday && timestamp) {
        setIsCheckedIn(true);
        const formatted = new Date(timestamp).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        setCheckInTime(formatted || displayTime || "--:-- --");
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
        );
        setSeconds(elapsed);

        if (coordsJson) {
          try {
            setLastCoords(JSON.parse(coordsJson));
          } catch (e) {
            // Ignore parse error
          }
        }
      } else if (isCheckoutToday && (checkoutDisplay || checkoutTs)) {
        const formattedOut = checkoutTs
          ? new Date(checkoutTs).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : checkoutDisplay;
        setCheckOutTime(formattedOut);
        if (savedWorkedSeconds) {
          setSeconds(Number(savedWorkedSeconds));
        }
      }
    }
  }, []);

  // Clock Attendance Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  // Fetch device geolocation with browser permission prompt
  const fetchUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let msg = "Could not get your location.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location permission denied. Please allow location access in your browser to record punch coordinates.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            msg = "Location request timed out.";
          }
          toast.error(msg);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Handle Check-In Click
  const handleCheckIn = async () => {
    setIsLoadingLocation(true);
    const coords = await fetchUserLocation();
    setIsLoadingLocation(false);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setIsCheckedIn(true);
    setCheckInTime(timeStr);
    setCheckOutTime(null);
    setSeconds(0);
    if (coords) setLastCoords(coords);

    if (typeof window !== "undefined") {
      localStorage.setItem(CHECKIN_ACTIVE_KEY, "true");
      localStorage.setItem(CHECKIN_TIMESTAMP_KEY, now.toISOString());
      localStorage.setItem(CHECKIN_DISPLAY_KEY, timeStr);
      localStorage.removeItem(CHECKOUT_DISPLAY_KEY);
      localStorage.removeItem(CHECKOUT_TIMESTAMP_KEY);
      localStorage.removeItem(WORKED_SECONDS_KEY);
      if (coords) {
        localStorage.setItem(CHECKIN_COORDS_KEY, JSON.stringify(coords));
      }
    }

    // Persist to Backend Database for Admin records
    if (userId) {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayDate = `${year}-${month}-${day}`;

      createAttendanceCheckIn({
        userId,
        attendanceDate: todayDate,
        checkInTime: now.toISOString(),
        checkInLatitude: coords ? coords.latitude : undefined,
        checkInLongitude: coords ? coords.longitude : undefined,
        attendanceStatus: "PRESENT",
      })
        .then((res) => {
          if (res?.data?.attendanceId) {
            localStorage.setItem("sa_attendance_id", String(res.data.attendanceId));
          }
        })
        .catch((err) => {
          console.warn("Could not sync check-in with backend attendance table:", err);
        });
    }

    toast.success(`Checked in successfully at ${timeStr}`);
  };

  // Handle Check-Out Click
  const handleCheckOut = async () => {
    setIsLoadingLocation(true);
    const coords = await fetchUserLocation();
    setIsLoadingLocation(false);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setIsCheckedIn(false);
    setCheckOutTime(timeStr);

    if (typeof window !== "undefined") {
      localStorage.removeItem(CHECKIN_ACTIVE_KEY);
      localStorage.removeItem(CHECKIN_TIMESTAMP_KEY);
      localStorage.removeItem(CHECKIN_DISPLAY_KEY);
      localStorage.removeItem(CHECKIN_COORDS_KEY);
      localStorage.setItem(CHECKOUT_DISPLAY_KEY, timeStr);
      localStorage.setItem(CHECKOUT_TIMESTAMP_KEY, now.toISOString());
      localStorage.setItem(WORKED_SECONDS_KEY, String(seconds));
    }

    // Persist Check-Out in Backend Database
    const savedAttendanceId = typeof window !== "undefined" ? localStorage.getItem("sa_attendance_id") : null;
    if (savedAttendanceId) {
      updateAttendanceCheckOut(Number(savedAttendanceId), {
        checkOutTime: now.toISOString(),
        checkOutLatitude: coords ? coords.latitude : undefined,
        checkOutLongitude: coords ? coords.longitude : undefined,
        workingMinutes: Math.round(seconds / 60),
      }).catch((err) => {
        console.warn("Could not sync check-out with backend attendance table:", err);
      });
    }

    toast.success(`Checked out successfully at ${timeStr}`);
  };

  // Fetch API Data
  useEffect(() => {
    if (!userId) return;

    const loadDashboardData = async () => {
      setIsLoadingProfile(true);
      setIsLoadingHolidays(true);

      try {
        const [desData, userRes, holidaysRes] = await Promise.all([
          getDesignations(),
          getUserById(userId),
          getHolidays().catch((err) => {
            console.error("Error loading holidays:", err);
            return { success: false, data: [] };
          }),
        ]);

        setDesignations(desData || []);

        if (userRes.success && userRes.data) {
          setUserProfile(userRes.data);
        }

        if (holidaysRes.success && Array.isArray(holidaysRes.data)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcoming = holidaysRes.data
            .filter((h: any) => new Date(h.startDate).setHours(0, 0, 0, 0) >= today.getTime())
            .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 3)
            .map((h: any) => {
              const d = new Date(h.startDate);
              return {
                id: h.holidayId,
                date: d.getDate(),
                month: d.toLocaleString("en-US", { month: "short" }),
                day: d.toLocaleString("en-US", { weekday: "long" }),
                title: h.holidayName,
              };
            });
          setHolidays(upcoming);
        }
        setIsLoadingHolidays(false);
      } catch (err) {
        console.error("Error loading dashboard details:", err);
        setIsLoadingHolidays(false);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min((seconds / (8 * 3600)) * 100, 100);

  // Full Name
  const employeeFullName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
    : propUserName || "Employee";

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeSlide && newIndex >= 0 && newIndex <= 2) {
        setActiveSlide(newIndex);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (!carouselRef.current) return;
    const targetLeft = index * carouselRef.current.clientWidth;
    carouselRef.current.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
    setActiveSlide(index);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in text-slate-800 pb-8">
      {/* 1. Swipeable Hero Carousel (Greeting -> Leave Summary -> Upcoming Holidays) */}
      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex items-stretch overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1"
        >
          {/* Slide 0: Greeting & Workspace Status */}
          <div className="w-full shrink-0 snap-center snap-always pr-0 flex">
            <div className="w-full flex items-center justify-between gap-3 bg-white border border-[#013e37]/15 py-3 px-4 sm:py-3.5 sm:px-5 rounded-2xl sm:rounded-3xl shadow-xs">
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-extrabold text-[#013e37] tracking-tight">
                    Hi, {employeeFullName}!
                  </h1>
                  <span className="text-base sm:text-lg select-none">👋</span>
                </div>
              </div>

              {/* Date Pill at Right End */}
              <div className="px-2.5 py-1.5 bg-[#f4fbf7] border border-[#013e37]/15 rounded-xl text-center shrink-0">
                <p className="text-[8px] text-[#013e37]/75 font-bold uppercase tracking-wider">Today</p>
                <p className="text-xs sm:text-xs font-extrabold text-[#013e37] whitespace-nowrap">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Slide 1: Leave Balances Summary */}
          <div className="w-full shrink-0 snap-center snap-always pr-0 flex">
            <div className="w-full bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-extrabold text-[#013e37] text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Leave Summary</span>
                </h3>
                <button
                  onClick={() => onTabChange("holidays-leaves")}
                  className="text-[10px] font-bold text-[#013e37] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center my-1">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-1.5">
                  <p className="text-[8px] text-emerald-800 font-bold uppercase tracking-wider">Available</p>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5">12.0</p>
                </div>
                <div className="bg-[#f4fbf7] border border-[#013e37]/15 rounded-xl p-1.5">
                  <p className="text-[8px] text-[#013e37]/80 font-bold uppercase tracking-wider">Used</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[#013e37] mt-0.5">3.0</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Pending</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">0.0</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Sick/Casual: 9 Bal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Earned: 0 Bal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Comp-Off: 0
                </span>
              </div>
            </div>
          </div>

          {/* Slide 2: Upcoming Holidays */}
          <div className="w-full shrink-0 snap-center snap-always pr-0 flex">
            <div className="w-full bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#013e37]" />
                  <h3 className="font-extrabold text-[#013e37] text-xs sm:text-sm">
                    Upcoming Holidays
                  </h3>
                </div>
                <button
                  onClick={() => onTabChange("holidays-leaves")}
                  className="text-[10px] font-bold text-[#013e37] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Calendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoadingHolidays ? (
                <div className="py-2 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#013e37] animate-spin" />
                  <span className="text-[10px] text-slate-400 font-semibold">Loading holidays...</span>
                </div>
              ) : holidays.length === 0 ? (
                <p className="text-center py-2 text-xs font-semibold text-slate-400">
                  No upcoming holidays scheduled for this month.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-auto">
                  {holidays.slice(0, 2).map((h, idx) => (
                    <div
                      key={`${h.id}-${idx}`}
                      className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="bg-[#013e37] text-[#ffefb3] rounded-lg px-2 py-0.5 flex flex-col items-center justify-center min-w-[32px] text-[8px] font-extrabold">
                        <span className="text-xs font-extrabold leading-none">{h.date}</span>
                        <span className="text-[7px] font-bold uppercase mt-0.5 opacity-90">{h.month}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-tight truncate">{h.title}</p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{h.day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Navigation Dots */}
        <div className="flex items-center justify-center gap-2 pt-1.5 pb-0">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                activeSlide === idx
                  ? "w-6 h-1.5 bg-[#013e37] shadow-xs"
                  : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Primary Section: Check-In & Live Timer Hero Card */}
      <AttendanceCard
        isCheckedIn={isCheckedIn}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
        seconds={seconds}
        formatTime={formatTime}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        isLoadingLocation={isLoadingLocation}
      />

      {/* 3. App Services Hub: Sidebar Sections in 3 or 4 Column Grid */}
      <QuickActions onTabChange={onTabChange} />
    </div>
  );
};
