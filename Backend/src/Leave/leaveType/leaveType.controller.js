const leaveTypeService = require("./leaveType.service");

class LeaveTypeController {
    async createLeaveType(request, reply) {
        try {
            const { companyId, ...leaveTypeData } = request.body;
            
            // Determine the target company ID
            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                if (!companyId) throw new Error("OWNER must provide a companyId to create a leave type.");
                targetCompanyId = companyId;
            } else if (request.user.role === 'SUPERADMIN' || request.user.role === 'USER') {
                targetCompanyId = request.user.companyId;
            } else {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to create leave types." });
            }

            leaveTypeData.companyId = targetCompanyId;
            leaveTypeData.createdBy = (request.user.role === 'SUPERADMIN' || request.user.role === 'OWNER') ? null : request.user.userId;

            const leaveType = await leaveTypeService.createLeaveType(leaveTypeData);
            reply.code(201).send({ success: true, message: "Leave type created successfully", data: leaveType });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getLeaveTypeById(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const leaveType = await leaveTypeService.getLeaveTypeById(Number(id), companyId);
            reply.code(200).send({ success: true, data: leaveType });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllLeaveTypes(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const leaveTypes = await leaveTypeService.getAllLeaveTypes(companyId);
            reply.code(200).send({ success: true, data: leaveTypes });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateLeaveType(request, reply) {
        try {
            const { id } = request.params;
            const { companyId, ...data } = request.body;

            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                targetCompanyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to update leave types." });
            }

            const leaveType = await leaveTypeService.updateLeaveType(Number(id), targetCompanyId, data);
            reply.code(200).send({ success: true, message: "Leave type updated successfully", data: leaveType });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteLeaveType(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to delete leave types." });
            }

            await leaveTypeService.deleteLeaveType(Number(id), companyId);
            reply.code(200).send({ success: true, message: "Leave type deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new LeaveTypeController();
