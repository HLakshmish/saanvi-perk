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
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return await prisma.attendance.findFirst({
            where: {
                companyId,
                userId,
                attendanceDate: {
                    gte: start,
                    lte: end
                }
            }
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
