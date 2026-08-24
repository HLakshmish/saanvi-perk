const attendanceRequestRepository = require("./attendanceRequest.repository");
const attendanceRepository = require("../attendance.repository");

class AttendanceRequestService {
    async createRequest(data) {
        if (data.shiftDate) data.shiftDate = new Date(data.shiftDate);
        if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
        if (data.checkOutTime) data.checkOutTime = new Date(data.checkOutTime);

        return await attendanceRequestRepository.createRequest(data);
    }

    async getRequestById(id) {
        const req = await attendanceRequestRepository.getRequestById(id);
        if (!req) throw new Error("Attendance Request not found");
        return req;
    }

    async getAllRequests(query) {
        return await attendanceRequestRepository.getAllRequests(query);
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
            const existingAttendance = await attendanceRepository.getAttendanceByUserAndDate(req.companyId, req.userId, req.shiftDate);
            
            if (existingAttendance) {
                const updateData = {};
                if (req.checkInTime) updateData.checkInTime = req.checkInTime;
                if (req.checkOutTime) updateData.checkOutTime = req.checkOutTime;
                updateData.attendanceStatus = 'PRESENT';
                
                await attendanceRepository.updateAttendance(existingAttendance.attendanceId, updateData);
            } else {
                await attendanceRepository.createAttendance({
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

        return updatedReq;
    }
}

module.exports = new AttendanceRequestService();
