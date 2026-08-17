const leavePolicyRepository = require("./leavePolicy.repository");

class LeavePolicyService {
    async create(data) {
        try {
            return await leavePolicyRepository.create(data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("A record with this unique identifier already exists.");
            }
            throw error;
        }
    }

    async getById(leavePolicyId, companyId) {
        const result = await leavePolicyRepository.getById(leavePolicyId, companyId);
        if (!result) throw new Error("LeavePolicy not found");
        return result;
    }

    async getAll(companyId) {
        return await leavePolicyRepository.getAll(companyId);
    }

    async update(leavePolicyId, companyId, data) {
        try {
            return await leavePolicyRepository.update(leavePolicyId, companyId, data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("A record with this unique identifier already exists.");
            }
            throw error;
        }
    }

    async delete(leavePolicyId, companyId) {
        return await leavePolicyRepository.delete(leavePolicyId, companyId);
    }
}

module.exports = new LeavePolicyService();
