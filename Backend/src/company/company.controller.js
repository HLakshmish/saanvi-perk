const companyService = require("./company.service");

class CompanyController {
    async createCompany(request, reply) {
        try {
            const company = await companyService.createCompany(request.body);
            reply.code(201).send({ success: true, message: "Company created successfully", data: company });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getCompanyById(request, reply) {
        try {
            const { id } = request.params;
            const company = await companyService.getCompanyById(Number(id));
            reply.code(200).send({ success: true, data: company });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllCompanies(request, reply) {
        try {
            const companies = await companyService.getAllCompanies(request.query);
            reply.code(200).send({ success: true, data: companies });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateCompany(request, reply) {
        try {
            const { id } = request.params;
            const company = await companyService.updateCompany(Number(id), request.body);
            reply.code(200).send({ success: true, message: "Company updated successfully", data: company });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteCompany(request, reply) {
        try {
            const { id } = request.params;
            await companyService.deleteCompany(Number(id));
            reply.code(200).send({ success: true, message: "Company deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new CompanyController();
