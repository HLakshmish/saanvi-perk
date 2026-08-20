const superAdminRepository = require("./superAdmin.repository");

class SuperAdminService {
    async getSuperAdminDetails(companyId) {
        if (!companyId) {
            throw new Error("Company ID is required");
        }
        const superAdmin = await superAdminRepository.getSuperAdminByCompanyId(companyId);
        if (!superAdmin) {
            throw new Error("Super admin details not found for this company");
        }
        return superAdmin;
    }
}

module.exports = new SuperAdminService();
