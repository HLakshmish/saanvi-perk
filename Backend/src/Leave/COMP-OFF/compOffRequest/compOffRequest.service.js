const repository = require("./compOffRequest.repository");
const prisma = require("../../../config/prisma");
const attendanceService = require("../../../Attendance/attendance.service");
const attendanceRepository = require("../../../Attendance/attendance.repository");

class CompOffRequestService {
    async createRequest(data) {
        const { companyId, userId, workDate, reason } = data;
        if (!companyId || !userId || !workDate || !reason) {
            throw new Error("companyId, userId, workDate, and reason are required.");
        }

        const dateObj = attendanceRepository.normalizeDate(workDate);

        // 1. Fetch user to check active status and reporting manager
        const user = await prisma.user.findFirst({
            where: { userId: Number(userId), companyId: Number(companyId) }
        });
        if (!user) throw new Error("Employee not found.");

        // 2. Fetch user's assigned comp-off policy
        const compOffAssign = await prisma.compOffAssign.findFirst({
            where: {
                userId: Number(userId),
                companyId: Number(companyId),
                status: true
            },
            include: { policy: true },
            orderBy: { id: 'desc' }
        });

        if (!compOffAssign || !compOffAssign.policy || !compOffAssign.policy.status) {
            throw new Error("No active Comp-Off policy assigned to this employee.");
        }

        const policy = compOffAssign.policy;

        // 3. Verify date is a Holiday or Week-off
        const holidays = await prisma.holiday.findMany({
            where: { companyId: Number(companyId), status: true }
        });

        const weekOffAssigns = await prisma.weekOffAssign.findMany({
            where: { userId: Number(userId), companyId: Number(companyId), status: true },
            include: { weekOff: { include: { rules: true } } }
        });

        let isHoliday = false;
        let holidayName = "";
        const matchedHoliday = holidays.find(h => {
            if (h.holidayType === 'WEEK_OFF') return false;
            const start = attendanceRepository.normalizeDate(h.startDate);
            const end = attendanceRepository.normalizeDate(h.endDate || h.startDate);
            end.setUTCHours(23, 59, 59, 999);
            return dateObj >= start && dateObj <= end;
        });

        if (matchedHoliday) {
            isHoliday = true;
            holidayName = matchedHoliday.holidayName;
        }

        const isWeekOff = attendanceService.isUserWeekOff(dateObj, Number(userId), weekOffAssigns);

        if (!isHoliday && !isWeekOff) {
            throw new Error("Comp-Off work permission can only be requested for a Holiday or a Week-Off date.");
        }

        // Check if policy allows holiday/week-off comp-off
        if (isHoliday && !policy.holidayWorked) {
            throw new Error("The assigned Comp-Off policy does not allow comp-off for working on holidays.");
        }
        if (isWeekOff && !policy.weekOffWorked) {
            throw new Error("The assigned Comp-Off policy does not allow comp-off for working on week-offs.");
        }

        // 4. Check if request already exists for this date
        const existingReq = await repository.findByUserAndDate(companyId, userId, dateObj);
        if (existingReq) {
            if (existingReq.status === 'PENDING') {
                throw new Error("A comp-off work permission request is already pending for this date.");
            }
            if (existingReq.status === 'APPROVED') {
                throw new Error("A comp-off work permission request is already approved for this date.");
            }
            // If rejected or cancelled, delete existing or allow re-applying
            if (existingReq.status === 'REJECTED' || existingReq.status === 'CANCELLED') {
                await repository.delete(existingReq.id, companyId);
            }
        }

        const requestType = isHoliday ? 'HOLIDAY' : 'WEEK_OFF';
        const holidayOrWeekOffName = isHoliday ? holidayName : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        return await repository.create({
            companyId: Number(companyId),
            userId: Number(userId),
            workDate: dateObj,
            requestType,
            holidayOrWeekOffName,
            reason: reason.trim(),
            status: 'PENDING',
            reportingToId: user.reportingToId || null
        });
    }

    async mapSuperAdminApprovers(requests, companyId) {
        let superAdmins = {};

        const mapRequest = async (req) => {
            const compId = req.companyId || companyId;
            if ((req.status === 'APPROVED' || req.status === 'REJECTED') && !req.approvedUser && compId) {
                if (!superAdmins[compId]) {
                    superAdmins[compId] = await prisma.superAdmin.findUnique({ where: { companyId: compId } });
                }
                const superAdmin = superAdmins[compId];
                if (superAdmin) {
                    req.approvedUser = {
                        userId: superAdmin.superAdminId,
                        firstName: superAdmin.firstName,
                        lastName: superAdmin.lastName
                    };
                    if (!req.approvedBy) req.approvedBy = superAdmin.superAdminId;
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

    async getById(id, companyId) {
        const req = await repository.getById(id, companyId);
        if (!req) throw new Error("Comp-Off Request not found.");
        return await this.mapSuperAdminApprovers(req, companyId);
    }

    async getAll(companyId, query = {}) {
        const requests = await repository.getAll(companyId, query);
        return await this.mapSuperAdminApprovers(requests, companyId);
    }

    async updateStatus(id, companyId, statusData, currentUserId) {
        const existing = await repository.getById(id, companyId);
        if (!existing) throw new Error("Comp-Off Request not found.");
        if (existing.status !== 'PENDING') {
            throw new Error(`Cannot update status. Request is already ${existing.status.toLowerCase()}.`);
        }

        const newStatus = (statusData.status || '').toUpperCase();
        if (newStatus !== 'APPROVED' && newStatus !== 'REJECTED' && newStatus !== 'CANCELLED') {
            throw new Error("Invalid status. Must be APPROVED, REJECTED, or CANCELLED.");
        }

        const updated = await repository.update(id, companyId, {
            status: newStatus,
            approvedBy: currentUserId || null,
            approvedAt: newStatus === 'APPROVED' || newStatus === 'REJECTED' ? new Date() : null,
            rejectionReason: statusData.rejectionReason || null,
            remarks: statusData.remarks || null
        });

        return await this.mapSuperAdminApprovers(updated, companyId);
    }

    async delete(id, companyId) {
        return await repository.delete(id, companyId);
    }
}

module.exports = new CompOffRequestService();
