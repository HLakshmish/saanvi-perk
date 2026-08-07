const leaveRequestRepository = require("./leaveRequest.repository");

class LeaveRequestService {
    async createLeaveRequest(data) {
        return await leaveRequestRepository.createLeaveRequest(data);
    }

    async getLeaveRequestById(leaveRequestId, companyId) {
        const leaveRequest = await leaveRequestRepository.getLeaveRequestById(leaveRequestId, companyId);
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        return leaveRequest;
    }

    async getAllLeaveRequests(companyId, userId) {
        return await leaveRequestRepository.getAllLeaveRequests(companyId, userId);
    }

    async updateLeaveRequestStatus(leaveRequestId, companyId, statusData) {
        return await leaveRequestRepository.updateLeaveRequestStatus(leaveRequestId, companyId, statusData);
    }

    async deleteLeaveRequest(leaveRequestId, companyId) {
        return await leaveRequestRepository.deleteLeaveRequest(leaveRequestId, companyId);
    }
}

module.exports = new LeaveRequestService();
