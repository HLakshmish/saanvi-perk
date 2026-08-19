const repository = require("./compOffAssign.repository");

class CompOffAssignService {
    async createMany(data) {
        try {
            return await repository.createMany(data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: User, Policy, or Company does not exist.");
            }
            throw error;
        }
    }

    async getById(id, companyId) {
        const record = await repository.getById(id, companyId);
        if (!record) throw new Error("Comp Off Assignment not found");
        return record;
    }

    async getAll(companyId, userId, policyId) {
        return await repository.getAll(companyId, userId, policyId);
    }

    async update(id, companyId, data) {
        try {
            return await repository.update(id, companyId, data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: User, Policy, or Company does not exist.");
            }
            throw error;
        }
    }

    async delete(id, companyId) {
        return await repository.delete(id, companyId);
    }
}

module.exports = new CompOffAssignService();
