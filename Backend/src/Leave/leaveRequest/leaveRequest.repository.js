const prisma = require("../../config/prisma");

class LeaveRequestRepository {
    async createLeaveRequest(data) {
        const { isCompOff, ...createData } = data;
        const result = await prisma.leaveRequest.create({
            data: createData,
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

        return {
            ...result,
            isCompOff: Boolean(result.isCompOff ?? isCompOff ?? false)
        };
    }

    async getLeaveRequestById(leaveRequestId, companyId) {
        const whereClause = { leaveRequestId };
        if (companyId) whereClause.companyId = companyId;

        const request = await prisma.leaveRequest.findFirst({
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

        if (!request) return null;

        return {
            ...request,
            isCompOff: Boolean(
                request.isCompOff ?? 
                (request.leaveType?.leaveName?.toLowerCase().includes('comp') || request.leaveType?.leaveCode?.toLowerCase().includes('comp'))
            )
        };
    }

    async getAllLeaveRequests(companyId, userId, isCompOff) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        if (userId) whereClause.userId = userId;

        const requests = await prisma.leaveRequest.findMany({
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

        const mappedRequests = requests.map(r => ({
            ...r,
            isCompOff: Boolean(
                r.isCompOff ?? 
                (r.leaveType?.leaveName?.toLowerCase().includes('comp') || r.leaveType?.leaveCode?.toLowerCase().includes('comp'))
            )
        }));

        if (typeof isCompOff === 'boolean') {
            return mappedRequests.filter(r => r.isCompOff === isCompOff);
        }

        return mappedRequests;
    }

    async updateLeaveRequestStatus(leaveRequestId, companyId, data) {
        const whereClause = { leaveRequestId };
        if (companyId) whereClause.companyId = companyId;

        const existingRequest = await prisma.leaveRequest.findFirst({ where: whereClause });
        if (!existingRequest) throw new Error("Leave request not found or does not belong to this company");

        const updated = await prisma.leaveRequest.update({
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

        return {
            ...updated,
            isCompOff: Boolean(
                updated.isCompOff ?? 
                (updated.leaveType?.leaveName?.toLowerCase().includes('comp') || updated.leaveType?.leaveCode?.toLowerCase().includes('comp'))
            )
        };
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
