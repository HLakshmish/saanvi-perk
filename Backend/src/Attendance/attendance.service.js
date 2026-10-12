const attendanceRepository = require("./attendance.repository");
const prisma = require("../config/prisma");

class AttendanceService {
    calculateAttendanceStatus(data) {
        if (data.checkInTime && data.checkOutTime) {
            const inTime = new Date(data.checkInTime).getTime();
            const outTime = new Date(data.checkOutTime).getTime();
            if (!isNaN(inTime) && !isNaN(outTime)) {
                let diffMs = outTime - inTime;
                if (diffMs < 0) {
                    diffMs += 24 * 60 * 60 * 1000; // Night shift crossing midnight
                }
                data.workingMinutes = Math.floor(diffMs / 60000);
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

    async syncAbsences(options = {}) {
        const { companyId, userId, fromDate, toDate } = options;
        if (!companyId) return;

        try {
            const userWhere = { companyId, status: 'ACTIVE' };
            if (userId) userWhere.userId = Number(userId);
            const users = await prisma.user.findMany({
                where: userWhere,
                select: { userId: true, companyId: true, joiningDate: true }
            });
            if (!users || users.length === 0) return;

            const userIds = users.map(u => u.userId);

            const now = new Date();
            const todayUtcStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
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

                    // If half-day attendance, ensure 0.5 day leave deduction exists
                    if (userAtt && userAtt.attendanceStatus === 'HALF_DAY') {
                        const existingLeave = approvedLeaves.find(l => {
                            if (l.userId !== user.userId) return false;
                            const lStart = new Date(l.fromDate);
                            const lEnd = new Date(l.toDate);
                            return curEnd >= lStart && curStart <= lEnd;
                        });

                        if (!existingLeave) {
                            if (!applicableLeaveTypeId) {
                                applicableLeaveTypeId = await this.getApplicableLeaveType(companyId, user.userId);
                            }
                            if (applicableLeaveTypeId) {
                                const createdLeave = await prisma.leaveRequest.create({
                                    data: {
                                        companyId,
                                        userId: user.userId,
                                        leaveTypeId: applicableLeaveTypeId,
                                        fromDate: curStart,
                                        toDate: curStart,
                                        numberOfDays: 0.5,
                                        reason: 'Auto-generated due to HALF_DAY attendance',
                                        status: 'APPROVED'
                                    }
                                });
                                approvedLeaves.push(createdLeave);
                            }
                        } else if (existingLeave.reason && existingLeave.reason.startsWith('Auto-') && Number(existingLeave.numberOfDays) !== 0.5) {
                            await prisma.leaveRequest.update({
                                where: { leaveRequestId: existingLeave.leaveRequestId },
                                data: {
                                    numberOfDays: 0.5,
                                    reason: 'Auto-updated due to HALF_DAY attendance'
                                }
                            });
                            existingLeave.numberOfDays = 0.5;
                        }
                        continue;
                    }

                    // If attended (punch exists or status is PRESENT) -> skip!
                    if (userAtt && (userAtt.checkInTime || userAtt.attendanceStatus === 'PRESENT')) {
                        continue;
                    }

                    // Otherwise, it is an UNAPPROVED ABSENCE on a working day!
                    if (!applicableLeaveTypeId) {
                        applicableLeaveTypeId = await this.getApplicableLeaveType(companyId, user.userId);
                    }

                    // Create attendance record if not exists
                    if (!userAtt) {
                        const createdAtt = await attendanceRepository.createAttendance({
                            companyId,
                            userId: user.userId,
                            attendanceDate: curStart,
                            attendanceStatus: 'ABSENT',
                            remarks: 'Absent - no check-in/check-out recorded'
                        });
                        attendances.push(createdAtt);
                    }

                    // Check if absent leave deduction already exists (Idempotent!)
                    const existingDeduction = approvedLeaves.find(l => {
                        if (l.userId !== user.userId) return false;
                        const lStart = new Date(l.fromDate);
                        const lEnd = new Date(l.toDate);
                        return curEnd >= lStart && curStart <= lEnd;
                    });

                    if (!existingDeduction && applicableLeaveTypeId) {
                        const createdLeave = await prisma.leaveRequest.create({
                            data: {
                                companyId,
                                userId: user.userId,
                                leaveTypeId: applicableLeaveTypeId,
                                fromDate: curStart,
                                toDate: curStart,
                                numberOfDays: 1,
                                reason: 'Auto-generated due to ABSENT attendance',
                                status: 'APPROVED'
                            }
                        });
                        approvedLeaves.push(createdLeave);
                    }
                }
            }
        } catch (err) {
            console.error("Error synchronizing absences:", err);
        }
    }

    async reflectAttendanceInLeave(data) {
        if (data.attendanceStatus === 'ABSENT' || data.attendanceStatus === 'HALF_DAY') {
            const leaveTypeId = await this.getApplicableLeaveType(data.companyId, data.userId);

            if (leaveTypeId) {
                const numberOfDays = data.attendanceStatus === 'ABSENT' ? 1 : 0.5;
                const existingLeave = await prisma.leaveRequest.findFirst({
                    where: {
                        companyId: data.companyId,
                        userId: data.userId,
                        fromDate: data.attendanceDate
                    }
                });

                if (!existingLeave) {
                    await prisma.leaveRequest.create({
                        data: {
                            companyId: data.companyId,
                            userId: data.userId,
                            leaveTypeId: leaveTypeId,
                            fromDate: data.attendanceDate,
                            toDate: data.attendanceDate,
                            numberOfDays: numberOfDays,
                            reason: `Auto-generated due to ${data.attendanceStatus} attendance`,
                            status: 'APPROVED'
                        }
                    });
                } else if (existingLeave.numberOfDays !== numberOfDays || (existingLeave.reason && existingLeave.reason.startsWith('Auto-'))) {
                    await prisma.leaveRequest.update({
                        where: { leaveRequestId: existingLeave.leaveRequestId },
                        data: {
                            numberOfDays: numberOfDays,
                            reason: `Auto-updated due to ${data.attendanceStatus} attendance`
                        }
                    });
                }
            }
        } else if (data.attendanceStatus === 'PRESENT') {
            const existingLeave = await prisma.leaveRequest.findFirst({
                where: {
                    companyId: data.companyId,
                    userId: data.userId,
                    fromDate: data.attendanceDate,
                    reason: { startsWith: 'Auto-' }
                }
            });
            if (existingLeave) {
                await prisma.leaveRequest.delete({
                    where: { leaveRequestId: existingLeave.leaveRequestId }
                });
            }
        }
    }

    async createAttendance(data) {
        // Parse dates if they are strings
        if (data.attendanceDate) data.attendanceDate = new Date(data.attendanceDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        // Prevent check-in if user has an approved leave for this date
        const targetDate = data.attendanceDate || (data.checkInTime ? new Date(data.checkInTime) : new Date());
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

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
        if (existing) throw new Error("Attendance record already exists for this user on this date");

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
        if (query.companyId) {
            await this.syncAbsences({ companyId: query.companyId, userId: query.userId });
        }
        // Parse date for query if provided
        if (query.attendanceDate) query.attendanceDate = new Date(query.attendanceDate);
        return await attendanceRepository.getAllAttendances(query);
    }

    async updateAttendance(id, data) {
        const attendance = await this.getAttendanceById(id);

        if (data.attendanceDate) data.attendanceDate = new Date(data.attendanceDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        // Prevent check-out if user has an approved leave for this date
        const targetDate = data.attendanceDate || attendance.attendanceDate || (data.checkOutTime ? new Date(data.checkOutTime) : new Date());
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

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
