const prisma = require('./src/config/prisma');

async function seedPermissions() {
    try {
        const permissionsToCreate = [
            { permissionName: 'Apply Reimbursement', permissionCode: 'APPLY_REIMBURSEMENT', module: 'REIMBURSEMENT' },
            { permissionName: 'View Reimbursement', permissionCode: 'VIEW_REIMBURSEMENT', module: 'REIMBURSEMENT' },
            { permissionName: 'Manage Reimbursements', permissionCode: 'MANAGE_REIMBURSEMENTS', module: 'REIMBURSEMENT' }
        ];

        for (const p of permissionsToCreate) {
            await prisma.permission.upsert({
                where: { permissionCode: p.permissionCode },
                update: {},
                create: p
            });
        }
        console.log("Permissions seeded successfully.");

        // Optionally, assign to all roles or just output that they need to be assigned
        const roles = await prisma.role.findMany();
        const permissions = await prisma.permission.findMany({
            where: {
                permissionCode: {
                    in: ['APPLY_REIMBURSEMENT', 'VIEW_REIMBURSEMENT', 'MANAGE_REIMBURSEMENTS']
                }
            }
        });

        for (const role of roles) {
            for (const perm of permissions) {
                // If it's a USER role, maybe only give them VIEW and APPLY. 
                // Let's just give all 3 to OWNER/ADMIN and APPLY/VIEW to USER
                if (role.roleCode === 'USER' && perm.permissionCode === 'MANAGE_REIMBURSEMENTS') {
                    continue;
                }
                
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.roleId,
                            permissionId: perm.permissionId
                        }
                    },
                    update: {},
                    create: {
                        roleId: role.roleId,
                        permissionId: perm.permissionId
                    }
                });
            }
        }
        
        console.log("Permissions assigned to existing roles successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

seedPermissions();
