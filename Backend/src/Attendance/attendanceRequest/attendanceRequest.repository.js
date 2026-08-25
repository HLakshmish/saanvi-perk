const prisma = require("../../config/prisma");

class AttendanceRequestRepository {
    async createRequest(data) {
        return await prisma.attendanceRequest.create({ data });
    }

    async getRequestById(requestId) {
        return await prisma.attendanceRequest.findUnique({
            where: { requestId },
            include: { 
                user: { select: { firstName: true, lastName: true, employeeCode: true } },
                approvedUser: { select: { firstName: true, lastName: true } }
            }
        });
    }

    async getAllRequests(query) {
        return await prisma.attendanceRequest.findMany({
            where: query,
            include: {
                user: { select: { firstName: true, lastName: true, employeeCode: true } },
                approvedUser: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateRequest(requestId, data) {
        return await prisma.attendanceRequest.update({
            where: { requestId },
            data,
            include: {
                user: { select: { firstName: true, lastName: true, employeeCode: true } },
                approvedUser: { select: { firstName: true, lastName: true } }
            }
        });
    }

    async deleteRequest(requestId) {
        return await prisma.attendanceRequest.delete({
            where: { requestId }
        });
    }
}

module.exports = new AttendanceRequestRepository();
