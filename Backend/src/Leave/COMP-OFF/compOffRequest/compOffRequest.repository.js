const prisma = require("../../../config/prisma");

class CompOffRequestRepository {
    async create(data) {
        return await prisma.compOffRequest.create({
            data,
            include: {
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                        reportingToId: true,
                        manager: {
                            select: { userId: true, firstName: true, lastName: true }
                        }
                    }
                },
                approvedUser: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            }
        });
    }

    async getById(id, companyId) {
        const whereClause = { id: Number(id) };
        if (companyId) whereClause.companyId = Number(companyId);

        return await prisma.compOffRequest.findFirst({
            where: whereClause,
            include: {
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                        reportingToId: true,
                        manager: {
                            select: { userId: true, firstName: true, lastName: true }
                        }
                    }
                },
                approvedUser: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            }
        });
    }

    async findByUserAndDate(companyId, userId, workDate) {
        return await prisma.compOffRequest.findFirst({
            where: {
                companyId: Number(companyId),
                userId: Number(userId),
                workDate: new Date(workDate)
            }
        });
    }

    async getAll(companyId, query = {}) {
        const whereClause = {};
        if (companyId) whereClause.companyId = Number(companyId);
        if (query.userId) whereClause.userId = Number(query.userId);
        if (query.reportingToId) whereClause.reportingToId = Number(query.reportingToId);
        if (query.status) whereClause.status = query.status;
        if (query.requestType) whereClause.requestType = query.requestType;

        if (query.fromDate || query.toDate) {
            whereClause.workDate = {};
            if (query.fromDate) whereClause.workDate.gte = new Date(query.fromDate);
            if (query.toDate) whereClause.workDate.lte = new Date(query.toDate);
        }

        return await prisma.compOffRequest.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                        reportingToId: true,
                        manager: {
                            select: { userId: true, firstName: true, lastName: true }
                        }
                    }
                },
                approvedUser: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            },
            orderBy: { workDate: 'desc' }
        });
    }

    async update(id, companyId, data) {
        const whereClause = { id: Number(id) };
        if (companyId) whereClause.companyId = Number(companyId);

        const exists = await prisma.compOffRequest.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp-Off Request not found or does not belong to this company");

        return await prisma.compOffRequest.update({
            where: { id: Number(id) },
            data,
            include: {
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                        reportingToId: true,
                        manager: {
                            select: { userId: true, firstName: true, lastName: true }
                        }
                    }
                },
                approvedUser: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            }
        });
    }

    async delete(id, companyId) {
        const whereClause = { id: Number(id) };
        if (companyId) whereClause.companyId = Number(companyId);

        const exists = await prisma.compOffRequest.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp-Off Request not found or does not belong to this company");

        return await prisma.compOffRequest.delete({
            where: { id: Number(id) }
        });
    }
}

module.exports = new CompOffRequestRepository();
