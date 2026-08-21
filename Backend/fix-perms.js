const prisma = require("./src/config/prisma");

async function fixMissingPermissions() {
    try {
        console.log("Fixing missing VIEW_LEAVE_TYPES permission for roles that have MANAGE_LEAVE_TYPES...");

        const viewPerm = await prisma.permission.findUnique({ where: { permissionCode: 'VIEW_LEAVE_TYPES' } });
        const managePerm = await prisma.permission.findUnique({ where: { permissionCode: 'MANAGE_LEAVE_TYPES' } });

        if (!viewPerm || !managePerm) {
            console.log("Permissions missing from database. Make sure you seeded correctly.");
            return;
        }

        // Find all roles that have MANAGE_LEAVE_TYPES
        const rolesWithManage = await prisma.rolePermission.findMany({
            where: { permissionId: managePerm.permissionId }
        });

        for (const rp of rolesWithManage) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: rp.roleId,
                        permissionId: viewPerm.permissionId
                    }
                },
                update: {},
                create: {
                    roleId: rp.roleId,
                    permissionId: viewPerm.permissionId
                }
            });
            console.log(`Assigned VIEW_LEAVE_TYPES to role ID: ${rp.roleId}`);
        }
        
        console.log("Fix completed successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixMissingPermissions();
