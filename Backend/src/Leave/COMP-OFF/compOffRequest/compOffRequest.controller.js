const service = require("./compOffRequest.service");

class CompOffRequestController {
    async create(request, reply) {
        try {
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.body.companyId || companyId;
            }

            if (!companyId) {
                return reply.code(400).send({ success: false, message: "companyId is required" });
            }

            const data = {
                ...request.body,
                companyId: Number(companyId),
                userId: Number(request.body.userId || request.user?.userId)
            };

            const created = await service.createRequest(data);
            return reply.code(201).send({
                success: true,
                message: "Comp-off work permission requested successfully",
                data: created
            });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getById(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const data = await service.getById(Number(id), companyId);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAll(request, reply) {
        try {
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const query = { ...request.query };
            if (request.query.userId) query.userId = Number(request.query.userId);
            if (request.query.reportingToId) query.reportingToId = Number(request.query.reportingToId);

            const data = await service.getAll(companyId, query);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async updateStatus(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const currentUserId = request.user?.userId || request.user?.superAdminId || null;
            const updated = await service.updateStatus(Number(id), companyId, request.body, currentUserId);

            return reply.send({
                success: true,
                message: `Comp-off request ${updated.status.toLowerCase()} successfully`,
                data: updated
            });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async delete(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            await service.delete(Number(id), companyId);
            return reply.send({ success: true, message: "Comp-off request deleted successfully" });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new CompOffRequestController();
