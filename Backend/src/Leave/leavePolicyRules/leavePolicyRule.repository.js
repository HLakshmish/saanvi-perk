const prisma = require("../../config/prisma");

class LeavePolicyRuleRepository {
    async create(data, companyId) {
        if (companyId) {
            const policy = await prisma.leavePolicy.findFirst({
                where: { leavePolicyId: data.leavePolicyId, companyId }
            });
            if (!policy) throw new Error("Leave Policy not found or belongs to another company");
        }
        return await prisma.leavePolicyRule.create({ data });
    }

    async getById(leavePolicyRuleId, companyId) {
        const whereClause = { leavePolicyRuleId };
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }
        return await prisma.leavePolicyRule.findFirst({ where: whereClause });
    }

    async getAll(companyId) {
        const whereClause = {};
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }
        return await prisma.leavePolicyRule.findMany({ where: whereClause });
    }

    async update(leavePolicyRuleId, companyId, data) {
        const whereClause = { leavePolicyRuleId };
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }
        
        const exists = await prisma.leavePolicyRule.findFirst({ where: whereClause });
        if (!exists) throw new Error("LeavePolicyRule not found or does not belong to this company");

        return await prisma.leavePolicyRule.update({
            where: { leavePolicyRuleId },
            data
        });
    }

    async delete(leavePolicyRuleId, companyId) {
        const whereClause = { leavePolicyRuleId };
        if (companyId) {
            whereClause.leavePolicy = { companyId };
        }

        const exists = await prisma.leavePolicyRule.findFirst({ where: whereClause });
        if (!exists) throw new Error("LeavePolicyRule not found or does not belong to this company");

        return await prisma.leavePolicyRule.delete({
            where: { leavePolicyRuleId }
        });
    }
}

module.exports = new LeavePolicyRuleRepository();
