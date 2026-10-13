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
    normalizeDate(date) {
        if (!date) return new Date();
        if (typeof date === 'string') {
            const parts = date.split('T')[0].split('-');
            if (parts.length === 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const d = parseInt(parts[2], 10);
                return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
            }
        }
        const d = new Date(date);
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    }

    async getAttendanceByUserAndDate(companyId, userId, date) {
        const targetDate = this.normalizeDate(date);
        return await prisma.attendance.findFirst({
            where: {
                companyId,
                userId,
                attendanceDate: targetDate
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
                        employeeCode: true,
                        officialEmail: true,
                        department: { select: { departmentId: true, departmentName: true } },
                        designation: { select: { designationId: true, designationName: true } },
                        personalInformation: { select: { gender: true } }
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
