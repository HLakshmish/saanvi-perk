const attendanceRepository = require("./attendance.repository");
const prisma = require("../config/prisma");

class AttendanceService {
    constructor() {
        this.syncingCompanies = new Set();
    }

    calculateAttendanceStatus(data) {
        if (data.checkInTime && data.checkOutTime) {
            const inDate = new Date(data.checkInTime);
            const outDate = new Date(data.checkOutTime);
            if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime())) {
                let inMinutes = inDate.getUTCHours() * 60 + inDate.getUTCMinutes();
                let outMinutes = outDate.getUTCHours() * 60 + outDate.getUTCMinutes();
                let diffMins = outMinutes - inMinutes;
                if (diffMins < 0) {
                    diffMins += 24 * 60; // Night shift crossing midnight
                }
                data.workingMinutes = diffMins;
                if (diffMins > 480) {
                    data.overtimeMinutes = diffMins - 480;
                    data.earlyCheckoutMinutes = 0;
                } else {
                    data.overtimeMinutes = 0;
                    data.earlyCheckoutMinutes = 480 - diffMins;
                }
            }
        }

        if (data.workingMinutes !== undefined && data.workingMinutes !== null) {
            const workingHours = data.workingMinutes / 60;
            if (workingHours >= 8) {
                data.attendanceStatus = 'PRESENT';
            } else if (workingHours >= 4 && workingHours < 8) {
                data.attendanceStatus = 'HALF_DAY';
            } else {
                data.attendanceStatus = 'ABSENT';
            }
        } else if (data.checkInTime) {
            // Checked in, but has not checked out yet -> Active / Present
            data.attendanceStatus = 'PRESENT';
        } else if (!data.attendanceStatus) {
            data.attendanceStatus = 'PRESENT';
        }
    }

    async getApplicableLeaveType(companyId, userId) {
        if (userId) {
            const userAllocs = await prisma.leaveAccumulation.findMany({
                where: { companyId, userId, status: true },
                include: { leaveType: true }
            });

            // Find an allocated leave type that is Sick/Casual (or not Comp-Off and not LOP)
            const slclAlloc = userAllocs.find(a => {
                const code = (a.leaveType?.leaveCode || '').toUpperCase();
                const name = (a.leaveType?.leaveName || '').toLowerCase();
                return code.includes('SL') || code.includes('CL') || name.includes('sick') || name.includes('casual');
            });
            if (slclAlloc) return slclAlloc.leaveTypeId;

            const standardAlloc = userAllocs.find(a => {
                const code = (a.leaveType?.leaveCode || '').toUpperCase();
                const name = (a.leaveType?.leaveName || '').toLowerCase();
                return !code.includes('COFF') && !name.includes('comp') && !code.includes('LOP') && !name.includes('loss');
            });
            if (standardAlloc) return standardAlloc.leaveTypeId;
        }

        const companyLeaveTypes = await prisma.leaveType.findMany({
            where: { companyId, status: true },
            orderBy: { leaveTypeId: 'asc' }
        });

        // Prefer SL/CL
        const slclType = companyLeaveTypes.find(lt => {
            const code = (lt.leaveCode || '').toUpperCase();
            const name = (lt.leaveName || '').toLowerCase();
            return code.includes('SL') || code.includes('CL') || name.includes('sick') || name.includes('casual');
        });
        if (slclType) return slclType.leaveTypeId;

        // Next, standard non-comp-off, non-LOP type
        const standardType = companyLeaveTypes.find(lt => {
            const code = (lt.leaveCode || '').toUpperCase();
            const name = (lt.leaveName || '').toLowerCase();
            return !code.includes('COFF') && !name.includes('comp') && !code.includes('LOP') && !name.includes('loss');
        });
        if (standardType) return standardType.leaveTypeId;

        return companyLeaveTypes[0]?.leaveTypeId || null;
    }

    isUserWeekOff(date, userId, weekOffAssigns = []) {
        const d = new Date(date);
        let activeWeekOffAssign = weekOffAssigns.find(w => {
            if (w.userId !== userId) return false;
            const start = w.startDate ? new Date(w.startDate) : null;
            const end = w.endDate ? new Date(w.endDate) : null;
            return (!start || d >= start) && (!end || d <= end);
        });

        if (!activeWeekOffAssign && weekOffAssigns.length > 0) {
            activeWeekOffAssign = weekOffAssigns.find(w => w.userId === userId) || weekOffAssigns[0];
        }

        if (activeWeekOffAssign && activeWeekOffAssign.weekOff && Array.isArray(activeWeekOffAssign.weekOff.rules) && activeWeekOffAssign.weekOff.rules.length > 0) {
            const dayOfWeekIndex = d.getUTCDay();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeekStr = days[dayOfWeekIndex];
            const occurrence = Math.ceil(d.getUTCDate() / 7);
            const occStr = ['First', 'Second', 'Third', 'Fourth', 'Fifth'][occurrence - 1];

            return activeWeekOffAssign.weekOff.rules.some(r =>
                r.dayOfWeek === dayOfWeekStr && (r.frequency === 'Every' || r.frequency === occStr)
            );
        }

        // Default: Saturday & Sunday as week-off
        const dayOfWeek = d.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
    }

    async cleanupDuplicates(companyId, userId) {
        try {
            const where = { companyId };
            if (userId) where.userId = Number(userId);

            const atts = await prisma.attendance.findMany({
                where,
                select: { attendanceId: true, companyId: true, userId: true, attendanceDate: true, checkInTime: true, checkOutTime: true },
                orderBy: { attendanceId: 'asc' }
            });

            const seen = new Map();
            const dupAttIds = [];
            for (const a of atts) {
                const dStr = a.attendanceDate ? a.attendanceDate.toISOString().split('T')[0] : '';
                const key = `${a.userId}_${dStr}`;
                if (seen.has(key)) {
                    const prev = seen.get(key);
                    // If current has punch but existing doesn't, delete existing and keep current
                    if ((a.checkInTime || a.checkOutTime) && !prev.checkInTime && !prev.checkOutTime) {
                        dupAttIds.push(prev.attendanceId);
                        seen.set(key, a);
                    } else {
                        dupAttIds.push(a.attendanceId);
                    }
                } else {
                    seen.set(key, a);
                }
            }

            if (dupAttIds.length > 0) {
                await prisma.attendance.deleteMany({
                    where: { attendanceId: { in: dupAttIds } }
                });
            }

            // Clean all legacy auto-generated absence leave records from leave_requests
            await prisma.leaveRequest.deleteMany({
                where: {
                    ...where,
                    reason: { startsWith: 'Auto-' }
                }
            });
        } catch (e) {
            console.warn("Auto-cleanup of duplicate attendances failed:", e.message);
        }
    }

    async syncAbsences(options = {}) {
        const { companyId, userId, fromDate, toDate } = options;
        if (!companyId) return;

        const lockKey = `${companyId}_${userId || 'all'}`;
        if (this.syncingCompanies.has(lockKey)) {
            return;
        }
        this.syncingCompanies.add(lockKey);

        try {
            await this.cleanupDuplicates(companyId, userId);

            const userWhere = { companyId, status: 'ACTIVE' };
            if (userId) userWhere.userId = Number(userId);
            const users = await prisma.user.findMany({
                where: userWhere,
                select: { userId: true, companyId: true, joiningDate: true }
            });
            if (!users || users.length === 0) return;

            const userIds = users.map(u => u.userId);

            const now = new Date();
            const todayUtcStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
            const yesterdayUtcEnd = new Date(todayUtcStart.getTime() - 1);

            // Default date range: check the last 60 days up to yesterday
            const defaultStart = new Date(todayUtcStart.getTime() - 60 * 24 * 60 * 60 * 1000);
            const rangeStart = fromDate ? new Date(fromDate) : defaultStart;
            const rangeEnd = toDate ? new Date(toDate) : yesterdayUtcEnd;

            if (rangeStart > yesterdayUtcEnd) return; // Future or today only

            const effectiveEnd = rangeEnd > yesterdayUtcEnd ? yesterdayUtcEnd : rangeEnd;

            // 1. Fetch holidays
            const holidays = await prisma.holiday.findMany({
                where: { companyId, status: true }
            });

            // 2. Fetch week off configurations
            const weekOffAssigns = await prisma.weekOffAssign.findMany({
                where: { companyId, status: true },
                include: { weekOff: { include: { rules: true } } }
            });

            // 3. Fetch existing attendances in range
            const attendances = await prisma.attendance.findMany({
                where: {
                    companyId,
                    userId: { in: userIds },
                    attendanceDate: { gte: rangeStart, lte: effectiveEnd }
                }
            });

            // 4. Fetch approved leave requests in range
            const approvedLeaves = await prisma.leaveRequest.findMany({
                where: {
                    companyId,
                    userId: { in: userIds },
                    status: 'APPROVED',
                    toDate: { gte: rangeStart },
                    fromDate: { lte: effectiveEnd }
                }
            });

            // 5. Fetch approved attendance regularization requests in range
            const approvedAttRequests = await prisma.attendanceRequest.findMany({
                where: {
                    companyId,
                    userId: { in: userIds },
                    status: 'APPROVED',
                    shiftDate: { gte: rangeStart, lte: effectiveEnd }
                }
            });

            for (const user of users) {
                const userJoinDate = user.joiningDate ? new Date(user.joiningDate) : null;
                const userEffectiveStart = userJoinDate && userJoinDate > rangeStart ? userJoinDate : rangeStart;
                const userStartUtc = new Date(Date.UTC(userEffectiveStart.getUTCFullYear(), userEffectiveStart.getUTCMonth(), userEffectiveStart.getUTCDate(), 0, 0, 0, 0));

                if (userStartUtc > effectiveEnd) continue;

                let applicableLeaveTypeId = null;

                for (let d = new Date(userStartUtc.getTime()); d <= effectiveEnd; d.setUTCDate(d.getUTCDate() + 1)) {
                    const curStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
                    const curEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

                    // Check Holiday
                    const isHoliday = holidays.some(h => {
                        if (h.holidayType === 'WEEK_OFF') return false;
                        const hStart = new Date(h.startDate);
                        const hEnd = new Date(h.endDate || h.startDate);
                        return curEnd >= hStart && curStart <= hEnd;
                    });
                    if (isHoliday) continue;

                    // Check Week-Off
                    const isWeekOff = this.isUserWeekOff(curStart, user.userId, weekOffAssigns);
                    if (isWeekOff) continue;

                    // Check Approved Planned Leave (excluding auto-generated records)
                    const isApprovedLeave = approvedLeaves.some(l => {
                        if (l.userId !== user.userId) return false;
                        if (l.reason && l.reason.startsWith('Auto-')) return false;
                        const lStart = new Date(l.fromDate);
                        const lEnd = new Date(l.toDate);
                        return curEnd >= lStart && curStart <= lEnd;
                    });
                    if (isApprovedLeave) continue;

                    // Check Approved Attendance Request
                    const isApprovedAttReq = approvedAttRequests.some(r => {
                        if (r.userId !== user.userId) return false;
                        const rDate = new Date(r.shiftDate);
                        return rDate >= curStart && rDate <= curEnd;
                    });
                    if (isApprovedAttReq) continue;

                    // Check Attendance
                    const userAtt = attendances.find(a => {
                        if (a.userId !== user.userId) return false;
                        const aDate = new Date(a.attendanceDate);
                        return aDate >= curStart && aDate <= curEnd;
                    });

                    // If half-day attendance, skip (half-day is recorded in attendance)
                    if (userAtt && userAtt.attendanceStatus === 'HALF_DAY') {
                        continue;
                    }

                    // If attended (punch exists or status is PRESENT) -> skip!
                    if (userAtt && (userAtt.checkInTime || userAtt.attendanceStatus === 'PRESENT')) {
                        // Ensure no lingering auto-leave deduction remains for this present day
                        const lingeringAuto = approvedLeaves.find(l => {
                            if (l.userId !== user.userId) return false;
                            if (!l.reason || !l.reason.startsWith('Auto-')) return false;
                            const lStart = new Date(l.fromDate);
                            const lEnd = new Date(l.toDate);
                            return curEnd >= lStart && curStart <= lEnd;
                        });
                        if (lingeringAuto) {
                            await prisma.leaveRequest.deleteMany({
                                where: {
                                    companyId,
                                    userId: user.userId,
                                    fromDate: curStart,
                                    reason: { startsWith: 'Auto-' }
                                }
                            });
                        }
                        continue;
                    }

                    // Otherwise, it is an UNAPPROVED ABSENCE on a working day!
                    if (!applicableLeaveTypeId) {
                        applicableLeaveTypeId = await this.getApplicableLeaveType(companyId, user.userId);
                    }

                    // Create attendance record if not exists (Attendance marks absence; it does not consume paid leave quota)
                    if (!userAtt) {
                        const dbAtt = await prisma.attendance.findFirst({
                            where: {
                                companyId,
                                userId: user.userId,
                                attendanceDate: curStart
                            }
                        });
                        if (!dbAtt) {
                            const createdAtt = await attendanceRepository.createAttendance({
                                companyId,
                                userId: user.userId,
                                attendanceDate: curStart,
                                attendanceStatus: 'ABSENT',
                                remarks: 'Absent - no check-in/check-out recorded'
                            });
                            attendances.push(createdAtt);
                        } else {
                            attendances.push(dbAtt);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Error synchronizing absences:", err);
        } finally {
            this.syncingCompanies.delete(lockKey);
        }
    }

    async reflectAttendanceInLeave(data) {
        // Attendance records should not create paid leave deductions.
        // If user is marked PRESENT, clean up any legacy auto-generated absence records for this date.
        if (data.attendanceStatus === 'PRESENT') {
            await prisma.leaveRequest.deleteMany({
                where: {
                    companyId: data.companyId,
                    userId: data.userId,
                    fromDate: data.attendanceDate,
                    reason: { startsWith: 'Auto-' }
                }
            });
        }
    }

    async createAttendance(data) {
        // Parse dates if they are strings
        const targetDate = attendanceRepository.normalizeDate(data.attendanceDate || data.checkInTime || new Date());
        data.attendanceDate = targetDate;
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        // Prevent check-in if user has an approved leave for this date
        const startOfDay = new Date(targetDate);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const approvedLeave = await prisma.leaveRequest.findFirst({
            where: {
                companyId: data.companyId,
                userId: data.userId,
                status: 'APPROVED',
                fromDate: { lte: endOfDay },
                toDate: { gte: startOfDay },
                numberOfDays: { gte: 1 },
                NOT: {
                    reason: { startsWith: 'Auto-' }
                }
            }
        });

        if (approvedLeave) {
            throw new Error("You are on approved leave today. Check-in is not allowed.");
        }

        this.calculateAttendanceStatus(data);

        const existing = await attendanceRepository.getAttendanceByUserAndDate(data.companyId, data.userId, data.attendanceDate);
        if (existing) {
            // If an ABSENT placeholder was created without punch, update it to check-in
            if (existing.attendanceStatus === 'ABSENT' && !existing.checkInTime) {
                const updatePayload = {
                    checkInTime: data.checkInTime || new Date(),
                    checkOutTime: data.checkOutTime ?? null,
                    checkInLatitude: data.checkInLatitude ?? null,
                    checkInLongitude: data.checkInLongitude ?? null,
                    checkOutLatitude: data.checkOutLatitude ?? null,
                    checkOutLongitude: data.checkOutLongitude ?? null,
                    workingMinutes: data.workingMinutes ?? null,
                    overtimeMinutes: data.overtimeMinutes ?? null,
                    earlyCheckoutMinutes: data.earlyCheckoutMinutes ?? null,
                    attendanceStatus: data.attendanceStatus || 'PRESENT',
                    remarks: data.remarks || null
                };
                const updated = await attendanceRepository.updateAttendance(existing.attendanceId, updatePayload);
                try {
                    await this.reflectAttendanceInLeave({ ...updated, attendanceStatus: updatePayload.attendanceStatus });
                } catch (err) {
                    console.error("Error reflecting attendance in leave:", err);
                }
                return updated;
            }
            throw new Error("Attendance record already exists for this user on this date");
        }

        const attendance = await attendanceRepository.createAttendance(data);

        try {
            await this.reflectAttendanceInLeave(data);
        } catch (err) {
            console.error("Error reflecting attendance in leave:", err);
        }

        return attendance;
    }

    async getAttendanceById(id) {
        const attendance = await attendanceRepository.getAttendanceById(id);
        if (!attendance) throw new Error("Attendance record not found");
        return attendance;
    }

    async getAllAttendances(query) {
        if (query.userId) {
            query.userId = Number(query.userId);
        }
        if (query.companyId) {
            query.companyId = Number(query.companyId);
            await this.syncAbsences({ companyId: query.companyId, userId: query.userId });
        }
        // Parse date for query if provided
        if (query.attendanceDate) {
            query.attendanceDate = attendanceRepository.normalizeDate(query.attendanceDate);
        }
        return await attendanceRepository.getAllAttendances(query);
    }

    async updateAttendance(id, data) {
        const attendance = await this.getAttendanceById(id);

        if (data.attendanceDate) data.attendanceDate = attendanceRepository.normalizeDate(data.attendanceDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        // Prevent check-out if user has an approved leave for this date
        const targetDate = data.attendanceDate || attendance.attendanceDate || (data.checkOutTime ? new Date(data.checkOutTime) : new Date());
        const startOfDay = attendanceRepository.normalizeDate(targetDate);
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const approvedLeave = await prisma.leaveRequest.findFirst({
            where: {
                companyId: attendance.companyId,
                userId: attendance.userId,
                status: 'APPROVED',
                fromDate: { lte: endOfDay },
                toDate: { gte: startOfDay },
                numberOfDays: { gte: 1 },
                NOT: {
                    reason: { startsWith: 'Auto-' }
                }
            }
        });

        if (approvedLeave) {
            throw new Error("You are on approved leave for this date. Check-out is not allowed.");
        }

        const mergedData = { ...attendance, ...data };
        this.calculateAttendanceStatus(mergedData);
        data.attendanceStatus = mergedData.attendanceStatus;
        data.workingMinutes = mergedData.workingMinutes;

        if (data.attendanceDate && data.attendanceDate.getTime() !== attendance.attendanceDate.getTime()) {
            const existing = await attendanceRepository.getAttendanceByUserAndDate(attendance.companyId, attendance.userId, data.attendanceDate);
            if (existing && existing.attendanceId !== id) throw new Error("Attendance record already exists for this user on this date");
        }

        const updated = await attendanceRepository.updateAttendance(id, data);

        try {
            await this.reflectAttendanceInLeave(mergedData);
        } catch (err) {
            console.error("Error reflecting attendance in leave:", err);
        }

        return updated;
    }

    async deleteAttendance(id) {
        await this.getAttendanceById(id);
        return await attendanceRepository.deleteAttendance(id);
    }
}
module.exports = new AttendanceService();
