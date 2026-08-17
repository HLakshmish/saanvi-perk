const leavePolicyRuleService = require("./leavePolicyRule.service");

class LeavePolicyRuleController {
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

            const result = await leavePolicyRuleService.create(data, targetCompanyId);
            reply.code(201).send({ success: true, message: "LeavePolicyRule created successfully", data: result });
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

            const result = await leavePolicyRuleService.getById(Number(id), companyId);
            reply.code(200).send({ success: true, data: result });
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

            const results = await leavePolicyRuleService.getAll(companyId);
            reply.code(200).send({ success: true, data: results });
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
            }

            const result = await leavePolicyRuleService.update(Number(id), targetCompanyId, data);
            reply.code(200).send({ success: true, message: "LeavePolicyRule updated successfully", data: result });
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
            }

            await leavePolicyRuleService.delete(Number(id), companyId);
            reply.code(200).send({ success: true, message: "LeavePolicyRule deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new LeavePolicyRuleController();
