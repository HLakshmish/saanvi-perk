const repository = require("./compOffPolicy.repository");

class CompOffPolicyService {
    async create(data) {
        try {
            return await repository.create(data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: Company or LeaveType does not exist.");
            }
            throw error;
        }
    }

    async getById(id, companyId) {
        const record = await repository.getById(id, companyId);
        if (!record) throw new Error("Comp Off Policy not found");
        return record;
    }

    async getAll(companyId) {
        return await repository.getAll(companyId);
    }

    async update(id, companyId, data) {
        try {
            return await repository.update(id, companyId, data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: Company or LeaveType does not exist.");
            }
            throw error;
        }
    }

    async delete(id, companyId) {
        return await repository.delete(id, companyId);
    }
}

module.exports = new CompOffPolicyService();
