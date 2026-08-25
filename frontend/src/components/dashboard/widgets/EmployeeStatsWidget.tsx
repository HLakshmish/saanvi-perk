"use client";

import React, { useState, useEffect } from "react";
import { getEmployees } from "@/features/employees/api/employees.api";
import { getAttendances } from "@/features/attendance/api/attendance.api";
import { fetchLeaveRequests } from "@/features/leaves/api/leaves.api";

interface EmployeeStatsProps {
  headcount?: number;
  atWork?: number;
  onLeave?: number;
  absent?: number;
}

export const EmployeeStatsWidget: React.FC<EmployeeStatsProps> = ({
  headcount: propHeadcount,
  atWork: propAtWork,
  onLeave: propOnLeave,
  absent: propAbsent,
}) => {
  const [headcount, setHeadcount] = useState<number>(propHeadcount ?? 0);
  const [atWork, setAtWork] = useState<number>(propAtWork ?? 0);
  const [onLeave, setOnLeave] = useState<number>(propOnLeave ?? 0);
  const [absent, setAbsent] = useState<number>(propAbsent ?? 0);
  const [joinedThisMonth, setJoinedThisMonth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // If props are passed explicitly, respect them
    if (
      propHeadcount !== undefined &&
      propAtWork !== undefined &&
      propOnLeave !== undefined &&
      propAbsent !== undefined
    ) {
      setHeadcount(propHeadcount);
      setAtWork(propAtWork);
      setOnLeave(propOnLeave);
      setAbsent(propAbsent);
      setIsLoading(false);
      return;
    }

    const loadRealStats = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const todayStart = new Date(yyyy, today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(yyyy, today.getMonth(), today.getDate(), 23, 59, 59, 999);
        const monthStart = new Date(yyyy, today.getMonth(), 1);

        const [employeesRes, attendanceRes, leavesRes] = await Promise.allSettled([
          getEmployees(),
          getAttendances({ attendanceDate: todayStr }),
          fetchLeaveRequests(),
        ]);

        // 1. Calculate Real Headcount
        let empList: any[] = [];
        if (employeesRes.status === "fulfilled" && Array.isArray(employeesRes.value)) {
          empList = employeesRes.value;
        }
        const totalEmployees = empList.length;
        setHeadcount(totalEmployees);

        // Joined this month count
        const newJoinees = empList.filter((e: any) => {
          if (!e.createdAt && !e.joiningDate) return false;
          const joinD = new Date(e.joiningDate || e.createdAt);
          return joinD >= monthStart && joinD <= todayEnd;
        }).length;
        setJoinedThisMonth(newJoinees);

        // 2. Calculate At Work Currently (Checked in today and not absent)
        let attendanceList: any[] = [];
        if (attendanceRes.status === "fulfilled" && attendanceRes.value?.success && Array.isArray(attendanceRes.value.data)) {
          attendanceList = attendanceRes.value.data;
        }

        // Count unique users at work today (checked in and not ABSENT)
        const activeUsersAtWork = new Set<number>();
        attendanceList.forEach((att: any) => {
          if (att.checkInTime && att.attendanceStatus !== "ABSENT") {
            activeUsersAtWork.add(Number(att.userId));
          }
        });
        const currentAtWork = activeUsersAtWork.size;
        setAtWork(currentAtWork);

        // 3. Calculate On Leave Today
        let leaveList: any[] = [];
        if (leavesRes.status === "fulfilled" && leavesRes.value?.success && Array.isArray(leavesRes.value.data)) {
          leaveList = leavesRes.value.data;
        }

        const usersOnLeave = new Set<number>();
        leaveList.forEach((l: any) => {
          const status = String(l.status || "").toUpperCase();
          if (status === "APPROVED" && l.fromDate && l.toDate) {
            const fromD = new Date(l.fromDate);
            const toD = new Date(l.toDate);
            // Check if today falls between fromDate and toDate
            if (todayStart <= toD && todayEnd >= fromD) {
              usersOnLeave.add(Number(l.userId));
            }
          }
        });
        const currentOnLeave = usersOnLeave.size;
        setOnLeave(currentOnLeave);

        // 4. Calculate Absent (Total Headcount - At Work - On Leave)
        const currentAbsent = Math.max(0, totalEmployees - currentAtWork - currentOnLeave);
        setAbsent(currentAbsent);
      } catch (err) {
        console.error("Error loading live employee stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealStats();
  }, [propHeadcount, propAtWork, propOnLeave, propAbsent]);

  const atWorkPercent = headcount > 0 ? ((atWork / headcount) * 100).toFixed(1) : "0.0";

  const stats = [
    {
      label: "Total Headcount",
      value: headcount,
      subtext: joinedThisMonth > 0 ? `+${joinedThisMonth} joined this month` : `${headcount} active on roster`,
      badge: "Active Roster",
      avatar: "/images/avatars/headcount.jpg",
    },
    {
      label: "At Work Currently",
      value: atWork,
      subtext: `${atWorkPercent}% checked in today`,
      badge: "Live Clocked",
      avatar: "/images/avatars/atwork.jpg",
      isLive: true,
    },
    {
      label: "On Leave Today",
      value: onLeave,
      subtext: onLeave > 0 ? `${onLeave} on approved leave` : "No employees on leave",
      badge: "Approved",
      avatar: "/images/avatars/onleave.jpg",
    },
    {
      label: "Absent",
      value: absent,
      subtext: absent > 0 ? `${absent} not clocked in yet` : "All employees accounted",
      badge: absent > 0 ? "Pending Punch" : "Complete",
      avatar: "/images/avatars/absent.jpg",
    },
  ];

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-4 mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          return (
            <div
              key={stat.label}
              className="bg-white rounded-3xl border border-slate-200/70 p-5 shadow-2xs hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden group cursor-pointer h-36 flex flex-col justify-between"
            >
              {/* Straight background illustration card aligned to the right */}
              <div className="absolute bottom-2.5 right-2.5 w-24 h-24 transform group-hover:scale-105 transition-all duration-300 pointer-events-none opacity-95 group-hover:opacity-100 overflow-hidden rounded-3xl bg-white shadow-xs border border-slate-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] z-10" />
                <img
                  src={stat.avatar}
                  alt={stat.label}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Top badge */}
              <div className="relative z-10 self-start">
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-brand-primary/15 bg-brand-primary-light text-brand-primary">
                  {stat.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <span>{stat.badge}</span>
                </div>
              </div>

              {/* Stat details on the left */}
              <div className="relative z-10 pr-20">
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-brand-primary transition-colors">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded-md" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-[13px] font-extrabold text-slate-800 leading-tight">
                  {stat.label}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
                  {stat.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
