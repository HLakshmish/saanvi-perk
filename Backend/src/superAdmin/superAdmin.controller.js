const superAdminService = require("./superAdmin.service");

class SuperAdminController {
    async getSuperAdminDetails(request, reply) {
        try {
            const { companyId } = request.user;
            
            const superAdmin = await superAdminService.getSuperAdminDetails(companyId);

            return reply.status(200).send({
                success: true,
                message: "Super admin details fetched successfully",
                data: superAdmin
            });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new SuperAdminController();
