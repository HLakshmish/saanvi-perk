const attendanceRequestService = require("./attendanceRequest.service");

class AttendanceRequestController {
    async createRequest(request, reply) {
        try {
            const data = { ...request.body, companyId: request.user.companyId, userId: request.user.userId };
            const req = await attendanceRequestService.createRequest(data);
            reply.code(201).send({ success: true, message: "Attendance request submitted successfully", data: req });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    
    async getAllRequests(request, reply) {
        try {
            const query = { companyId: request.user.companyId };
            
            if (request.user.role === 'USER') {
                query.userId = request.user.userId;
            } else if (request.query.userId) {
                query.userId = Number(request.query.userId);
            }
            
            if (request.query.status) {
                query.status = request.query.status;
            }
            
            const reqs = await attendanceRequestService.getAllRequests(query);
            reply.code(200).send({ success: true, data: reqs });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }

    async updateRequestStatus(request, reply) {
        try {
            const data = {
                status: request.body.status,
                rejectionReason: request.body.rejectionReason,
                approvedBy: request.user.userId
            };
            const req = await attendanceRequestService.updateRequestStatus(Number(request.params.id), data);
            reply.code(200).send({ success: true, message: "Request status updated successfully", data: req });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
}

module.exports = new AttendanceRequestController();
