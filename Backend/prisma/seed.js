const prisma = require('../src/config/prisma');

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Base Permissions Definition
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

    // Attendance Requests
    {
      permissionName: 'View Attendance Requests',
      permissionCode: 'VIEW_ATTENDANCE_REQUESTS',
      module: 'Attendance Management',
      description: 'Allows viewing attendance regularization requests'
    },
    {
      permissionName: 'Manage Attendance Requests',
      permissionCode: 'MANAGE_ATTENDANCE_REQUESTS',
      module: 'Attendance Management',
      description: 'Allows approving or rejecting attendance requests'
    },

    // Week-Off
    {
      permissionName: 'View Week-Offs',
      permissionCode: 'VIEW_WEEK_OFFS',
      module: 'Attendance Management',
      description: 'Allows viewing week-off policies and assignments'
    },
    {
      permissionName: 'Manage Week-Offs',
      permissionCode: 'MANAGE_WEEK_OFFS',
      module: 'Attendance Management',
      description: 'Allows creating and assigning week-off policies'
    },

    // Leave Management - General & Requests
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

    // Leave Management - Leave Types
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

    // Leave Management - Leave Policies
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

    // Leave Management - Policy Rules
    {
      permissionName: 'View Leave Policy Rules',
      permissionCode: 'VIEW_LEAVE_POLICY_RULES',
      module: 'Leave Management',
      description: 'Allows viewing leave policy rules'
    },
    {
      permissionName: 'Manage Leave Policy Rules',
      permissionCode: 'MANAGE_LEAVE_POLICY_RULES',
      module: 'Leave Management',
      description: 'Allows creating, updating, and deleting leave policy rules'
    },

    // Leave Management - Policy Accumulations
    {
      permissionName: 'View Leave Policy Accumulations',
      permissionCode: 'VIEW_LEAVE_POLICY_ACCUMULATIONS',
      module: 'Leave Management',
      description: 'Allows viewing leave policy accumulations'
    },
    {
      permissionName: 'Manage Leave Policy Accumulations',
      permissionCode: 'MANAGE_LEAVE_POLICY_ACCUMULATIONS',
      module: 'Leave Management',
      description: 'Allows configuring leave policy accumulations'
    },

    // Leave Management - Employee Leave Accumulations
    {
      permissionName: 'View Leave Accumulations',
      permissionCode: 'VIEW_LEAVE_ACCUMULATIONS',
      module: 'Leave Management',
      description: 'Allows viewing employee leave accumulations'
    },
    {
      permissionName: 'Manage Leave Accumulations',
      permissionCode: 'MANAGE_LEAVE_ACCUMULATIONS',
      module: 'Leave Management',
      description: 'Allows creating and managing leave accumulations'
    },

    // Leave Management - Year-End Process
    {
      permissionName: 'View Leave Year-End Processes',
      permissionCode: 'VIEW_LEAVE_YEAR_END_PROCESSES',
      module: 'Leave Management',
      description: 'Allows viewing leave year-end processes'
    },
    {
      permissionName: 'Manage Leave Year-End Processes',
      permissionCode: 'MANAGE_LEAVE_YEAR_END_PROCESSES',
      module: 'Leave Management',
      description: 'Allows running and managing leave year-end processes'
    },

    // Leave Management - Comp-Off Policies
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

    // Leave Management - Comp-Off Assignments
    {
      permissionName: 'View Comp-Off Assignments',
      permissionCode: 'VIEW_COMP_OFF_ASSIGNS',
      module: 'Leave Management',
      description: 'Allows viewing compensatory off assignments'
    },
    {
      permissionName: 'Manage Comp-Off Assignments',
      permissionCode: 'MANAGE_COMP_OFF_ASSIGNS',
      module: 'Leave Management',
      description: 'Allows assigning and managing compensatory off'
    },

    // Organisation Management - Locations
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

    // Organisation Management - Designations
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

    // Organisation Management - Calendars
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

    // Organisation Management - Holidays
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

    // Reimbursement Management
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

    // Asset Management
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

  console.log(`Seeding ${basePermissions.length} permissions...`);
  const seededPermissionsMap = new Map();

  for (const p of basePermissions) {
    const perm = await prisma.permission.upsert({
      where: { permissionCode: p.permissionCode },
      update: {
        permissionName: p.permissionName,
        module: p.module,
        description: p.description,
      },
      create: p,
    });
    seededPermissionsMap.set(perm.permissionCode, perm);
  }
  console.log(`✓ All ${basePermissions.length} permissions created/verified.`);

  // 2. Default Roles Creation for Companies without Roles
  const companies = await prisma.companyDetails.findMany({
    include: { roles: true }
  });

  for (const company of companies) {
    if (!company.roles || company.roles.length === 0) {
      console.log(`Company "${company.companyName}" (ID: ${company.companyId}) has no roles. Creating default roles...`);
      await prisma.role.create({
        data: {
          companyId: company.companyId,
          roleName: 'Administrator',
          roleCode: 'ADMIN',
          description: 'Full administrative access',
          status: true,
        }
      });
      await prisma.role.create({
        data: {
          companyId: company.companyId,
          roleName: 'Employee',
          roleCode: 'EMPLOYEE',
          description: 'Standard employee access',
          status: true,
        }
      });
    }
  }

  // 3. Synchronize Role Permissions with Existing Roles
  const allRoles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        include: { permission: true }
      }
    }
  });

  if (allRoles.length > 0) {
    console.log(`Synchronizing permissions for ${allRoles.length} role(s)...`);

    // Permissions suitable for regular employees / users
    const employeePermissionCodes = [
      'VIEW_COMPANY',
      'VIEW_DEPARTMENTS',
      'VIEW_LOCATIONS',
      'VIEW_DESIGNATIONS',
      'VIEW_CALENDARS',
      'VIEW_HOLIDAYS',
      'VIEW_ATTENDANCE',
      'VIEW_ATTENDANCE_REQUESTS',
      'VIEW_WEEK_OFFS',
      'APPLY_LEAVE',
      'VIEW_LEAVES',
      'VIEW_LEAVE_TYPES',
      'VIEW_LEAVE_POLICIES',
      'APPLY_REIMBURSEMENT',
      'VIEW_REIMBURSEMENT',
      'VIEW_ASSETS',
    ];

    const allPermissionRecords = Array.from(seededPermissionsMap.values());

    for (const role of allRoles) {
      const codeUpper = (role.roleCode || '').toUpperCase();
      const nameUpper = (role.roleName || '').toUpperCase();
      const isAdminRole = (
        codeUpper.includes('ADMIN') ||
        codeUpper.includes('OWNER') ||
        codeUpper.includes('MGR') ||
        codeUpper.includes('MANAGER') ||
        codeUpper.includes('HR') ||
        nameUpper.includes('ADMIN') ||
        nameUpper.includes('MANAGER') ||
        nameUpper.includes('HR')
      );

      const targetPermissions = isAdminRole
        ? allPermissionRecords
        : allPermissionRecords.filter(p => employeePermissionCodes.includes(p.permissionCode));

      for (const perm of targetPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.roleId,
              permissionId: perm.permissionId,
            }
          },
          update: {},
          create: {
            roleId: role.roleId,
            permissionId: perm.permissionId,
          }
        });
      }

      // Also ensure that any role with MANAGE_* automatically has the corresponding VIEW_*
      const currentRolePerms = await prisma.rolePermission.findMany({
        where: { roleId: role.roleId },
        include: { permission: true }
      });

      for (const rp of currentRolePerms) {
        if (rp.permission && rp.permission.permissionCode.startsWith('MANAGE_')) {
          const viewCode = rp.permission.permissionCode.replace('MANAGE_', 'VIEW_');
          const matchingViewPerm = seededPermissionsMap.get(viewCode);
          if (matchingViewPerm) {
            await prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.roleId,
                  permissionId: matchingViewPerm.permissionId,
                }
              },
              update: {},
              create: {
                roleId: role.roleId,
                permissionId: matchingViewPerm.permissionId,
              }
            });
          }
        }
      }

      console.log(`✓ Role "${role.roleName}" (${role.roleCode}) synced.`);
    }
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
