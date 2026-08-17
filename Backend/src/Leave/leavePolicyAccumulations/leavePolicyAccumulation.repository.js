const prisma = require("../../config/prisma");

class LeavePolicyAccumulationRepository {
    async create(data, companyId) {
        if (companyId) {
            const policy = await prisma.leavePolicy.findFirst({
                where: { leavePolicyId: data.leavePolicyId, companyId }
            });
            if (!policy) throw new Error("Leave Policy not found or belongs to another company");
        }
        return await prisma.leavePolicyAccumulation.create({ data });
    }

    async getById(leavePolicyAccumulationId, companyId) {
        const whereClause = { leavePolicyAccumulationId };
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }
        return await prisma.leavePolicyAccumulation.findFirst({ where: whereClause });
    }

    async getAll(companyId) {
        const whereClause = {};
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }
        return await prisma.leavePolicyAccumulation.findMany({ where: whereClause });
    }

    async update(leavePolicyAccumulationId, companyId, data) {
        const whereClause = { leavePolicyAccumulationId };
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }
        
        const exists = await prisma.leavePolicyAccumulation.findFirst({ where: whereClause });
        if (!exists) throw new Error("LeavePolicyAccumulation not found or does not belong to this company");

        return await prisma.leavePolicyAccumulation.update({
            where: { leavePolicyAccumulationId },
            data
        });
    }

    async delete(leavePolicyAccumulationId, companyId) {
        const whereClause = { leavePolicyAccumulationId };
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }

        const exists = await prisma.leavePolicyAccumulation.findFirst({ where: whereClause });
        if (!exists) throw new Error("LeavePolicyAccumulation not found or does not belong to this company");

        return await prisma.leavePolicyAccumulation.delete({
            where: { leavePolicyAccumulationId }
        });
    }
}

module.exports = new LeavePolicyAccumulationRepository();
