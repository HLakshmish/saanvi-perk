const prisma = require('../src/config/prisma');

async function main() {
  console.log("Seeding base permissions...");

  const basePermissions = [
    // Company Details
    {
      permissionName: 'View Company Details',
      permissionCode: 'VIEW_COMPANY',
      module: 'Company Management',
      description: 'Allows viewing company settings and details'
    },
    {
      permissionName: 'Manage Company Details',
      permissionCode: 'MANAGE_COMPANY',
      module: 'Company Management',
      description: 'Allows editing company settings and details'
    },
    // Departments
    {
      permissionName: 'View Departments',
      permissionCode: 'VIEW_DEPARTMENTS',
      module: 'Department Management',
      description: 'Allows viewing the list of departments and their details'
    },
    {
      permissionName: 'Manage Departments',
      permissionCode: 'MANAGE_DEPARTMENTS',
      module: 'Department Management',
      description: 'Allows creating, updating, and deleting departments'
    },
    // Roles
    {
      permissionName: 'View Roles',
      permissionCode: 'VIEW_ROLES',
      module: 'Role Management',
      description: 'Allows viewing roles and their assigned permissions'
    },
    {
      permissionName: 'Manage Roles',
      permissionCode: 'MANAGE_ROLES',
      module: 'Role Management',
      description: 'Allows creating, updating, and deleting roles'
    },
    // Users
    {
      permissionName: 'View Users',
      permissionCode: 'VIEW_USERS',
      module: 'User Management',
      description: 'Allows reading user and employee data'
    },
    {
      permissionName: 'Manage Users',
      permissionCode: 'MANAGE_USERS',
      module: 'User Management',
      description: 'Allows creating, updating, and deleting users'
    }
  ];

  for (const p of basePermissions) {
    const perm = await prisma.permission.upsert({
      where: { permissionCode: p.permissionCode },
      update: {},
      create: p,
    });
    console.log(`Created/Verified permission: ${perm.permissionCode} (ID: ${perm.permissionId})`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
