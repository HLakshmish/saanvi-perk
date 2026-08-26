"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import {
  getUserById,
  getDesignations,
} from "@/features/employees/api/employees.api";
import { getCurrentUserId } from "@/features/expenses/api/expenses.api";
import { getHolidays } from "@/features/organization/api/calendar.api";
import {
  createAttendanceCheckIn,
  updateAttendanceCheckOut,
  getAttendances,
} from "@/features/attendance/api/attendance.api";
import { fetchLeaveRequests } from "@/features/leaves/api/leaves.api";
import { fetchLeaveTypes, fetchLeaveAccumulations } from "@/features/settings/api/settings.api";

// Import modular widgets
import { AttendanceCard } from "./AttendanceCard";
import { QuickActions } from "./QuickActions";
import { LeaveSummary } from "./LeaveSummary";
import { EmployeeDashboardSkeleton } from "./EmployeeDashboardSkeleton";
import { CheersToPeersWidget } from "@/components/dashboard/widgets/CheersToPeersWidget";

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

  // Leave Summary State (Real dynamic data)
  const [leaveSummary, setLeaveSummary] = useState({
    available: 12.0,
    used: 0.0,
    pending: 0.0,
    sickBal: 12.0,
    earnedBal: 0.0,
    compBal: 0.0,
    isLoading: true,
  });

  // Attendance Widget State (with persistence)
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [lastCoords, setLastCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Greeting Message
  const [greeting, setGreeting] = useState("Hello");

  const isDateToday = (dStr?: string | null) => {
    if (!dStr) return false;
    const d = new Date(dStr);
    if (isNaN(d.getTime()) || d.getFullYear() < 2024) return false;
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const getUserKey = (prefix: string, uid: number | null) => `${prefix}_${uid || "guest"}`;

  // Load user token and attendance status on mount / user change
  useEffect(() => {
    // 1. Resolve user ID from JWT token
    const currentId = getCurrentUserId();
    setUserId(currentId);
  }, []);

  // Sync attendance state specifically for the current logged-in userId
  useEffect(() => {
    if (!userId) return;

    const syncUserAttendance = async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayDate = `${year}-${month}-${day}`;

      // User-scoped localStorage keys
      const userActiveKey = getUserKey(CHECKIN_ACTIVE_KEY, userId);
      const userTsKey = getUserKey(CHECKIN_TIMESTAMP_KEY, userId);
      const userDisplayKey = getUserKey(CHECKIN_DISPLAY_KEY, userId);
      const userCoordsKey = getUserKey(CHECKIN_COORDS_KEY, userId);
      const userCheckoutDisplayKey = getUserKey(CHECKOUT_DISPLAY_KEY, userId);
      const userCheckoutTsKey = getUserKey(CHECKOUT_TIMESTAMP_KEY, userId);
      const userWorkedSecondsKey = getUserKey(WORKED_SECONDS_KEY, userId);

      if (typeof window !== "undefined") {
        // Clean legacy un-scoped keys if present
        localStorage.removeItem(CHECKIN_ACTIVE_KEY);
        localStorage.removeItem(CHECKIN_TIMESTAMP_KEY);
        localStorage.removeItem(CHECKIN_DISPLAY_KEY);
        localStorage.removeItem(CHECKIN_COORDS_KEY);
        localStorage.removeItem(CHECKOUT_DISPLAY_KEY);
        localStorage.removeItem(CHECKOUT_TIMESTAMP_KEY);
        localStorage.removeItem(WORKED_SECONDS_KEY);

        const active = localStorage.getItem(userActiveKey);
        const timestamp = localStorage.getItem(userTsKey);
        const displayTime = localStorage.getItem(userDisplayKey);
        const coordsJson = localStorage.getItem(userCoordsKey);
        const checkoutDisplay = localStorage.getItem(userCheckoutDisplayKey);
        const checkoutTs = localStorage.getItem(userCheckoutTsKey);
        const savedWorkedSeconds = localStorage.getItem(userWorkedSecondsKey);

        const isCheckinToday = isDateToday(timestamp);
        const isCheckoutToday = isDateToday(checkoutTs);

        // If data is from a previous day or invalid, auto-reset for this user
        if ((timestamp && !isCheckinToday) || (checkoutTs && !isCheckoutToday)) {
          localStorage.removeItem(userActiveKey);
          localStorage.removeItem(userTsKey);
          localStorage.removeItem(userDisplayKey);
          localStorage.removeItem(userCoordsKey);
          localStorage.removeItem(userCheckoutDisplayKey);
          localStorage.removeItem(userCheckoutTsKey);
          localStorage.removeItem(userWorkedSecondsKey);
          localStorage.removeItem(getUserKey("sa_attendance_id", userId));
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
            Math.min(24 * 3600, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000))
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
          setIsCheckedIn(false);
          setCheckOutTime(formattedOut);
          if (savedWorkedSeconds) {
            setSeconds(Math.min(24 * 3600, Math.max(0, Number(savedWorkedSeconds))));
          }
        } else {
          // Fresh state for this employee
          setIsCheckedIn(false);
          setCheckInTime(null);
          setCheckOutTime(null);
          setSeconds(0);
        }
      }

      // Query authoritative Backend API for today's attendance for THIS employee
      try {
        const attRes = await getAttendances({ userId, attendanceDate: todayDate });
        const records = Array.isArray(attRes?.data)
          ? attRes.data
          : Array.isArray(attRes)
          ? attRes
          : [];

        // Strictly match records belonging to THIS user from TODAY
        const userTodayRecord = records.find((r: any) => {
          const matchesUser = String(r.userId) === String(userId) || Number(r.userId) === Number(userId);
          const matchesDate = isDateToday(r.attendanceDate) || isDateToday(r.checkInTime) || isDateToday(r.createdAt);
          return matchesUser && matchesDate;
        });

        if (userTodayRecord) {
          if (typeof window !== "undefined") {
            localStorage.setItem(getUserKey("sa_attendance_id", userId), String(userTodayRecord.attendanceId));
          }

          if (userTodayRecord.checkInTime && isDateToday(userTodayRecord.checkInTime)) {
            const checkInDateObj = new Date(userTodayRecord.checkInTime);
            const checkInFormatted = checkInDateObj.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            setCheckInTime(checkInFormatted);

            if (userTodayRecord.checkOutTime && isDateToday(userTodayRecord.checkOutTime)) {
              const checkOutDateObj = new Date(userTodayRecord.checkOutTime);
              const checkOutFormatted = checkOutDateObj.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              setIsCheckedIn(false);
              setCheckOutTime(checkOutFormatted);
              const totalSecs = userTodayRecord.workingMinutes
                ? Math.min(24 * 3600, userTodayRecord.workingMinutes * 60)
                : Math.min(24 * 3600, Math.max(0, Math.floor((checkOutDateObj.getTime() - checkInDateObj.getTime()) / 1000)));
              setSeconds(totalSecs);

              if (typeof window !== "undefined") {
                localStorage.removeItem(userActiveKey);
                localStorage.setItem(userCheckoutDisplayKey, checkOutFormatted);
                localStorage.setItem(userCheckoutTsKey, userTodayRecord.checkOutTime);
                localStorage.setItem(userWorkedSecondsKey, String(totalSecs));
              }
            } else {
              setIsCheckedIn(true);
              setCheckOutTime(null);
              const elapsed = Math.max(
                0,
                Math.min(24 * 3600, Math.floor((Date.now() - checkInDateObj.getTime()) / 1000))
              );
              setSeconds(elapsed);

              if (typeof window !== "undefined") {
                localStorage.setItem(userActiveKey, "true");
                localStorage.setItem(userTsKey, userTodayRecord.checkInTime);
                localStorage.setItem(userDisplayKey, checkInFormatted);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync today's attendance from backend:", err);
      }
    };

    syncUserAttendance();
  }, [userId]);

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
        toast.error("GPS location is strictly required to punch attendance, but Geolocation is not supported by your browser.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (
            position &&
            position.coords &&
            typeof position.coords.latitude === "number" &&
            typeof position.coords.longitude === "number"
          ) {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          } else {
            toast.error("Could not obtain valid GPS coordinates. Please ensure your device GPS is turned on.");
            resolve(null);
          }
        },
        (error) => {
          let msg = "Could not obtain your GPS location.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location permission denied. GPS location is strictly required to check in/out. Please enable location access in your browser settings.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = "GPS location is currently unavailable. Please enable device location / GPS.";
          } else if (error.code === error.TIMEOUT) {
            msg = "GPS location request timed out. Please check your GPS signal and try again.";
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
    if (checkOutTime) {
      toast.info("You have already checked out for today. See you tomorrow! 👋");
      return;
    }

    setIsLoadingLocation(true);
    const coords = await fetchUserLocation();
    setIsLoadingLocation(false);

    // Strictly enforce GPS requirement: Do not proceed without coordinates
    if (!coords || typeof coords.latitude !== "number" || typeof coords.longitude !== "number") {
      toast.error("Check-in blocked: GPS location is mandatory to punch in.");
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setIsCheckedIn(true);
    setCheckInTime(timeStr);
    setCheckOutTime(null);
    setSeconds(0);
    setLastCoords(coords);

    if (typeof window !== "undefined" && userId) {
      localStorage.setItem(getUserKey(CHECKIN_ACTIVE_KEY, userId), "true");
      localStorage.setItem(getUserKey(CHECKIN_TIMESTAMP_KEY, userId), now.toISOString());
      localStorage.setItem(getUserKey(CHECKIN_DISPLAY_KEY, userId), timeStr);
      localStorage.removeItem(getUserKey(CHECKOUT_DISPLAY_KEY, userId));
      localStorage.removeItem(getUserKey(CHECKOUT_TIMESTAMP_KEY, userId));
      localStorage.removeItem(getUserKey(WORKED_SECONDS_KEY, userId));
      localStorage.setItem(getUserKey(CHECKIN_COORDS_KEY, userId), JSON.stringify(coords));
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
        checkInLatitude: coords.latitude,
        checkInLongitude: coords.longitude,
        attendanceStatus: "PRESENT",
      })
        .then((res) => {
          if (res?.data?.attendanceId && typeof window !== "undefined") {
            localStorage.setItem(getUserKey("sa_attendance_id", userId), String(res.data.attendanceId));
          } else if (res?.message?.includes("already exists") || res?.error?.includes("already exists")) {
            toast.info("You have already checked out for today. See you tomorrow! 👋");
          }
        })
        .catch((err) => {
          const msg = err?.message || "";
          if (msg.includes("already exists")) {
            toast.info("You have already checked out for today. See you tomorrow! 👋");
          } else {
            console.warn("Could not sync check-in with backend attendance table:", err);
          }
        });
    }

    toast.success(`Checked in successfully at ${timeStr}`);
  };

  // Handle Check-Out Click
  const handleCheckOut = async () => {
    setIsLoadingLocation(true);
    const coords = await fetchUserLocation();
    setIsLoadingLocation(false);

    // Strictly enforce GPS requirement: Do not proceed without coordinates
    if (!coords || typeof coords.latitude !== "number" || typeof coords.longitude !== "number") {
      toast.error("Check-out blocked: GPS location is mandatory to punch out.");
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setIsCheckedIn(false);
    setCheckOutTime(timeStr);

    if (typeof window !== "undefined" && userId) {
      localStorage.removeItem(getUserKey(CHECKIN_ACTIVE_KEY, userId));
      localStorage.removeItem(getUserKey(CHECKIN_TIMESTAMP_KEY, userId));
      localStorage.removeItem(getUserKey(CHECKIN_DISPLAY_KEY, userId));
      localStorage.removeItem(getUserKey(CHECKIN_COORDS_KEY, userId));
      localStorage.setItem(getUserKey(CHECKOUT_DISPLAY_KEY, userId), timeStr);
      localStorage.setItem(getUserKey(CHECKOUT_TIMESTAMP_KEY, userId), now.toISOString());
      localStorage.setItem(getUserKey(WORKED_SECONDS_KEY, userId), String(seconds));
    }

    // Persist Check-Out in Backend Database
    const savedAttendanceId =
      typeof window !== "undefined" && userId
        ? localStorage.getItem(getUserKey("sa_attendance_id", userId))
        : null;

    if (savedAttendanceId) {
      try {
        await updateAttendanceCheckOut(Number(savedAttendanceId), {
          checkOutTime: now.toISOString(),
          checkOutLatitude: coords.latitude,
          checkOutLongitude: coords.longitude,
          workingMinutes: Math.round(seconds / 60),
        });
        // Immediately refresh leave balances & attendance records
        await loadDashboardData();
      } catch (err) {
        console.warn("Could not sync check-out with backend attendance table:", err);
      }
    }

    toast.success("You've successfully checked out for today");
  };

  // Load dashboard profile, holidays, and live leave summary data
  const loadDashboardData = async () => {
    if (!userId) return;
    setIsLoadingProfile(true);
    setIsLoadingHolidays(true);

    try {
      const [desData, userRes, holidaysRes, leaveReqsRes, leaveTypesRes, leaveAccsRes] = await Promise.all([
        getDesignations(),
        getUserById(userId),
        getHolidays().catch((err) => {
          console.error("Error loading holidays:", err);
          return { success: false, data: [] };
        }),
        fetchLeaveRequests(userId).catch(() => ({ success: false, data: [] })),
        fetchLeaveTypes().catch(() => ({ success: false, data: [] })),
        fetchLeaveAccumulations().catch(() => ({ success: false, data: [] })),
      ]);

      setDesignations(desData || []);

      if (userRes.success && userRes.data) {
        setUserProfile(userRes.data);
      }

      // Process real Leave Summary Data
      const types = (leaveTypesRes.success && Array.isArray(leaveTypesRes.data)) ? leaveTypesRes.data : [];
      const userAccs = (leaveAccsRes.success && Array.isArray(leaveAccsRes.data))
        ? leaveAccsRes.data.filter((a: any) => Number(a.userId) === Number(userId) && a.status)
        : [];

      let dynamicSick = 0;
      let dynamicComp = 0;
      let dynamicEarned = 0;
      let dynamicLop = 0;

      types.forEach((lt: any) => {
        const alloc = userAccs.find((a: any) => Number(a.leaveTypeId) === Number(lt.leaveTypeId));
        const limit = alloc ? Number(alloc.numberOfLeaves) : 0;
        const name = (lt.leaveName || "").toLowerCase();
        const code = (lt.leaveCode || "").toLowerCase();

        if (name.includes("sick") || name.includes("casual") || code.includes("sl") || code.includes("cl")) {
          dynamicSick += limit;
        } else if (name.includes("comp") || code.includes("comp")) {
          dynamicComp += limit;
        } else if (name.includes("earned") || name.includes("annual") || name.includes("privilege") || code.includes("el") || code.includes("al") || code.includes("pl")) {
          dynamicEarned += limit;
        } else if (name.includes("loss") || name.includes("lop") || code.includes("lop")) {
          dynamicLop += limit;
        }
      });

      // Default to standard 12 sick/casual if no custom allocation configured yet
      const accumulatedSick = userAccs.length > 0 ? dynamicSick : 12.0;
      const accumulatedComp = dynamicComp;
      const accumulatedEarned = dynamicEarned;
      const accumulatedLop = dynamicLop;
      const totalAccumulated = accumulatedSick + accumulatedComp + accumulatedEarned + accumulatedLop;

      const reqs = (leaveReqsRes.success && Array.isArray(leaveReqsRes.data)) ? leaveReqsRes.data : [];
      let availedSick = 0;
      let availedComp = 0;
      let availedEarned = 0;
      let availedLop = 0;
      let totalUsed = 0;
      let pendingDays = 0;

      reqs.forEach((r: any) => {
        const status = (r.status || "").toUpperCase();
        const days = Number(r.numberOfDays ?? r.days ?? 1);
        const lt = r.leaveType || {};
        const typeName = (lt.leaveName || r.leaveTypeName || r.leaveType || "").toLowerCase();
        const typeCode = (lt.leaveCode || "").toLowerCase();

        if (status === "APPROVED") {
          totalUsed += days;
          if (typeName.includes("sick") || typeName.includes("casual") || typeCode.includes("sl") || typeCode.includes("cl")) {
            availedSick += days;
          } else if (typeName.includes("comp") || typeCode.includes("comp")) {
            availedComp += days;
          } else if (typeName.includes("earned") || typeName.includes("annual") || typeName.includes("privilege") || typeCode.includes("el") || typeCode.includes("al") || typeCode.includes("pl")) {
            availedEarned += days;
          } else if (typeName.includes("loss") || typeName.includes("lop") || typeCode.includes("lop")) {
            availedLop += days;
          } else {
            availedSick += days;
          }
        } else if (status === "PENDING") {
          pendingDays += days;
        }
      });

      const balanceSick = Math.max(0, accumulatedSick - availedSick);
      const balanceEarned = Math.max(0, accumulatedEarned - availedEarned);
      const balanceComp = Math.max(0, accumulatedComp - availedComp);
      const totalAvailable = Math.max(0, totalAccumulated - totalUsed);

      setLeaveSummary({
        available: Number(totalAvailable.toFixed(1)),
        used: Number(totalUsed.toFixed(1)),
        pending: Number(pendingDays.toFixed(1)),
        sickBal: Number(balanceSick.toFixed(1)),
        earnedBal: Number(balanceEarned.toFixed(1)),
        compBal: Number(balanceComp.toFixed(1)),
        isLoading: false,
      });

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

  // Fetch API Data
  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const formatTime = (totalSecs: number) => {
    if (isNaN(totalSecs) || totalSecs < 0) return "00:00:00";
    const validSecs = Math.min(Math.max(0, Math.floor(totalSecs)), 24 * 3600);
    const hrs = Math.floor(validSecs / 3600);
    const mins = Math.floor((validSecs % 3600) / 60);
    const secs = validSecs % 60;
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
      if (newIndex !== activeSlide && newIndex >= 0 && newIndex <= 1) {
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

  if (isLoadingProfile) {
    return <EmployeeDashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in text-slate-800 pb-8">
      {/* 1. Swipeable Hero Carousel (Leave Summary -> Upcoming Holidays) */}
      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex items-stretch overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1"
        >
          {/* Slide 0: Leave Balances Summary */}
          <div className="w-full shrink-0 snap-center snap-always pr-0 flex">
            <div className="w-full bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-extrabold text-brand-primary text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Leave Summary</span>
                </h3>
                <button
                  onClick={() => onTabChange("holidays-leaves")}
                  className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center my-1">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-1.5">
                  <p className="text-[8px] text-emerald-800 font-bold uppercase tracking-wider">Available</p>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5">
                    {leaveSummary.isLoading ? "--" : leaveSummary.available.toFixed(1)}
                  </p>
                </div>
                <div className="bg-brand-primary-light border border-brand-primary/15 rounded-xl p-1.5">
                  <p className="text-[8px] text-brand-primary/80 font-bold uppercase tracking-wider">Used</p>
                  <p className="text-xs sm:text-sm font-extrabold text-brand-primary mt-0.5">
                    {leaveSummary.isLoading ? "--" : leaveSummary.used.toFixed(1)}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Pending</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                    {leaveSummary.isLoading ? "--" : leaveSummary.pending.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Sick/Casual: {leaveSummary.isLoading ? "--" : `${leaveSummary.sickBal} Bal`}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Earned: {leaveSummary.isLoading ? "--" : `${leaveSummary.earnedBal} Bal`}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Comp-Off: {leaveSummary.isLoading ? "--" : `${leaveSummary.compBal} Bal`}
                </span>
              </div>
            </div>
          </div>

          {/* Slide 1: Upcoming Holidays */}
          <div className="w-full shrink-0 snap-center snap-always pr-0 flex">
            <div className="w-full bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-brand-primary" />
                  <h3 className="font-extrabold text-brand-primary text-xs sm:text-sm">
                    Upcoming Holidays
                  </h3>
                </div>
                <button
                  onClick={() => onTabChange("holidays-leaves")}
                  className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Calendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoadingHolidays ? (
                <div className="py-2 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-brand-primary animate-spin" />
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
                      <div className="bg-brand-primary text-brand-accent-light rounded-lg px-2 py-0.5 flex flex-col items-center justify-center min-w-[32px] text-[8px] font-extrabold">
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
          {[0, 1].map((idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                activeSlide === idx
                  ? "w-6 h-1.5 bg-brand-primary shadow-xs"
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

      {/* 4. Cheers To Peers Celebrations Widget */}
      <CheersToPeersWidget />
    </div>
  );
};
