const prisma = require("../../config/prisma");

class LeaveAccumulationRepository {
    async create(data) {
        return await prisma.leaveAccumulation.create({
            data
        });
    }

    async getById(id, companyId) {
        const whereClause = { leaveAccumulationId: id };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.leaveAccumulation.findFirst({
            where: whereClause
        });
    }

    async getAll(companyId, filters = {}) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        if (filters.userId) whereClause.userId = filters.userId;
        if (filters.leaveTypeId) whereClause.leaveTypeId = filters.leaveTypeId;

        return await prisma.leaveAccumulation.findMany({
            where: whereClause
        });
    }

    async update(id, companyId, data) {
        const whereClause = { leaveAccumulationId: id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.leaveAccumulation.findFirst({ where: whereClause });
        if (!exists) throw new Error("Leave Accumulation not found or does not belong to this company");

        return await prisma.leaveAccumulation.update({
            where: { leaveAccumulationId: id },
            data
        });
    }

    async delete(id, companyId) {
        const whereClause = { leaveAccumulationId: id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.leaveAccumulation.findFirst({ where: whereClause });
        if (!exists) throw new Error("Leave Accumulation not found or does not belong to this company");

        return await prisma.leaveAccumulation.delete({
            where: { leaveAccumulationId: id }
        });
    }
}

module.exports = new LeaveAccumulationRepository();
