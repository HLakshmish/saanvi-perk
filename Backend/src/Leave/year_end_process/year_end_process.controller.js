const service = require("./year_end_process.service");

class YearEndProcessController {
    async create(request, reply) {
        try {
            const { companyId, ...data } = request.body;
            
            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                if (!companyId) throw new Error("OWNER must provide a companyId.");
                targetCompanyId = companyId;
            } else if (request.user.role === 'SUPERADMIN' || request.user.role === 'USER') {
                targetCompanyId = request.user.companyId;
            } else {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            data.companyId = targetCompanyId;
            data.processedBy = request.user.role === 'USER' ? request.user.userId : null;

            const record = await service.create(data);
            reply.code(201).send({ success: true, message: "Year End Process created successfully", data: record });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getById(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const record = await service.getById(Number(id), companyId);
            reply.code(200).send({ success: true, data: record });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAll(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const filters = {
                userId: request.query.userId ? Number(request.query.userId) : undefined,
                year: request.query.year ? Number(request.query.year) : undefined
            };

            const records = await service.getAll(companyId, filters);
            reply.code(200).send({ success: true, data: records });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async update(request, reply) {
        try {
            const { id } = request.params;
            const { companyId, ...data } = request.body;

            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                targetCompanyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            const record = await service.update(Number(id), targetCompanyId, data);
            reply.code(200).send({ success: true, message: "Year End Process updated successfully", data: record });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async delete(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'USER') {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            await service.delete(Number(id), companyId);
            reply.code(200).send({ success: true, message: "Year End Process deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new YearEndProcessController();
