const roleRepository = require("./role.repository");

class RoleService {
    async createRole(data, permissionIds) {
        try {
            return await roleRepository.createRole(data, permissionIds);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("Role with this name or code already exists in this company.");
            }
            throw error;
        }
    }

    async getRoleById(roleId, companyId) {
        const role = await roleRepository.getRoleById(roleId, companyId);
        if (!role) {
            throw new Error("Role not found");
        }
        return role;
    }

    async getAllRoles(companyId) {
        return await roleRepository.getAllRoles(companyId);
    }

    async updateRole(roleId, companyId, data, permissionIds) {
        try {
            return await roleRepository.updateRole(roleId, companyId, data, permissionIds);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("Role with this name or code already exists in this company.");
            }
            throw error;
        }
    }

    async deleteRole(roleId, companyId) {
        return await roleRepository.deleteRole(roleId, companyId);
    }

    async getAllPermissions() {
        return await roleRepository.getAllPermissions();
    }
}

module.exports = new RoleService();
