const attendanceRequestRepository = require("./attendanceRequest.repository");
const attendanceRepository = require("../attendance.repository");
const prisma = require("../../config/prisma");

class AttendanceRequestService {
    async createRequest(data) {
        if (!data.shiftDate) throw new Error("Shift date is required");
        const shiftDate = attendanceRepository.normalizeDate(data.shiftDate);
        const now = new Date();
        const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
        
        // 1. Prevent future dates
        if (shiftDate > todayUtc) {
            throw new Error("Attendance regularization cannot be requested for future dates.");
        }
        data.shiftDate = shiftDate;

        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        // 2. Validate time consistency
        if (data.checkInTime && data.checkOutTime) {
            const isNextDay = Boolean(data.isNextDay);
            if (!isNextDay && data.checkOutTime <= data.checkInTime) {
                throw new Error("Check-out time must be after check-in time. For overnight shifts, please check 'Night Shift'.");
            }
            if (data.checkInTime.getTime() === data.checkOutTime.getTime()) {
                throw new Error("Check-in and check-out times cannot be identical.");
            }
        }

        // 3. Prevent duplicate active regularization requests for the same date
        const existingActive = await prisma.attendanceRequest.findFirst({
            where: {
                companyId: data.companyId,
                userId: data.userId,
                shiftDate: data.shiftDate,
                status: { notIn: ['REJECTED', 'CANCELLED'] }
            }
        });
        if (existingActive) {
            throw new Error("An active attendance regularization request already exists for this date.");
        }

        // 4. Prevent regularizing attendance on an approved full-day leave
        const approvedLeave = await prisma.leaveRequest.findFirst({
            where: {
                companyId: data.companyId,
                userId: data.userId,
                status: 'APPROVED',
                fromDate: { lte: data.shiftDate },
                toDate: { gte: data.shiftDate },
                numberOfDays: { gte: 1 },
                NOT: { reason: { startsWith: 'Auto-' } }
            }
        });
        if (approvedLeave) {
            throw new Error("Cannot request attendance regularization on an approved leave date.");
        }

        return await attendanceRequestRepository.createRequest(data);
    }

    async mapSuperAdminApprovers(requests) {
        let superAdmins = {};

        const mapRequest = async (req) => {
            if ((req.status === 'APPROVED' || req.status === 'REJECTED') && !req.approvedBy && req.companyId) {
                if (!superAdmins[req.companyId]) {
                    superAdmins[req.companyId] = await prisma.superAdmin.findUnique({ where: { companyId: req.companyId } });
                }
                const superAdmin = superAdmins[req.companyId];
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

    async getRequestById(id) {
        const req = await attendanceRequestRepository.getRequestById(id);
        if (!req) throw new Error("Attendance Request not found");
        return await this.mapSuperAdminApprovers(req);
    }

    async getAllRequests(query) {
        const reqs = await attendanceRequestRepository.getAllRequests(query);
        return await this.mapSuperAdminApprovers(reqs);
    }

    async updateRequestStatus(id, data) {
        const req = await this.getRequestById(id);
        if (req.status !== 'PENDING') throw new Error("Only pending requests can be updated");

        const updatedReq = await attendanceRequestRepository.updateRequest(id, {
            status: data.status,
            approvedBy: data.approvedBy,
            approvedAt: data.status === 'APPROVED' ? new Date() : null,
            rejectionReason: data.rejectionReason || null
        });

        if (data.status === 'APPROVED') {
            const attendanceService = require("../attendance.service");
            const existingAttendance = await attendanceRepository.getAttendanceByUserAndDate(req.companyId, req.userId, req.shiftDate);
            
            if (existingAttendance) {
                const updateData = {
                    attendanceStatus: 'PRESENT'
                };
                if (req.checkInTime) updateData.checkInTime = req.checkInTime;
                if (req.checkOutTime) updateData.checkOutTime = req.checkOutTime;
                if (req.remarks) updateData.remarks = req.remarks;
                
                await attendanceService.updateAttendance(existingAttendance.attendanceId, updateData);
            } else {
                await attendanceService.createAttendance({
                    companyId: req.companyId,
                    userId: req.userId,
                    attendanceDate: req.shiftDate,
                    checkInTime: req.checkInTime,
                    checkOutTime: req.checkOutTime,
                    attendanceStatus: 'PRESENT',
                    remarks: req.remarks
                });
            }
        }

        return await this.mapSuperAdminApprovers(updatedReq);
    }

    async deleteRequest(id) {
        return await attendanceRequestRepository.deleteRequest(id);
    }
}

module.exports = new AttendanceRequestService();
