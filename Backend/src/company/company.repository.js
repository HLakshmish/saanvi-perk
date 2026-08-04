const prisma = require("../config/prisma");

class CompanyRepository {
    async createCompany(data) {
        const { superAdmin, ...companyData } = data;
        
        const createData = {
            ...companyData,
        };

        if (superAdmin) {
            createData.superAdmin = {
                create: superAdmin
            };
        }

        return await prisma.companyDetails.create({
            data: createData,
            include: {
                superAdmin: true
            }
        });
    }

    async getSuperAdminByEmail(email) {
        return await prisma.superAdmin.findUnique({
            where: { email }
        });
    }

    async getCompanyById(id) {
        return await prisma.companyDetails.findUnique({
            where: { companyId: id }
        });
    }
    
    async getCompanyByCode(code) {
        return await prisma.companyDetails.findUnique({
            where: { companyCode: code }
        });
    }

    async getAllCompanies(query = {}) {
        return await prisma.companyDetails.findMany({
            where: query
        });
    }

    async updateCompany(id, data) {
        return await prisma.companyDetails.update({
            where: { companyId: id },
            data
        });
    }

    async deleteCompany(id) {
        return await prisma.companyDetails.delete({
            where: { companyId: id }
        });
    }
}

module.exports = new CompanyRepository();
