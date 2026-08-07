const leaveTypeRepository = require("./leaveType.repository");

class LeaveTypeService {
    async createLeaveType(data) {
        try {
            return await leaveTypeRepository.createLeaveType(data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("Leave type with this code already exists in this company.");
            }
            throw error;
        }
    }

    async getLeaveTypeById(leaveTypeId, companyId) {
        const leaveType = await leaveTypeRepository.getLeaveTypeById(leaveTypeId, companyId);
        if (!leaveType) {
            throw new Error("Leave type not found");
        }
        return leaveType;
    }

    async getAllLeaveTypes(companyId) {
        return await leaveTypeRepository.getAllLeaveTypes(companyId);
    }

    async updateLeaveType(leaveTypeId, companyId, data) {
        try {
            return await leaveTypeRepository.updateLeaveType(leaveTypeId, companyId, data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("Leave type with this code already exists in this company.");
            }
            throw error;
        }
    }

    async deleteLeaveType(leaveTypeId, companyId) {
        return await leaveTypeRepository.deleteLeaveType(leaveTypeId, companyId);
    }
}

module.exports = new LeaveTypeService();
