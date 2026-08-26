const attendanceRequestRepository = require("./attendanceRequest.repository");
const attendanceRepository = require("../attendance.repository");

class AttendanceRequestService {
    async createRequest(data) {
        if (data.shiftDate) data.shiftDate = new Date(data.shiftDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        return await attendanceRequestRepository.createRequest(data);
    }

    async mapSuperAdminApprovers(requests) {
        const prisma = require("../../config/prisma");
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
                const updateData = {};
                if (req.checkInTime) updateData.checkInTime = req.checkInTime;
                if (req.checkOutTime) updateData.checkOutTime = req.checkOutTime;
                
                await attendanceService.updateAttendance(existingAttendance.attendanceId, updateData);
            } else {
                await attendanceService.createAttendance({
                    companyId: req.companyId,
                    userId: req.userId,
                    attendanceDate: req.shiftDate,
                    checkInTime: req.checkInTime,
                    checkOutTime: req.checkOutTime,
                    remarks: req.remarks
                });
            }
        }

        return await this.mapSuperAdminApprovers(updatedReq);
    }
}

module.exports = new AttendanceRequestService();
