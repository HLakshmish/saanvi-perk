const attendanceRepository = require("./attendance.repository");
const prisma = require("../config/prisma");

class AttendanceService {
    async checkWeekOffAndApplyCompOff(data) {
        if (data.attendanceStatus !== 'PRESENT') return;

        const date = new Date(data.attendanceDate);

        let isWeekOff = false;
        let isHoliday = false;
        let dayOfWeekStr = "";
        let holidayName = "";

        // 1. Check if it's a holiday
        const holiday = await prisma.holiday.findFirst({
            where: {
                companyId: data.companyId,
                startDate: { lte: date },
                endDate: { gte: date },
                status: true
            }
        });

        if (holiday) {
            isHoliday = true;
            holidayName = holiday.holidayName;
        }

        // 2. Check if it's a week-off
        const weekOffAssign = await prisma.weekOffAssign.findFirst({
            where: {
                userId: data.userId,
                companyId: data.companyId,
                startDate: { lte: date },
                OR: [
                    { endDate: null },
                    { endDate: { gte: date } }
                ],
                status: true
            },
            include: { weekOff: { include: { rules: true } } }
        });

        if (weekOffAssign) {
            const dayOfWeekIndex = date.getDay(); // 0 (Sun) - 6 (Sat)
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            dayOfWeekStr = days[dayOfWeekIndex];

            const occurrence = Math.ceil(date.getDate() / 7);
            const occurrenceStrings = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
            const occStr = occurrenceStrings[occurrence - 1];

            const matchingRule = weekOffAssign.weekOff.rules.find(r => 
                r.dayOfWeek === dayOfWeekStr && 
                (r.frequency === 'Every' || r.frequency === occStr)
            );

            if (matchingRule) {
                isWeekOff = true;
            }
        }

        if (!isWeekOff && !isHoliday) return;

        // 3. Employee worked on a Week-Off or Holiday. Check for Comp-Off policy
        const compOffAssign = await prisma.compOffAssign.findFirst({
            where: {
                userId: data.userId,
                companyId: data.companyId,
                startDate: { lte: date },
                OR: [
                    { endDate: null },
                    { endDate: { gte: date } }
                ],
                status: true,
                policy: { 
                    OR: [
                        { weekOffWorked: isWeekOff },
                        { holidayWorked: isHoliday }
                    ],
                    status: true 
                }
            },
            include: { policy: true }
        });

        if (!compOffAssign) return;

        // Ensure policy covers the specific event
        if (isWeekOff && !compOffAssign.policy.weekOffWorked && !isHoliday) return;
        if (isHoliday && !compOffAssign.policy.holidayWorked && !isWeekOff) return;

        // 4. Apply Comp-Off
        const policy = compOffAssign.policy;
        let earnedLeaves = 1;
        let expiryDate = null;
        if (policy.availabilityDays && policy.availabilityDays > 0) {
            expiryDate = new Date(date.getTime() + policy.availabilityDays * 24 * 60 * 60 * 1000);
        }

        let noteStr = isHoliday ? `Comp-off for working on Holiday (${holidayName})` : `Comp-off for working on Week-Off (${dayOfWeekStr})`;

        await prisma.leaveAccumulation.create({
            data: {
                companyId: data.companyId,
                userId: data.userId,
                leaveTypeId: policy.leaveTypeId,
                accumulationDate: date,
                numberOfLeaves: earnedLeaves,
                accumulationPeriodFrom: date,
                accumulationPeriodTo: date,
                availabilityPeriodFrom: date,
                availabilityPeriodTo: expiryDate || new Date("2099-12-31"),
                note: noteStr,
                status: true
            }
        });
    }
    async createAttendance(data) {
        // Parse dates if they are strings
        if (data.attendanceDate) data.attendanceDate = new Date(data.attendanceDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        const existing = await attendanceRepository.getAttendanceByUserAndDate(data.companyId, data.userId, data.attendanceDate);
        if (existing) throw new Error("Attendance record already exists for this user on this date");
        
        const attendance = await attendanceRepository.createAttendance(data);
        
        try {
            await this.checkWeekOffAndApplyCompOff(data);
        } catch (err) {
            console.error("Error applying comp-off:", err);
        }

        return attendance;
    }
    async getAttendanceById(id) {
        const attendance = await attendanceRepository.getAttendanceById(id);
        if (!attendance) throw new Error("Attendance record not found");
        return attendance;
    }
    async getAllAttendances(query) {
        // Parse date for query if provided
        if (query.attendanceDate) query.attendanceDate = new Date(query.attendanceDate);
        return await attendanceRepository.getAllAttendances(query);
    }
    async updateAttendance(id, data) {
        const attendance = await this.getAttendanceById(id);
        
        if (data.attendanceDate) data.attendanceDate = new Date(data.attendanceDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        if (data.attendanceDate && data.attendanceDate.getTime() !== attendance.attendanceDate.getTime()) {
            const existing = await attendanceRepository.getAttendanceByUserAndDate(attendance.companyId, attendance.userId, data.attendanceDate);
            if (existing && existing.attendanceId !== id) throw new Error("Attendance record already exists for this user on this date");
        }
        
        const updated = await attendanceRepository.updateAttendance(id, data);
        
        try {
            await this.checkWeekOffAndApplyCompOff({ ...attendance, ...data });
        } catch (err) {
            console.error("Error applying comp-off:", err);
        }
        
        return updated;
    }
    async deleteAttendance(id) {
        await this.getAttendanceById(id);
        return await attendanceRepository.deleteAttendance(id);
    }
}
module.exports = new AttendanceService();
