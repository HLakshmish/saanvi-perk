const leaveRequestRepository = require("./leaveRequest.repository");
const compOffAssignService = require("../COMP-OFF/compOffAssign/compOffAssign.service");
const prisma = require("../../config/prisma");

class LeaveRequestService {
    async validateAndApplyLeavePolicy(data) {
        const companyId = Number(data.companyId);
        const userId = Number(data.userId);
        const leaveTypeId = Number(data.leaveTypeId);
        const fromDateObj = new Date(data.fromDate);
        const numDays = Number(data.numberOfDays);
        const isCompOff = Boolean(data.isCompOff);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. COMP-OFF VALIDATION & ENFORCEMENT
        if (isCompOff) {
            // Fetch user comp-off balance and validation
            const compOffDetails = await compOffAssignService.getUserCompOffDetails(companyId, userId);
            const availableCompOff = compOffDetails.remainingCompOffDays ?? compOffDetails.totalCompOffDays ?? 0;

            if (availableCompOff < numDays) {
                throw new Error(`Insufficient comp-off days. Available: ${availableCompOff}, Requested: ${numDays}`);
            }

            // Map comp-off leaveTypeId if not explicitly provided
            if (!data.leaveTypeId) {
                const compOffAssign = await prisma.compOffAssign.findFirst({
                    where: { userId, companyId, status: true },
                    include: { policy: true },
                    orderBy: { id: 'desc' }
                });
                if (compOffAssign && compOffAssign.policy && compOffAssign.policy.leaveTypeId) {
                    data.leaveTypeId = compOffAssign.policy.leaveTypeId;
                } else {
                    const fallbackLeaveType = await prisma.leaveType.findFirst({
                        where: { companyId }
                    });
                    if (!fallbackLeaveType) throw new Error("Leave type not found");
                    data.leaveTypeId = fallbackLeaveType.leaveTypeId;
                }
            }

            // Fetch assigned CompOffPolicy for limits validation
            const compOffAssign = await prisma.compOffAssign.findFirst({
                where: { userId, companyId, status: true },
                include: { policy: true },
                orderBy: { id: 'desc' }
            });

            if (compOffAssign && compOffAssign.policy) {
                const policy = compOffAssign.policy;

                // Monthly Request Limit for Comp-Off
                if (policy.maxRequestsPerMonth && policy.maxRequestsPerMonth > 0) {
                    const monthStart = new Date(fromDateObj.getFullYear(), fromDateObj.getMonth(), 1);
                    const monthEnd = new Date(fromDateObj.getFullYear(), fromDateObj.getMonth() + 1, 0, 23, 59, 59);

                    const existingMonthReqs = await prisma.leaveRequest.count({
                        where: {
                            userId,
                            companyId,
                            isCompOff: true,
                            status: { in: ['PENDING', 'APPROVED'] },
                            fromDate: { gte: monthStart, lte: monthEnd }
                        }
                    });

                    if (existingMonthReqs >= policy.maxRequestsPerMonth) {
                        throw new Error(`Comp-off policy limit reached: Maximum ${policy.maxRequestsPerMonth} comp-off request(s) allowed per month.`);
                    }
                }

                // Yearly Request Limit for Comp-Off
                if (policy.maxRequestsPerYear && policy.maxRequestsPerYear > 0) {
                    const yearStart = new Date(fromDateObj.getFullYear(), 0, 1);
                    const yearEnd = new Date(fromDateObj.getFullYear(), 11, 31, 23, 59, 59);

                    const existingYearReqs = await prisma.leaveRequest.count({
                        where: {
                            userId,
                            companyId,
                            isCompOff: true,
                            status: { in: ['PENDING', 'APPROVED'] },
                            fromDate: { gte: yearStart, lte: yearEnd }
                        }
                    });

                    if (existingYearReqs >= policy.maxRequestsPerYear) {
                        throw new Error(`Comp-off policy limit reached: Maximum ${policy.maxRequestsPerYear} comp-off request(s) allowed per year.`);
                    }
                }
            }
            return;
        }

        // 2. STANDARD LEAVE POLICY VALIDATION
        if (leaveTypeId) {
            const userAllocations = await prisma.leaveAccumulation.findMany({
                where: { userId, companyId, leaveTypeId, status: true },
                include: { leavePolicy: true }
            });

            let activePolicyId = userAllocations.find(a => a.leavePolicyId)?.leavePolicyId || null;
            if (!activePolicyId) {
                const companyPolicy = await prisma.leavePolicy.findFirst({
                    where: { companyId, status: true },
                    orderBy: { leavePolicyId: 'desc' }
                });
                if (companyPolicy) activePolicyId = companyPolicy.leavePolicyId;
            }

            if (activePolicyId) {
                const rule = await prisma.leavePolicyRule.findFirst({
                    where: { leavePolicyId: activePolicyId, leaveTypeId, status: true }
                });

                const accumulationSetting = await prisma.leavePolicyAccumulation.findFirst({
                    where: { leavePolicyId: activePolicyId, leaveTypeId, status: true }
                });

                if (rule) {
                    // Min Leave Days Per Request
                    if (rule.minLeaveDays !== null && Number(rule.minLeaveDays) > 0) {
                        if (numDays < Number(rule.minLeaveDays)) {
                            throw new Error(`Policy violation: Minimum leave duration per request for this leave type is ${rule.minLeaveDays} day(s).`);
                        }
                    }

                    // Max Leave Days Per Request
                    if (rule.maxLeaveDays !== null && Number(rule.maxLeaveDays) > 0) {
                        if (numDays > Number(rule.maxLeaveDays)) {
                            throw new Error(`Policy violation: Maximum leave duration per request for this leave type is ${rule.maxLeaveDays} day(s).`);
                        }
                    }

                    // Advance Notice Lead Time (requestSubmissionDays)
                    if (rule.requestSubmissionDays !== null && Number(rule.requestSubmissionDays) > 0) {
                        const leadMs = fromDateObj.getTime() - today.getTime();
                        const leadDays = Math.ceil(leadMs / (1000 * 60 * 60 * 24));
                        if (leadDays < Number(rule.requestSubmissionDays)) {
                            throw new Error(`Policy violation: Leave must be requested at least ${rule.requestSubmissionDays} day(s) in advance.`);
                        }
                    }

                    // Annual Request Limit (Total Days in Current Year)
                    if (rule.annualRequestLimit !== null && Number(rule.annualRequestLimit) > 0) {
                        const yearStart = new Date(fromDateObj.getFullYear(), 0, 1);
                        const yearEnd = new Date(fromDateObj.getFullYear(), 11, 31, 23, 59, 59);

                        const existingYearRequests = await prisma.leaveRequest.findMany({
                            where: {
                                userId,
                                companyId,
                                leaveTypeId,
                                status: { in: ['PENDING', 'APPROVED'] },
                                fromDate: { gte: yearStart, lte: yearEnd }
                            }
                        });

                        const totalYearDaysUsed = existingYearRequests.reduce((sum, r) => sum + (Number(r.numberOfDays) || 0), 0);
                        if ((totalYearDaysUsed + numDays) > Number(rule.annualRequestLimit)) {
                            throw new Error(`Policy violation: Annual limit for this leave type is ${rule.annualRequestLimit} day(s). You have already taken/requested ${totalYearDaysUsed} day(s).`);
                        }
                    }
                }

                // Leave Balance Enforcement
                if (userAllocations.length > 0) {
                    const totalAllocated = userAllocations.reduce((sum, a) => sum + (Number(a.numberOfLeaves) || 0), 0);
                    
                    const allUsedRequests = await prisma.leaveRequest.findMany({
                        where: {
                            userId,
                            companyId,
                            leaveTypeId,
                            status: { in: ['PENDING', 'APPROVED'] }
                        }
                    });
                    const totalUsed = allUsedRequests.reduce((sum, r) => sum + (Number(r.numberOfDays) || 0), 0);
                    const currentBalance = totalAllocated - totalUsed;
                    const maxNegative = accumulationSetting?.maxNegativeBalance ? Number(accumulationSetting.maxNegativeBalance) : 0;

                    if ((currentBalance - numDays) < -maxNegative) {
                        const maxAllowed = Math.max(0, currentBalance + maxNegative);
                        throw new Error(`Insufficient leave balance. Available balance: ${currentBalance > 0 ? currentBalance : 0} day(s) (Maximum requestable: ${maxAllowed} day(s)).`);
                    }
                }
            }
        }
    }

    async createLeaveRequest(data) {
        await this.validateAndApplyLeavePolicy(data);
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
