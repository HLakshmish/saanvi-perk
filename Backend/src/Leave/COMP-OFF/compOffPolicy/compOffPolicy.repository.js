const prisma = require("../../../config/prisma");

class CompOffPolicyRepository {
    async create(data) {
        return await prisma.compOffPolicy.create({
            data
        });
    }

    async getById(id, companyId) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.compOffPolicy.findFirst({
            where: whereClause,
            include: {
                leaveType: {
                    select: { leaveName: true, leaveCode: true }
                }
            }
        });
    }

    async getAll(companyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;

        return await prisma.compOffPolicy.findMany({
            where: whereClause,
            include: {
                leaveType: {
                    select: { leaveName: true, leaveCode: true }
                }
            }
        });
    }

    async update(id, companyId, data) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.compOffPolicy.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp Off Policy not found or does not belong to this company");

        return await prisma.compOffPolicy.update({
            where: { id },
            data
        });
    }

    async delete(id, companyId) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.compOffPolicy.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp Off Policy not found or does not belong to this company");

        return await prisma.compOffPolicy.delete({
            where: { id }
        });
    }
}

module.exports = new CompOffPolicyRepository();
