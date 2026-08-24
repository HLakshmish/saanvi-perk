const prisma = require("../../config/prisma");

class WeekOffRepository {
    async createWeekOff(data) {
        return await prisma.weekOff.create({
            data: {
                companyId: data.companyId,
                code: data.code,
                name: data.name,
                createdBy: data.createdBy,
                rules: {
                    create: data.rules
                }
            },
            include: { rules: true }
        });
    }

    async getWeekOffById(weekOffId, companyId) {
        return await prisma.weekOff.findFirst({
            where: { weekOffId, companyId },
            include: { rules: true }
        });
    }

    async getAllWeekOffs(companyId) {
        return await prisma.weekOff.findMany({
            where: { companyId },
            include: { rules: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateWeekOff(weekOffId, companyId, data) {
        // delete existing rules and recreate
        await prisma.weekOffRule.deleteMany({ where: { weekOffId } });
        
        return await prisma.weekOff.update({
            where: { weekOffId },
            data: {
                code: data.code,
                name: data.name,
                updatedBy: data.updatedBy,
                rules: {
                    create: data.rules
                }
            },
            include: { rules: true }
        });
    }

    async deleteWeekOff(weekOffId, companyId) {
        return await prisma.weekOff.delete({
            where: { weekOffId }
        });
    }

    async assignWeekOff(data) {
        const assigns = data.userIds.map(userId => ({
            companyId: data.companyId,
            userId: userId,
            weekOffId: data.weekOffId,
            startDate: data.startDate,
            endDate: data.endDate,
            createdBy: data.createdBy
        }));

        await prisma.weekOffAssign.createMany({
            data: assigns
        });

        return await prisma.weekOffAssign.findMany({
            where: {
                companyId: data.companyId,
                weekOffId: data.weekOffId,
                userId: { in: data.userIds },
                startDate: data.startDate
            }
        });
    }

    async getAssignedWeekOffs(companyId, userId) {
        const where = { companyId };
        if (userId) where.userId = userId;
        return await prisma.weekOffAssign.findMany({
            where,
            include: { user: { select: { firstName: true, lastName: true, employeeCode: true } }, weekOff: { include: { rules: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
}

module.exports = new WeekOffRepository();
