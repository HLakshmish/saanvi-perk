const attendanceRepository = require("./attendance.repository");
const prisma = require("../config/prisma");

class AttendanceService {
    calculateAttendanceStatus(data) {
        if (data.checkInTime && data.checkOutTime) {
            const diffMs = data.checkOutTime.getTime() - data.checkInTime.getTime();
            data.workingMinutes = Math.floor(diffMs / 60000);
        }

        if (data.workingMinutes !== undefined) {
            const workingHours = data.workingMinutes / 60;
            if (workingHours >= 8) {
                data.attendanceStatus = 'PRESENT';
            } else if (workingHours > 4 && workingHours < 8) {
                data.attendanceStatus = 'HALF_DAY';
            } else {
                data.attendanceStatus = 'ABSENT';
            }
        }
    }

    async reflectAttendanceInLeave(data) {
        if (data.attendanceStatus === 'ABSENT' || data.attendanceStatus === 'HALF_DAY') {
            const leaveType = await prisma.leaveType.findFirst({
                where: { companyId: data.companyId },
                orderBy: { leaveTypeId: 'asc' }
            });

            if (leaveType) {
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
                            leaveTypeId: leaveType.leaveTypeId,
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
        // Parse date for query if provided
        if (query.attendanceDate) query.attendanceDate = new Date(query.attendanceDate);
        return await attendanceRepository.getAllAttendances(query);
    }
    async updateAttendance(id, data) {
        const attendance = await this.getAttendanceById(id);

        if (data.attendanceDate) data.attendanceDate = new Date(data.attendanceDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

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
