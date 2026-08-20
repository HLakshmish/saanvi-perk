const prisma = require("../config/prisma");

class SuperAdminRepository {
    async getSuperAdminByCompanyId(companyId) {
        return await prisma.superAdmin.findUnique({
            where: { companyId },
            select: {
                superAdminId: true,
                companyId: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                status: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
}

module.exports = new SuperAdminRepository();
