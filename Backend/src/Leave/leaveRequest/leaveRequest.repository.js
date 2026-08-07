const prisma = require("../../config/prisma");

class LeaveRequestRepository {
    async createLeaveRequest(data) {
        return await prisma.leaveRequest.create({
            data,
            include: {
                leaveType: true,
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async getLeaveRequestById(leaveRequestId, companyId) {
        const whereClause = { leaveRequestId };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.leaveRequest.findFirst({
            where: whereClause,
            include: {
                leaveType: true,
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true
                    }
                },
                approvedUser: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async getAllLeaveRequests(companyId, userId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        if (userId) whereClause.userId = userId;

        return await prisma.leaveRequest.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                leaveType: true,
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async updateLeaveRequestStatus(leaveRequestId, companyId, data) {
        const whereClause = { leaveRequestId };
        if (companyId) whereClause.companyId = companyId;

        const existingRequest = await prisma.leaveRequest.findFirst({ where: whereClause });
        if (!existingRequest) throw new Error("Leave request not found or does not belong to this company");

        return await prisma.leaveRequest.update({
            where: { leaveRequestId },
            data,
            include: {
                leaveType: true,
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async deleteLeaveRequest(leaveRequestId, companyId) {
        const whereClause = { leaveRequestId };
        if (companyId) whereClause.companyId = companyId;

        const existingRequest = await prisma.leaveRequest.findFirst({ where: whereClause });
        if (!existingRequest) throw new Error("Leave request not found or does not belong to this company");

        return await prisma.leaveRequest.delete({
            where: { leaveRequestId }
        });
    }
}

module.exports = new LeaveRequestRepository();
