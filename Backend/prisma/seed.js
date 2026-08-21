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
    },
    // Attendance
    {
      permissionName: 'View Attendance',
      permissionCode: 'VIEW_ATTENDANCE',
      module: 'Attendance Management',
      description: 'Allows viewing attendance records'
    },
    {
      permissionName: 'Manage Attendance',
      permissionCode: 'MANAGE_ATTENDANCE',
      module: 'Attendance Management',
      description: 'Allows managing attendance records'
    },
    // Leave Management
    {
      permissionName: 'Apply Leave',
      permissionCode: 'APPLY_LEAVE',
      module: 'Leave Management',
      description: 'Allows applying for leaves'
    },
    {
      permissionName: 'View Leaves',
      permissionCode: 'VIEW_LEAVES',
      module: 'Leave Management',
      description: 'Allows viewing leave requests'
    },
    {
      permissionName: 'Manage Leaves',
      permissionCode: 'MANAGE_LEAVES',
      module: 'Leave Management',
      description: 'Allows managing and approving leave requests'
    },
    {
      permissionName: 'View Leave Types',
      permissionCode: 'VIEW_LEAVE_TYPES',
      module: 'Leave Management',
      description: 'Allows viewing leave types'
    },
    {
      permissionName: 'Manage Leave Types',
      permissionCode: 'MANAGE_LEAVE_TYPES',
      module: 'Leave Management',
      description: 'Allows managing leave types'
    },
    // Organisation
    {
      permissionName: 'View Locations',
      permissionCode: 'VIEW_LOCATIONS',
      module: 'Organisation Management',
      description: 'Allows viewing office locations'
    },
    {
      permissionName: 'Manage Locations',
      permissionCode: 'MANAGE_LOCATIONS',
      module: 'Organisation Management',
      description: 'Allows managing office locations'
    },
    {
      permissionName: 'View Designations',
      permissionCode: 'VIEW_DESIGNATIONS',
      module: 'Organisation Management',
      description: 'Allows viewing designations'
    },
    {
      permissionName: 'Manage Designations',
      permissionCode: 'MANAGE_DESIGNATIONS',
      module: 'Organisation Management',
      description: 'Allows managing designations'
    },
    {
      permissionName: 'View Calendars',
      permissionCode: 'VIEW_CALENDARS',
      module: 'Organisation Management',
      description: 'Allows viewing calendars'
    },
    {
      permissionName: 'Manage Calendars',
      permissionCode: 'MANAGE_CALENDARS',
      module: 'Organisation Management',
      description: 'Allows managing calendars'
    },
    {
      permissionName: 'View Holidays',
      permissionCode: 'VIEW_HOLIDAYS',
      module: 'Organisation Management',
      description: 'Allows viewing holidays'
    },
    {
      permissionName: 'Manage Holidays',
      permissionCode: 'MANAGE_HOLIDAYS',
      module: 'Organisation Management',
      description: 'Allows managing holidays'
    },
    // Reimbursement
    {
      permissionName: 'Apply Reimbursement',
      permissionCode: 'APPLY_REIMBURSEMENT',
      module: 'Reimbursement Management',
      description: 'Allows applying for reimbursement claims'
    },
    {
      permissionName: 'View Reimbursements',
      permissionCode: 'VIEW_REIMBURSEMENT',
      module: 'Reimbursement Management',
      description: 'Allows viewing reimbursement claims'
    },
    {
      permissionName: 'Manage Reimbursements',
      permissionCode: 'MANAGE_REIMBURSEMENTS',
      module: 'Reimbursement Management',
      description: 'Allows managing and approving reimbursement claims'
    },
    // Leave Policies
    {
      permissionName: 'View Leave Policies',
      permissionCode: 'VIEW_LEAVE_POLICIES',
      module: 'Leave Management',
      description: 'Allows viewing leave policies'
    },
    {
      permissionName: 'Manage Leave Policies',
      permissionCode: 'MANAGE_LEAVE_POLICIES',
      module: 'Leave Management',
      description: 'Allows managing leave policies'
    },
    // Comp-Off Policies
    {
      permissionName: 'View Comp-Off Policies',
      permissionCode: 'VIEW_COMP_OFF_POLICIES',
      module: 'Leave Management',
      description: 'Allows viewing comp-off policies'
    },
    {
      permissionName: 'Manage Comp-Off Policies',
      permissionCode: 'MANAGE_COMP_OFF_POLICIES',
      module: 'Leave Management',
      description: 'Allows managing comp-off policies'
    },
    // Assets
    {
      permissionName: 'View Assets',
      permissionCode: 'VIEW_ASSETS',
      module: 'Asset Management',
      description: 'Allows viewing company assets'
    },
    {
      permissionName: 'Manage Assets',
      permissionCode: 'MANAGE_ASSETS',
      module: 'Asset Management',
      description: 'Allows managing company assets'
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
