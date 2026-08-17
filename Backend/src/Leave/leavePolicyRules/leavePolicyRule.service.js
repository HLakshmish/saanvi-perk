const leavePolicyRuleRepository = require("./leavePolicyRule.repository");

class LeavePolicyRuleService {
    async create(data, companyId) {
        try {
            return await leavePolicyRuleRepository.create(data, companyId);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("A record with this unique identifier already exists.");
            }
            throw error;
        }
    }

    async getById(leavePolicyRuleId, companyId) {
        const result = await leavePolicyRuleRepository.getById(leavePolicyRuleId, companyId);
        if (!result) throw new Error("LeavePolicyRule not found");
        return result;
    }

    async getAll(companyId) {
        return await leavePolicyRuleRepository.getAll(companyId);
    }

    async update(leavePolicyRuleId, companyId, data) {
        try {
            return await leavePolicyRuleRepository.update(leavePolicyRuleId, companyId, data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("A record with this unique identifier already exists.");
            }
            throw error;
        }
    }

    async delete(leavePolicyRuleId, companyId) {
        return await leavePolicyRuleRepository.delete(leavePolicyRuleId, companyId);
    }
}

module.exports = new LeavePolicyRuleService();
