const attendanceService = require("./attendance.service");

class AttendanceController {
    async createAttendance(request, reply) {
        try {
            const data = { ...request.body, companyId: request.user.companyId };
            const attendance = await attendanceService.createAttendance(data);
            reply.code(201).send({ success: true, message: "Attendance record created", data: attendance });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    async getAttendanceById(request, reply) {
        try {
            const attendance = await attendanceService.getAttendanceById(Number(request.params.id));
            if (attendance.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            reply.code(200).send({ success: true, data: attendance });
        } catch (error) { reply.code(404).send({ success: false, message: error.message }); }
    }
    async getAllAttendances(request, reply) {
        try {
            const query = { ...request.query, companyId: request.user.companyId };
            const attendances = await attendanceService.getAllAttendances(query);
            reply.code(200).send({ success: true, data: attendances });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }
    async updateAttendance(request, reply) {
        try {
            const attendance = await attendanceService.getAttendanceById(Number(request.params.id));
            if (attendance.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            const updated = await attendanceService.updateAttendance(Number(request.params.id), request.body);
            reply.code(200).send({ success: true, message: "Attendance record updated", data: updated });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    async deleteAttendance(request, reply) {
        try {
            const attendance = await attendanceService.getAttendanceById(Number(request.params.id));
            if (attendance.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            await attendanceService.deleteAttendance(Number(request.params.id));
            reply.code(200).send({ success: true, message: "Attendance record deleted" });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    async downloadReport(request, reply) {
        try {
            const query = { ...request.query, companyId: request.user.companyId };
            const attendances = await attendanceService.getAllAttendances(query);
            
            const headers = ['Attendance ID', 'User ID', 'Date', 'Status', 'Check In Time', 'Check Out Time', 'Working Minutes', 'Overtime Minutes', 'Remarks'];
            
            const csvRows = attendances.map(a => [
                a.attendanceId,
                a.userId,
                a.attendanceDate ? new Date(a.attendanceDate).toISOString().split('T')[0] : '',
                a.attendanceStatus || '',
                a.checkInTime ? new Date(a.checkInTime).toISOString() : '',
                a.checkOutTime ? new Date(a.checkOutTime).toISOString() : '',
                a.workingMinutes || 0,
                a.overtimeMinutes || 0,
                `"${(a.remarks || '').replace(/"/g, '""')}"`
            ]);

            const csvString = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
            
            reply.header('Content-Type', 'text/csv');
            reply.header('Content-Disposition', 'attachment; filename="attendance_report.csv"');
            return reply.send(csvString);
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }

    async viewReport(request, reply) {
        try {
            const query = { ...request.query, companyId: request.user.companyId };
            const attendances = await attendanceService.getAllAttendances(query);
            reply.code(200).send({ success: true, data: attendances });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }
}
module.exports = new AttendanceController();
