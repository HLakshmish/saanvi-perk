const leaveRequestRepository = require("./leaveRequest.repository");
const compOffAssignService = require("../COMP-OFF/compOffAssign/compOffAssign.service");
const prisma = require("../../config/prisma");

class LeaveRequestService {
    async createLeaveRequest(data) {
        if (data.isCompOff) {
            // 1. Fetch user comp-off balance and validation
            const compOffDetails = await compOffAssignService.getUserCompOffDetails(data.companyId, data.userId);
            const availableCompOff = compOffDetails.remainingCompOffDays ?? compOffDetails.totalCompOffDays ?? 0;

            if (availableCompOff < Number(data.numberOfDays)) {
                throw new Error(`Insufficient comp-off days. Available: ${availableCompOff}, Requested: ${data.numberOfDays}`);
            }

            // 2. Map comp-off leaveTypeId if not explicitly provided
            if (!data.leaveTypeId) {
                const compOffAssign = await prisma.compOffAssign.findFirst({
                    where: { userId: data.userId, companyId: data.companyId, status: true },
                    include: { policy: true },
                    orderBy: { id: 'desc' }
                });
                if (compOffAssign && compOffAssign.policy && compOffAssign.policy.leaveTypeId) {
                    data.leaveTypeId = compOffAssign.policy.leaveTypeId;
                } else {
                    const fallbackLeaveType = await prisma.leaveType.findFirst({
                        where: { companyId: data.companyId }
                    });
                    if (!fallbackLeaveType) throw new Error("Leave type not found");
                    data.leaveTypeId = fallbackLeaveType.leaveTypeId;
                }
            }
        }

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

    async getAllLeaveRequests(companyId, userId, isCompOff) {
        const requests = await leaveRequestRepository.getAllLeaveRequests(companyId, userId, isCompOff);
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
