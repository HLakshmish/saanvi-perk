const prisma = require("../config/prisma");

class AttendanceRepository {
    async createAttendance(data) {
        return await prisma.attendance.create({ data });
    }
    async getAttendanceById(id) {
        return await prisma.attendance.findUnique({
            where: { attendanceId: id },
            include: { user: true }
        });
    }
    async getAttendanceByUserAndDate(companyId, userId, date) {
        return await prisma.attendance.findFirst({
            where: { companyId, userId, attendanceDate: new Date(date) }
        });
    }
    async getAllAttendances(query = {}) {
        return await prisma.attendance.findMany({ 
            where: query,
            include: {
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true
                    }
                }
            }
        });
    }
    async updateAttendance(id, data) {
        return await prisma.attendance.update({ where: { attendanceId: id }, data });
    }
    async deleteAttendance(id) {
        return await prisma.attendance.delete({ where: { attendanceId: id } });
    }
}
module.exports = new AttendanceRepository();
