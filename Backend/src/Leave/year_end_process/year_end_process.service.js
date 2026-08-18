const repository = require("./year_end_process.repository");

class YearEndProcessService {
    async create(data) {
        try {
            return await repository.create(data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: User, Company, LeaveType, or LeavePolicy does not exist.");
            }
            throw error;
        }
    }

    async getById(id, companyId) {
        const record = await repository.getById(id, companyId);
        if (!record) throw new Error("Year End Process not found");
        return record;
    }

    async getAll(companyId, filters) {
        return await repository.getAll(companyId, filters);
    }

    async update(id, companyId, data) {
        try {
            return await repository.update(id, companyId, data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: User, Company, LeaveType, or LeavePolicy does not exist.");
            }
            throw error;
        }
    }

    async delete(id, companyId) {
        return await repository.delete(id, companyId);
    }
}

module.exports = new YearEndProcessService();
