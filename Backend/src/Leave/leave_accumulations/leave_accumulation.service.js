const repository = require("./leave_accumulation.repository");

class LeaveAccumulationService {
    async create(data) {
        try {
            // Ensure dates are parsed to DateTime objects if they are strings
            if (data.accumulationDate) data.accumulationDate = new Date(data.accumulationDate);
            if (data.accumulationPeriodFrom) data.accumulationPeriodFrom = new Date(data.accumulationPeriodFrom);
            if (data.accumulationPeriodTo) data.accumulationPeriodTo = new Date(data.accumulationPeriodTo);
            if (data.availabilityPeriodFrom) data.availabilityPeriodFrom = new Date(data.availabilityPeriodFrom);
            if (data.availabilityPeriodTo) data.availabilityPeriodTo = new Date(data.availabilityPeriodTo);
            
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
        if (!record) throw new Error("Leave Accumulation not found");
        return record;
    }

    async getAll(companyId, filters) {
        return await repository.getAll(companyId, filters);
    }

    async update(id, companyId, data) {
        try {
            if (data.accumulationDate) data.accumulationDate = new Date(data.accumulationDate);
            if (data.accumulationPeriodFrom) data.accumulationPeriodFrom = new Date(data.accumulationPeriodFrom);
            if (data.accumulationPeriodTo) data.accumulationPeriodTo = new Date(data.accumulationPeriodTo);
            if (data.availabilityPeriodFrom) data.availabilityPeriodFrom = new Date(data.availabilityPeriodFrom);
            if (data.availabilityPeriodTo) data.availabilityPeriodTo = new Date(data.availabilityPeriodTo);
            
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

module.exports = new LeaveAccumulationService();
