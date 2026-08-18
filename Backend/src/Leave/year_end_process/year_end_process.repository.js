const prisma = require("../../config/prisma");

class YearEndProcessRepository {
    async create(data) {
        return await prisma.leaveYearEndProcess.create({
            data
        });
    }

    async getById(id, companyId) {
        const whereClause = { processId: id };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.leaveYearEndProcess.findFirst({
            where: whereClause
        });
    }

    async getAll(companyId, filters = {}) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        if (filters.userId) whereClause.userId = filters.userId;
        if (filters.year) whereClause.year = filters.year;

        return await prisma.leaveYearEndProcess.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeCode: true }
                },
                leaveType: {
                    select: { leaveName: true, leaveCode: true }
                }
            }
        });
    }

    async update(id, companyId, data) {
        const whereClause = { processId: id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.leaveYearEndProcess.findFirst({ where: whereClause });
        if (!exists) throw new Error("Year End Process not found or does not belong to this company");

        return await prisma.leaveYearEndProcess.update({
            where: { processId: id },
            data
        });
    }

    async delete(id, companyId) {
        const whereClause = { processId: id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.leaveYearEndProcess.findFirst({ where: whereClause });
        if (!exists) throw new Error("Year End Process not found or does not belong to this company");

        return await prisma.leaveYearEndProcess.delete({
            where: { processId: id }
        });
    }
}

module.exports = new YearEndProcessRepository();
