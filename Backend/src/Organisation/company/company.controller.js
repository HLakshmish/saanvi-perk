const companyService = require("./company.service");

class CompanyController {
    async createCompany(request, reply) {
        try {
            if (request.user.role !== 'OWNER') {
                return reply.code(403).send({ success: false, message: "Forbidden: Only OWNER can create companies" });
            }
            const company = await companyService.createCompany(request.body);
            reply.code(201).send({ success: true, message: "Company created successfully", data: company });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getCompanyById(request, reply) {
        try {
            const { id } = request.params;
            if (request.user.role === 'SUPERADMIN' && Number(id) !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only access your own company" });
            }
            const company = await companyService.getCompanyById(Number(id));
            reply.code(200).send({ success: true, data: company });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllCompanies(request, reply) {
        try {
            const query = { ...request.query };
            if (request.user.role === 'SUPERADMIN') {
                query.companyId = request.user.companyId;
            }
            const companies = await companyService.getAllCompanies(query);
            reply.code(200).send({ success: true, data: companies });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateCompany(request, reply) {
        try {
            const { id } = request.params;
            if (request.user.role === 'SUPERADMIN' && Number(id) !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only update your own company" });
            }
            const company = await companyService.updateCompany(Number(id), request.body);
            reply.code(200).send({ success: true, message: "Company updated successfully", data: company });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteCompany(request, reply) {
        try {
            const { id } = request.params;
            if (request.user.role !== 'OWNER') {
                return reply.code(403).send({ success: false, message: "Forbidden: Only OWNER can delete companies" });
            }
            await companyService.deleteCompany(Number(id));
            reply.code(200).send({ success: true, message: "Company deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new CompanyController();
