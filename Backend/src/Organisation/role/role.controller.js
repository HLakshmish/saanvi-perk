const roleService = require("./role.service");

class RoleController {
    async createRole(request, reply) {
        try {
            const { permissionIds, companyId, ...roleData } = request.body;
            
            // Determine the target company ID
            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                if (!companyId) throw new Error("OWNER must provide a companyId to create a role.");
                targetCompanyId = companyId;
            } else if (request.user.role === 'SUPERADMIN' || request.user.role === 'USER') {
                targetCompanyId = request.user.companyId;
            } else {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to create roles." });
            }

            roleData.companyId = targetCompanyId;

            const role = await roleService.createRole(roleData, permissionIds || []);
            reply.code(201).send({ success: true, message: "Role created successfully", data: role });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getRoleById(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const role = await roleService.getRoleById(Number(id), companyId);
            reply.code(200).send({ success: true, data: role });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllRoles(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const roles = await roleService.getAllRoles(companyId);
            reply.code(200).send({ success: true, data: roles });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateRole(request, reply) {
        try {
            const { id } = request.params;
            const { permissionIds, companyId, ...data } = request.body;

            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                targetCompanyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to update roles." });
            }

            const role = await roleService.updateRole(Number(id), targetCompanyId, data, permissionIds);
            reply.code(200).send({ success: true, message: "Role updated successfully", data: role });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteRole(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to delete roles." });
            }

            await roleService.deleteRole(Number(id), companyId);
            reply.code(200).send({ success: true, message: "Role deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getAllPermissions(request, reply) {
        try {
            const permissions = await roleService.getAllPermissions();
            reply.code(200).send({ success: true, data: permissions });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = new RoleController();
