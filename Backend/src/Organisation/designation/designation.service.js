const designationRepository = require("./designation.repository");

class DesignationService {
    async createDesignation(data) {
        const existingCode = await designationRepository.getDesignationByCode(data.companyId, data.designationCode);
        if (existingCode) {
            throw new Error("Designation code already exists for this company");
        }
        return await designationRepository.createDesignation(data);
    }

    async getDesignationById(id) {
        const designation = await designationRepository.getDesignationById(id);
        if (!designation) {
            throw new Error("Designation not found");
        }
        return designation;
    }

    async getAllDesignations(query) {
        return await designationRepository.getAllDesignations(query);
    }

    async updateDesignation(id, data) {
        const designation = await this.getDesignationById(id);
        if (data.designationCode && data.designationCode !== designation.designationCode) {
            const existingCode = await designationRepository.getDesignationByCode(designation.companyId, data.designationCode);
            if (existingCode) {
                throw new Error("Designation code already exists for this company");
            }
        }
        return await designationRepository.updateDesignation(id, data);
    }

    async deleteDesignation(id) {
        await this.getDesignationById(id);
        return await designationRepository.deleteDesignation(id);
    }
}

module.exports = new DesignationService();
