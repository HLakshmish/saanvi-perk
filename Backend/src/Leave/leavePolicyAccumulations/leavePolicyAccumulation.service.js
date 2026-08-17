const leavePolicyAccumulationRepository = require("./leavePolicyAccumulation.repository");

class LeavePolicyAccumulationService {
    async create(data, companyId) {
        try {
            return await leavePolicyAccumulationRepository.create(data, companyId);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("A record with this unique identifier already exists.");
            }
            throw error;
        }
    }

    async getById(leavePolicyAccumulationId, companyId) {
        const result = await leavePolicyAccumulationRepository.getById(leavePolicyAccumulationId, companyId);
        if (!result) throw new Error("LeavePolicyAccumulation not found");
        return result;
    }

    async getAll(companyId) {
        return await leavePolicyAccumulationRepository.getAll(companyId);
    }

    async update(leavePolicyAccumulationId, companyId, data) {
        try {
            return await leavePolicyAccumulationRepository.update(leavePolicyAccumulationId, companyId, data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("A record with this unique identifier already exists.");
            }
            throw error;
        }
    }

    async delete(leavePolicyAccumulationId, companyId) {
        return await leavePolicyAccumulationRepository.delete(leavePolicyAccumulationId, companyId);
    }
}

module.exports = new LeavePolicyAccumulationService();
