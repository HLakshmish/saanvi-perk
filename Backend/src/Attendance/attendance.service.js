const attendanceRepository = require("./attendance.repository");

class AttendanceService {
    async createAttendance(data) {
        // Parse dates if they are strings
        if (data.attendanceDate) data.attendanceDate = new Date(data.attendanceDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        const existing = await attendanceRepository.getAttendanceByUserAndDate(data.companyId, data.userId, data.attendanceDate);
        if (existing) throw new Error("Attendance record already exists for this user on this date");
        return await attendanceRepository.createAttendance(data);
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
        return await attendanceRepository.updateAttendance(id, data);
    }
    async deleteAttendance(id) {
        await this.getAttendanceById(id);
        return await attendanceRepository.deleteAttendance(id);
    }
}
module.exports = new AttendanceService();
