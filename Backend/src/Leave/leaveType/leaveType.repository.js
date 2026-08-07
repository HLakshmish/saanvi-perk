const prisma = require("../../config/prisma");

class LeaveTypeRepository {
    async createLeaveType(data) {
        return await prisma.leaveType.create({
            data
        });
    }

    async getLeaveTypeById(leaveTypeId, companyId) {
        const whereClause = { leaveTypeId };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.leaveType.findFirst({
            where: whereClause
        });
    }

    async getAllLeaveTypes(companyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;

        return await prisma.leaveType.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async updateLeaveType(leaveTypeId, companyId, data) {
        const whereClause = { leaveTypeId };
        if (companyId) whereClause.companyId = companyId;

        const existingLeaveType = await prisma.leaveType.findFirst({ where: whereClause });
        if (!existingLeaveType) throw new Error("Leave type not found or does not belong to this company");

        return await prisma.leaveType.update({
            where: { leaveTypeId },
            data
        });
    }

    async deleteLeaveType(leaveTypeId, companyId) {
        const whereClause = { leaveTypeId };
        if (companyId) whereClause.companyId = companyId;

        const existingLeaveType = await prisma.leaveType.findFirst({ where: whereClause });
        if (!existingLeaveType) throw new Error("Leave type not found or does not belong to this company");

        return await prisma.leaveType.delete({
            where: { leaveTypeId }
        });
    }
}

module.exports = new LeaveTypeRepository();
