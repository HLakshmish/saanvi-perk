const prisma = require("../../../config/prisma");

class CompOffAssignRepository {
    async createMany(data) {
        return await prisma.compOffAssign.createMany({
            data
        });
    }

    async getById(id, companyId) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.compOffAssign.findFirst({
            where: whereClause,
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeCode: true }
                },
                policy: {
                    select: { policyName: true }
                }
            }
        });
    }

    async getAll(companyId, userId, policyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        if (userId) whereClause.userId = userId;
        if (policyId) whereClause.policyId = policyId;

        return await prisma.compOffAssign.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeCode: true }
                },
                policy: {
                    select: { policyName: true }
                }
            }
        });
    }

    async update(id, companyId, data) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.compOffAssign.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp Off Assignment not found or does not belong to this company");

        return await prisma.compOffAssign.update({
            where: { id },
            data,
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeCode: true }
                },
                policy: {
                    select: { policyName: true }
                }
            }
        });
    }

    async delete(id, companyId) {
        const whereClause = { id };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.compOffAssign.findFirst({ where: whereClause });
        if (!exists) throw new Error("Comp Off Assignment not found or does not belong to this company");

        return await prisma.compOffAssign.delete({
            where: { id }
        });
    }

    async getUserCompOffData(companyId, userId) {
        // 1. Fetch user information
        const user = await prisma.user.findFirst({
            where: { userId, companyId },
            select: {
                userId: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                officialEmail: true,
                department: { select: { departmentId: true, departmentName: true } },
                designation: { select: { designationId: true, designationName: true } }
            }
        });

        if (!user) throw new Error("User not found");

        // 2. Fetch assigned Comp-Off policy
        const compOffAssign = await prisma.compOffAssign.findFirst({
            where: {
                userId,
                companyId,
                status: true
            },
            include: {
                policy: {
                    include: {
                        leaveType: { select: { leaveTypeId: true, leaveName: true, leaveCode: true } }
                    }
                }
            },
            orderBy: { id: 'desc' }
        });

        if (!compOffAssign || !compOffAssign.policy || !compOffAssign.policy.status) {
            throw new Error("No active Comp-Off policy assigned to this employee.");
        }

        const policy = compOffAssign.policy;

        // 3. Fetch attendance records for this user (PRESENT or HALF_DAY)
        const attendances = await prisma.attendance.findMany({
            where: {
                companyId,
                userId,
                attendanceStatus: { in: ['PRESENT', 'HALF_DAY'] }
            },
            orderBy: { attendanceDate: 'desc' }
        });

        // 4. Fetch holidays for the company
        const holidays = await prisma.holiday.findMany({
            where: { companyId, status: true }
        });

        // 5. Fetch week-offs for this user
        const weekOffAssigns = await prisma.weekOffAssign.findMany({
            where: { userId, companyId, status: true },
            include: { weekOff: { include: { rules: true } } }
        });

        // 6. Fetch approved leave requests for the policy's leaveTypeId or where isCompOff is true
        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                companyId,
                userId,
                OR: [
                    { isCompOff: true },
                    { leaveTypeId: policy.leaveTypeId }
                ],
                status: 'APPROVED'
            },
            orderBy: { fromDate: 'desc' }
        });

        return {
            user,
            assignedPolicy: policy,
            assignmentDetails: {
                id: compOffAssign.id,
                startDate: compOffAssign.startDate,
                endDate: compOffAssign.endDate,
                status: compOffAssign.status
            },
            attendances,
            holidays,
            weekOffAssigns,
            leaveRequests
        };
    }

    async getAdminCompOffOverview(companyId, filters = {}) {
        const userWhereClause = { companyId, status: 'ACTIVE' };
        if (filters.departmentId) userWhereClause.departmentId = filters.departmentId;
        if (filters.userId) userWhereClause.userId = filters.userId;
        if (filters.search) {
            userWhereClause.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { employeeCode: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        // 1. Fetch all users
        const users = await prisma.user.findMany({
            where: userWhereClause,
            select: {
                userId: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                officialEmail: true,
                department: { select: { departmentId: true, departmentName: true } },
                designation: { select: { designationId: true, designationName: true } },
                compOffAssigns: {
                    where: { status: true },
                    include: {
                        policy: {
                            include: {
                                leaveType: { select: { leaveTypeId: true, leaveName: true, leaveCode: true } }
                            }
                        }
                    },
                    orderBy: { id: 'desc' },
                    take: 1
                }
            },
            orderBy: { firstName: 'asc' }
        });

        // 2. Fetch all attendances for the company (PRESENT or HALF_DAY)
        const attendances = await prisma.attendance.findMany({
            where: {
                companyId,
                attendanceStatus: { in: ['PRESENT', 'HALF_DAY'] }
            },
            orderBy: { attendanceDate: 'desc' }
        });

        // 3. Fetch company holidays
        const holidays = await prisma.holiday.findMany({
            where: { companyId, status: true }
        });

        // 4. Fetch week-offs for all users
        const weekOffAssigns = await prisma.weekOffAssign.findMany({
            where: { companyId, status: true },
            include: { weekOff: { include: { rules: true } } }
        });

        // 5. Fetch all approved comp-off leave requests
        const compOffPolicies = await prisma.compOffPolicy.findMany({
            where: { companyId },
            select: { leaveTypeId: true }
        });
        const leaveTypeIds = Array.from(new Set(compOffPolicies.map(p => p.leaveTypeId)));

        const compOffWhereConditions = [{ isCompOff: true }];
        if (leaveTypeIds.length > 0) {
            compOffWhereConditions.push({ leaveTypeId: { in: leaveTypeIds } });
        }

        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                companyId,
                OR: compOffWhereConditions,
                status: 'APPROVED'
            }
        });

        return {
            users,
            attendances,
            holidays,
            weekOffAssigns,
            leaveRequests
        };
    }
}

module.exports = new CompOffAssignRepository();
