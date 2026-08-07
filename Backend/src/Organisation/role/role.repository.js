const prisma = require("../../config/prisma");

class RoleRepository {
    async createRole(data, permissionIds = []) {
        return await prisma.role.create({
            data: {
                ...data,
                rolePermissions: {
                    create: permissionIds.map(id => ({ permissionId: id }))
                }
            },
            include: {
                rolePermissions: {
                    include: { permission: true }
                }
            }
        });
    }

    async getRoleById(roleId, companyId) {
        const whereClause = { roleId };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.role.findFirst({
            where: whereClause,
            include: {
                rolePermissions: {
                    include: { permission: true }
                }
            }
        });
    }

    async getAllRoles(companyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;

        return await prisma.role.findMany({
            where: whereClause,
            include: {
                rolePermissions: {
                    include: { permission: true }
                }
            }
        });
    }

    async updateRole(roleId, companyId, data, permissionIds) {
        return await prisma.$transaction(async (tx) => {
            const whereClause = { roleId };
            if (companyId) whereClause.companyId = companyId;

            const role = await tx.role.findFirst({ where: whereClause });
            if (!role) throw new Error("Role not found or does not belong to this company");

            const updatedRole = await tx.role.update({
                where: { roleId },
                data
            });

            if (permissionIds && Array.isArray(permissionIds)) {
                await tx.rolePermission.deleteMany({
                    where: { roleId }
                });

                if (permissionIds.length > 0) {
                    await tx.rolePermission.createMany({
                        data: permissionIds.map(id => ({ roleId, permissionId: id }))
                    });
                }
            }

            return await tx.role.findUnique({
                where: { roleId },
                include: {
                    rolePermissions: {
                        include: { permission: true }
                    }
                }
            });
        });
    }

    async deleteRole(roleId, companyId) {
        const whereClause = { roleId };
        if (companyId) whereClause.companyId = companyId;

        const role = await prisma.role.findFirst({ where: whereClause });
        if (!role) throw new Error("Role not found or does not belong to this company");

        return await prisma.role.delete({
            where: { roleId }
        });
    }

    async getAllPermissions() {
        return await prisma.permission.findMany({
            orderBy: {
                module: 'asc'
            }
        });
    }
}

module.exports = new RoleRepository();
