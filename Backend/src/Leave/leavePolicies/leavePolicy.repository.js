const prisma = require("../../config/prisma");

class LeavePolicyRepository {
    async create(data) {
        return await prisma.leavePolicy.create({ data });
    }

    async getById(leavePolicyId, companyId) {
        const whereClause = { leavePolicyId };
        if (companyId) whereClause.companyId = companyId;
        
        return await prisma.leavePolicy.findFirst({ 
            where: whereClause,
            include: {
                leavePolicyRules: true,
                leavePolicyAccumulations: true
            }
        });
    }

    async getAll(companyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        
        return await prisma.leavePolicy.findMany({ 
            where: whereClause,
            include: {
                leavePolicyRules: true,
                leavePolicyAccumulations: true
            }
        });
    }

    async update(leavePolicyId, companyId, data) {
        const whereClause = { leavePolicyId };
        if (companyId) whereClause.companyId = companyId;
        
        const exists = await prisma.leavePolicy.findFirst({ where: whereClause });
        if (!exists) throw new Error("LeavePolicy not found or does not belong to this company");

        return await prisma.leavePolicy.update({
            where: { leavePolicyId },
            data
        });
    }

    async delete(leavePolicyId, companyId) {
        const whereClause = { leavePolicyId };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.leavePolicy.findFirst({ where: whereClause });
        if (!exists) throw new Error("LeavePolicy not found or does not belong to this company");

        return await prisma.leavePolicy.delete({
            where: { leavePolicyId }
        });
    }
}

module.exports = new LeavePolicyRepository();
