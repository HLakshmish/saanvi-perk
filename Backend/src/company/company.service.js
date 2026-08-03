const companyRepository = require("./company.repository");

class CompanyService {
    async createCompany(data) {
        const existingCode = await companyRepository.getCompanyByCode(data.companyCode);
        if (existingCode) {
            throw new Error("Company code already exists");
        }
        return await companyRepository.createCompany(data);
    }

    async getCompanyById(id) {
        const company = await companyRepository.getCompanyById(id);
        if (!company) {
            throw new Error("Company not found");
        }
        return company;
    }

    async getAllCompanies(query) {
        return await companyRepository.getAllCompanies(query);
    }

    async updateCompany(id, data) {
        await this.getCompanyById(id); // Check existence
        if (data.companyCode) {
            const existingCode = await companyRepository.getCompanyByCode(data.companyCode);
            if (existingCode && existingCode.companyId !== id) {
                throw new Error("Company code already exists for another company");
            }
        }
        return await companyRepository.updateCompany(id, data);
    }

    async deleteCompany(id) {
        await this.getCompanyById(id); // Check existence
        return await companyRepository.deleteCompany(id);
    }
}

module.exports = new CompanyService();
