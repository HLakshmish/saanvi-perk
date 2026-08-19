const prisma = require("../../../config/prisma");

class CompOffAssignRepository {
    async createMany(data) {
        return await prisma.compOffAssign.createMany({
            data
        });
    }

    async getById(id, companyId) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.compOffAssign.findFirst({
            where: whereClause,
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeCode: true }
                },
                policy: {
                    select: { policyName: true }
                }
            }
        });
    }

    async getAll(companyId, userId, policyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        if (userId) whereClause.userId = userId;
        if (policyId) whereClause.policyId = policyId;

        return await prisma.compOffAssign.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeCode: true }
                },
                policy: {
                    select: { policyName: true }
                }
            }
        });
    }

    async update(id, companyId, data) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.compOffAssign.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp Off Assignment not found or does not belong to this company");

        return await prisma.compOffAssign.update({
            where: { id },
            data,
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeCode: true }
                },
                policy: {
                    select: { policyName: true }
                }
            }
        });
    }

    async delete(id, companyId) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.compOffAssign.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp Off Assignment not found or does not belong to this company");

        return await prisma.compOffAssign.delete({
            where: { id }
        });
    }
}

module.exports = new CompOffAssignRepository();
