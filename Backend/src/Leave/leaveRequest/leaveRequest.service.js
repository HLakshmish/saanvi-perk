const leaveRequestRepository = require("./leaveRequest.repository");
const compOffAssignService = require("../COMP-OFF/compOffAssign/compOffAssign.service");
const prisma = require("../../config/prisma");

class LeaveRequestService {
    async calculateEmployeeLeaveBalance(companyId, userId, leaveTypeId, isCompOff) {
        if (!leaveTypeId) return 0;

        if (isCompOff) {
            try {
                const compOffDetails = await compOffAssignService.getUserCompOffDetails(companyId, userId);
                return Number(compOffDetails.remainingCompOffDays ?? compOffDetails.totalCompOffDays ?? 0);
            } catch (err) {
                return 0;
            }
        }

        const userAllocations = await prisma.leaveAccumulation.findMany({
            where: { userId, companyId, leaveTypeId, status: true }
        });

        let totalAllocated = userAllocations.reduce((sum, a) => sum + (Number(a.numberOfLeaves) || 0), 0);

        if (userAllocations.length === 0) {
            const rule = await prisma.leavePolicyRule.findFirst({
                where: { leaveTypeId, status: true }
            });
            const acc = await prisma.leavePolicyAccumulation.findFirst({
                where: { leaveTypeId, status: true }
            });

            if (rule && rule.annualRequestLimit !== null) {
                totalAllocated = Number(rule.annualRequestLimit);
            } else if (acc && acc.maxAccumulationPerYear !== null) {
                totalAllocated = Number(acc.maxAccumulationPerYear);
            } else if (acc && acc.maxLeaveBalance !== null) {
                totalAllocated = Number(acc.maxLeaveBalance);
            } else {
                const lt = await prisma.leaveType.findFirst({ where: { leaveTypeId } });
                if (lt) {
                    const code = (lt.leaveCode || "").toUpperCase();
                    const name = (lt.leaveName || "").toLowerCase();
                    if (code.includes("SL") || code.includes("CL") || name.includes("sick") || name.includes("casual")) {
                        totalAllocated = 12.0;
                    }
                }
            }
        }

        const approvedRequests = await prisma.leaveRequest.findMany({
            where: {
                userId,
                companyId,
                leaveTypeId,
                status: 'APPROVED'
            }
        });

        const totalUsed = approvedRequests.reduce((sum, r) => sum + (Number(r.numberOfDays) || 0), 0);
        return totalAllocated - totalUsed;
    }

    async validateAndApplyLeavePolicy(data) {
        const companyId = Number(data.companyId);
        const userId = Number(data.userId);
        const leaveTypeId = Number(data.leaveTypeId);
        const fromDateObj = new Date(data.fromDate);
        const numDays = Number(data.numberOfDays);
        const isCompOff = Boolean(data.isCompOff);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Probation Validation: Employees in probation period cannot apply for EL (Earned Leave)
        if (leaveTypeId) {
            const leaveType = await prisma.leaveType.findFirst({
                where: { leaveTypeId, companyId }
            });

            if (leaveType) {
                const codeUpper = (leaveType.leaveCode || "").toUpperCase();
                const nameLower = (leaveType.leaveName || "").toLowerCase();
                const isEarnedLeave = codeUpper === "EL" || nameLower.includes("earned");

                if (isEarnedLeave) {
                    const user = await prisma.user.findFirst({
                        where: { userId, companyId }
                    });

                    if (user) {
                        const effectiveProbationEnd = user.extendedProbationPeriod || user.probationEndDate;
                        if (effectiveProbationEnd) {
                            const todayStart = new Date();
                            todayStart.setHours(0, 0, 0, 0);

                            const probEnd = new Date(effectiveProbationEnd);
                            probEnd.setHours(23, 59, 59, 999);

                            if (todayStart <= probEnd) {
                                throw new Error("Employees currently in probation period are not allowed to apply for Earned Leave (EL).");
                            }
                        }
                    }
                }
            }
        }

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

                if (rule) {
                    // Min Leave Days Per Request
                    if (rule.minLeaveDays !== null && Number(rule.minLeaveDays) > 0) {
                        if (numDays < Number(rule.minLeaveDays)) {
                            throw new Error(`Policy violation: Minimum leave duration per request for this leave type is ${rule.minLeaveDays} day(s).`);
                        }
                    }

                    // Max Leave Days Per Month Limit
                    if (rule.maxLeaveDays !== null && Number(rule.maxLeaveDays) > 0) {
                        const monthStart = new Date(fromDateObj.getFullYear(), fromDateObj.getMonth(), 1);
                        const monthEnd = new Date(fromDateObj.getFullYear(), fromDateObj.getMonth() + 1, 0, 23, 59, 59);

                        const existingMonthRequests = await prisma.leaveRequest.findMany({
                            where: {
                                userId,
                                companyId,
                                leaveTypeId,
                                status: { in: ['PENDING', 'APPROVED'] },
                                fromDate: { gte: monthStart, lte: monthEnd }
                            }
                        });

                        const totalMonthDaysUsed = existingMonthRequests.reduce((sum, r) => sum + (Number(r.numberOfDays) || 0), 0);
                        if ((totalMonthDaysUsed + numDays) > Number(rule.maxLeaveDays)) {
                            throw new Error(`Policy violation: Maximum allowed leave limit for this month is ${rule.maxLeaveDays} day(s). You have already taken/requested ${totalMonthDaysUsed} day(s) this month.`);
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

                // Note: Balance is allowed to become negative even when available balance is 0 or less.
                // Leave request is not blocked solely due to 0 or negative balance.
            }
        }
    }

    async createLeaveRequest(data) {
        await this.validateAndApplyLeavePolicy(data);
        const created = await leaveRequestRepository.createLeaveRequest(data);
        return await this.mapSuperAdminApprovers(created, created.companyId);
    }

    async mapSuperAdminApprovers(requests, companyId) {
        const prisma = require("../../config/prisma");
        let superAdmin = null;

        const mapRequest = async (req) => {
            if (!req) return req;
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

            // Calculate and attach employee's actual leave balance & balance after approval
            if (req.userId && req.leaveTypeId) {
                try {
                    const balance = await this.calculateEmployeeLeaveBalance(
                        req.companyId || companyId,
                        req.userId,
                        req.leaveTypeId,
                        req.isCompOff
                    );
                    req.employeeLeaveBalance = balance;
                    req.balanceAfterApproval = balance - Number(req.numberOfDays || 0);
                } catch (e) {
                    req.employeeLeaveBalance = 0;
                    req.balanceAfterApproval = 0 - Number(req.numberOfDays || 0);
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

