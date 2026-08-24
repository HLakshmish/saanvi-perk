const userService = require("./user.service");
// Trigger restart for prisma client
class UserController {
    async createUser(request, reply) {
        try {
            const { companyId, ...userData } = request.body;
            
            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                if (!companyId) throw new Error("OWNER must provide a companyId to create a user.");
                targetCompanyId = companyId;
            } else if (request.user.role === 'SUPERADMIN' || request.user.role === 'USER') {
                targetCompanyId = request.user.companyId;
            } else {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            userData.companyId = targetCompanyId;
            userData.createdBy = request.user.role === 'USER' ? request.user.userId : null;

            // Handle falsy IDs
            if (!userData.departmentId) userData.departmentId = null;
            if (!userData.designationId) userData.designationId = null;
            if (!userData.reportingToId) userData.reportingToId = null;
            if (!userData.shiftId) userData.shiftId = null;

            const user = await userService.createUser(userData);
            
            const { password, userRoles, personalInformation, ...userWithoutPassword } = user;
            if (userRoles && userRoles.length > 0) {
                userWithoutPassword.roles = userRoles.map(ur => ({
                    roleId: ur.role.roleId,
                    roleName: ur.role.roleName
                }));
            } else {
                userWithoutPassword.roles = [];
            }
            if (personalInformation && personalInformation.dateOfBirth) {
                userWithoutPassword.dateOfBirth = personalInformation.dateOfBirth;
            }
            
            reply.code(201).send({ success: true, message: "User created successfully", data: userWithoutPassword });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getUserById(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const user = await userService.getUserById(Number(id), companyId);
            
            if (user) {
                delete user.password;
                if (user.userRoles && user.userRoles.length > 0) {
                    user.roles = user.userRoles.map(ur => ({
                        roleId: ur.role.roleId,
                        roleName: ur.role.roleName
                    }));
                } else {
                    user.roles = [];
                }
                delete user.userRoles;
            }

            reply.code(200).send({ success: true, data: user });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllUsers(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const users = await userService.getAllUsers(companyId);
            
            const formattedUsers = users.map(u => {
                const { password, userRoles, ...rest } = u;
                if (userRoles && userRoles.length > 0) {
                    rest.roles = userRoles.map(ur => ({
                        roleId: ur.role.roleId,
                        roleName: ur.role.roleName
                    }));
                } else {
                    rest.roles = [];
                }
                return rest;
            });

            reply.code(200).send({ success: true, data: formattedUsers });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateUser(request, reply) {
        try {
            const { id } = request.params;
            const { companyId, ...data } = request.body;

            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                targetCompanyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            data.updatedBy = request.user.role === 'USER' ? request.user.userId : null;

            if (data.departmentId === 0 || data.departmentId === "") data.departmentId = null;
            if (data.designationId === 0 || data.designationId === "") data.designationId = null;
            if (data.reportingToId === 0 || data.reportingToId === "") data.reportingToId = null;
            if (data.shiftId === 0 || data.shiftId === "") data.shiftId = null;
            
            if (data.password === "") delete data.password;

            const user = await userService.updateUser(Number(id), targetCompanyId, data);
            const { password, userRoles, ...userWithoutPassword } = user;
            if (userRoles && userRoles.length > 0) {
                userWithoutPassword.roles = userRoles.map(ur => ({
                    roleId: ur.role.roleId,
                    roleName: ur.role.roleName
                }));
            } else {
                userWithoutPassword.roles = [];
            }

            reply.code(200).send({ success: true, message: "User updated successfully", data: userWithoutPassword });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getEvents(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const { date } = request.query;

            const events = await userService.getEvents(companyId, date);

            reply.code(200).send({ success: true, data: events });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async deleteUser(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            await userService.deleteUser(Number(id), companyId);
            reply.code(200).send({ success: true, message: "User deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async downloadReport(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const users = await userService.getAllUsers(companyId);

            const headers = ['User ID', 'Employee Code', 'First Name', 'Last Name', 'Official Email', 'Phone Number', 'Employment Type', 'Joining Date', 'Status', 'Roles', 'Department'];

            const csvRows = users.map(u => {
                const roles = u.userRoles ? u.userRoles.map(ur => ur.role.roleName).join(' | ') : '';
                return [
                    u.userId,
                    u.employeeCode,
                    u.firstName,
                    u.lastName || '',
                    u.officialEmail,
                    u.phoneNumber || '',
                    u.employmentType || '',
                    u.joiningDate ? new Date(u.joiningDate).toISOString().split('T')[0] : '',
                    u.status || '',
                    `"${roles}"`,
                    u.department ? u.department.departmentName : ''
                ];
            });

            const csvString = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
            
            reply.header('Content-Type', 'text/csv');
            reply.header('Content-Disposition', 'attachment; filename="users_report.csv"');
            return reply.send(csvString);
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async viewReport(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const users = await userService.getAllUsers(companyId);
            
            const formattedUsers = users.map(u => {
                const { password, userRoles, ...rest } = u;
                if (userRoles && userRoles.length > 0) {
                    rest.roles = userRoles.map(ur => ({
                        roleId: ur.role.roleId,
                        roleName: ur.role.roleName
                    }));
                } else {
                    rest.roles = [];
                }
                return rest;
            });

            reply.code(200).send({ success: true, data: formattedUsers });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
