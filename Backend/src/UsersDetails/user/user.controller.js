const userService = require("./user.service");

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
            
            // Do not return password hash
            const { password, ...userWithoutPassword } = user;
            
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
            
            users.forEach(u => delete u.password);

            reply.code(200).send({ success: true, data: users });
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
            delete user.password;

            reply.code(200).send({ success: true, message: "User updated successfully", data: user });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
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
}

module.exports = new UserController();
