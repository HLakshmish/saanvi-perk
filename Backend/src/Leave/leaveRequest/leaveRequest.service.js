const leaveRequestRepository = require("./leaveRequest.repository");

class LeaveRequestService {
    async createLeaveRequest(data) {
        return await leaveRequestRepository.createLeaveRequest(data);
    }

    async mapSuperAdminApprovers(requests, companyId) {
        const prisma = require("../../config/prisma");
        let superAdmin = null;

        const mapRequest = async (req) => {
            if ((req.status === 'APPROVED' || req.status === 'REJECTED') && !req.approvedBy && req.companyId) {
                if (!superAdmin) {
                    superAdmin = await prisma.superAdmin.findUnique({ where: { companyId: req.companyId } });
                }
                if (superAdmin) {
                    req.approvedUser = {
                        userId: superAdmin.superAdminId,
                        firstName: superAdmin.firstName,
                        lastName: superAdmin.lastName
                    };
                    req.approvedBy = superAdmin.superAdminId;
                }
            }
            return req;
        };

        if (Array.isArray(requests)) {
            for (let req of requests) {
                await mapRequest(req);
            }
        } else if (requests) {
            await mapRequest(requests);
        }

        return requests;
    }

    async getLeaveRequestById(leaveRequestId, companyId) {
        const leaveRequest = await leaveRequestRepository.getLeaveRequestById(leaveRequestId, companyId);
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        return await this.mapSuperAdminApprovers(leaveRequest, leaveRequest.companyId);
    }

    async getAllLeaveRequests(companyId, userId) {
        const requests = await leaveRequestRepository.getAllLeaveRequests(companyId, userId);
        return await this.mapSuperAdminApprovers(requests, companyId);
    }

    async updateLeaveRequestStatus(leaveRequestId, companyId, statusData) {
        const updated = await leaveRequestRepository.updateLeaveRequestStatus(leaveRequestId, companyId, statusData);
        return await this.mapSuperAdminApprovers(updated, companyId);
    }

    async deleteLeaveRequest(leaveRequestId, companyId) {
        return await leaveRequestRepository.deleteLeaveRequest(leaveRequestId, companyId);
    }
}

module.exports = new LeaveRequestService();
