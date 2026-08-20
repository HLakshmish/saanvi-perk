const prisma = require("../../config/prisma");

class UserRepository {
    async createUser(data) {
        const { roleIds, dateOfBirth, ...userData } = data;
        const createData = { ...userData };
        if (roleIds && roleIds.length > 0) {
            createData.userRoles = {
                create: roleIds.map(id => ({ roleId: id }))
            };
        }

        if (dateOfBirth) {
            createData.personalInformation = {
                create: {
                    dateOfBirth: new Date(dateOfBirth)
                }
            };
        }

        return await prisma.user.create({ 
            data: createData,
            include: {
                userRoles: { select: { role: { select: { roleId: true, roleName: true, roleCode: true } } } },
                department: { select: { departmentName: true } },
                designation: { select: { designationName: true } },
                personalInformation: { select: { dateOfBirth: true } }
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
    async getEvents(companyId, targetDateString) {
        const targetDate = targetDateString ? new Date(targetDateString) : new Date();
        const month = targetDate.getMonth() + 1;
        const day = targetDate.getDate();

        const users = await prisma.user.findMany({
            where: { 
                companyId: companyId,
                status: 'ACTIVE'
            },
            include: {
                personalInformation: {
                    select: { dateOfBirth: true }
                },
                designation: {
                    select: { designationName: true }
                }
            }
        });

        const birthdays = [];
        const anniversaries = [];

        users.forEach(user => {
            if (user.personalInformation && user.personalInformation.dateOfBirth) {
                const dob = new Date(user.personalInformation.dateOfBirth);
                if (dob.getMonth() + 1 === month && dob.getDate() === day) {
                    birthdays.push({
                        userId: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        employeeCode: user.employeeCode,
                        designation: user.designation ? user.designation.designationName : null,
                        profilePic: user.profilePic,
                        dateOfBirth: user.personalInformation.dateOfBirth
                    });
                }
            }

            if (user.joiningDate) {
                const jd = new Date(user.joiningDate);
                if (jd.getMonth() + 1 === month && jd.getDate() === day) {
                    const years = targetDate.getFullYear() - jd.getFullYear();
                    if (years > 0) {
                        anniversaries.push({
                            userId: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            employeeCode: user.employeeCode,
                            designation: user.designation ? user.designation.designationName : null,
                            profilePic: user.profilePic,
                            joiningDate: user.joiningDate,
                            years: years
                        });
                    }
                }
            }
        });

        return { birthdays, anniversaries };
    }
}

module.exports = new UserRepository();
