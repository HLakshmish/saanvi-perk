const prisma = require("../config/prisma");

class UserRepository {
    async createUser(data) {
        return await prisma.user.create({ 
            data,
            include: {
                role: { select: { roleName: true } },
                department: { select: { departmentName: true } }
            }
        });
    }

    async getUserById(userId, companyId) {
        const whereClause = { userId };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.user.findFirst({
            where: whereClause,
            include: {
                role: { select: { roleName: true } },
                department: { select: { departmentName: true } },
                manager: { select: { firstName: true, lastName: true, officialEmail: true } }
            }
        });
    }

    async getAllUsers(companyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;

        return await prisma.user.findMany({
            where: whereClause,
            include: {
                role: { select: { roleName: true } },
                department: { select: { departmentName: true } }
            }
        });
    }

    async updateUser(userId, companyId, data) {
        const whereClause = { userId };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.user.findFirst({ where: whereClause });
        if (!exists) throw new Error("User not found or does not belong to this company");

        return await prisma.user.update({
            where: { userId },
            data,
            include: {
                role: { select: { roleName: true } },
                department: { select: { departmentName: true } }
            }
        });
    }

    async deleteUser(userId, companyId) {
        const whereClause = { userId };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.user.findFirst({ where: whereClause });
        if (!exists) throw new Error("User not found or does not belong to this company");

        return await prisma.user.delete({
            where: { userId }
        });
    }
}

module.exports = new UserRepository();
