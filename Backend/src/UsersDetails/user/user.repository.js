const prisma = require("../../config/prisma");

class UserRepository {
    async createUser(data) {
        const { roleIds, ...userData } = data;
        const createData = { ...userData };
        if (roleIds && roleIds.length > 0) {
            createData.userRoles = {
                create: roleIds.map(id => ({ roleId: id }))
            };
        }

        return await prisma.user.create({ 
            data: createData,
            include: {
                userRoles: { select: { role: { select: { roleId: true, roleName: true, roleCode: true } } } },
                department: { select: { departmentName: true } },
                designation: { select: { designationName: true } }
            }
        });
    }

    async getUserById(userId, companyId) {
        const whereClause = { userId };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.user.findFirst({
            where: whereClause,
            include: {
                userRoles: { select: { role: { select: { roleId: true, roleName: true, roleCode: true } } } },
                department: { select: { departmentName: true } },
                designation: { select: { designationName: true } },
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
                userRoles: { select: { role: { select: { roleId: true, roleName: true, roleCode: true } } } },
                department: { select: { departmentName: true } },
                designation: { select: { designationName: true } }
            }
        });
    }

    async updateUser(userId, companyId, data) {
        const whereClause = { userId };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.user.findFirst({ where: whereClause });
        if (!exists) throw new Error("User not found or does not belong to this company");

        const { roleIds, ...updateData } = data;
        
        if (roleIds) {
            updateData.userRoles = {
                deleteMany: {},
                create: roleIds.map(id => ({ roleId: id }))
            };
        }

        return await prisma.user.update({
            where: { userId },
            data: updateData,
            include: {
                userRoles: { select: { role: { select: { roleId: true, roleName: true, roleCode: true } } } },
                department: { select: { departmentName: true } },
                designation: { select: { designationName: true } }
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
