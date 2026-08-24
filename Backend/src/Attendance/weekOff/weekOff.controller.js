const weekOffService = require("./weekOff.service");

class WeekOffController {
    async createWeekOff(request, reply) {
        try {
            const data = { ...request.body, companyId: request.user.companyId };
            data.createdBy = (request.user.role === 'SUPERADMIN' || request.user.role === 'OWNER') ? null : request.user.userId;
            
            if (request.user.role === 'OWNER' && request.body.companyId) {
                data.companyId = request.body.companyId;
            }
            const weekOff = await weekOffService.createWeekOff(data);
            reply.code(201).send({ success: true, message: "Week-Off created successfully", data: weekOff });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    
    async getAllWeekOffs(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }
            const weekOffs = await weekOffService.getAllWeekOffs(companyId);
            reply.code(200).send({ success: true, data: weekOffs });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }

    async getWeekOffById(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }
            const weekOff = await weekOffService.getWeekOffById(Number(request.params.id), companyId);
            reply.code(200).send({ success: true, data: weekOff });
        } catch (error) { reply.code(404).send({ success: false, message: error.message }); }
    }

    async updateWeekOff(request, reply) {
        try {
            const data = { ...request.body };
            data.updatedBy = (request.user.role === 'SUPERADMIN' || request.user.role === 'OWNER') ? null : request.user.userId;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.body.companyId) {
                companyId = request.body.companyId;
            }
            const weekOff = await weekOffService.updateWeekOff(Number(request.params.id), companyId, data);
            reply.code(200).send({ success: true, message: "Week-Off updated successfully", data: weekOff });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async deleteWeekOff(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }
            await weekOffService.deleteWeekOff(Number(request.params.id), companyId);
            reply.code(200).send({ success: true, message: "Week-Off deleted successfully" });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async assignWeekOff(request, reply) {
        try {
            const data = { ...request.body, companyId: request.user.companyId };
            data.createdBy = (request.user.role === 'SUPERADMIN' || request.user.role === 'OWNER') ? null : request.user.userId;
            
            if (request.user.role === 'OWNER' && request.body.companyId) {
                data.companyId = request.body.companyId;
            }
            if (data.startDate) data.startDate = new Date(data.startDate);
            if (data.endDate) data.endDate = new Date(data.endDate);
            
            const assignment = await weekOffService.assignWeekOff(data);
            reply.code(201).send({ success: true, message: "Week-Off assigned successfully", data: assignment });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async getAssignedWeekOffs(request, reply) {
        try {
            let companyId = request.user.companyId;
            let userId = request.query.userId ? Number(request.query.userId) : undefined;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            } else if (request.user.role === 'USER') {
                userId = request.user.userId;
            }
            const assignments = await weekOffService.getAssignedWeekOffs(companyId, userId);
            reply.code(200).send({ success: true, data: assignments });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }
}

module.exports = new WeekOffController();
