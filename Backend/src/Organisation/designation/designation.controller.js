const designationService = require("./designation.service");

class DesignationController {
    async createDesignation(request, reply) {
        try {
            const data = {
                ...request.body,
                companyId: request.user.companyId,
                createdBy: request.user.userId
            };
            const designation = await designationService.createDesignation(data);
            reply.code(201).send({ success: true, message: "Designation created successfully", data: designation });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getDesignationById(request, reply) {
        try {
            const { id } = request.params;
            const designation = await designationService.getDesignationById(Number(id));
            if (designation.companyId !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only access designations of your own company" });
            }
            reply.code(200).send({ success: true, data: designation });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllDesignations(request, reply) {
        try {
            const query = { ...request.query, companyId: request.user.companyId };
            const designations = await designationService.getAllDesignations(query);
            reply.code(200).send({ success: true, data: designations });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateDesignation(request, reply) {
        try {
            const { id } = request.params;
            const designation = await designationService.getDesignationById(Number(id));
            if (designation.companyId !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only update designations of your own company" });
            }
            const updatedDesignation = await designationService.updateDesignation(Number(id), request.body);
            reply.code(200).send({ success: true, message: "Designation updated successfully", data: updatedDesignation });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteDesignation(request, reply) {
        try {
            const { id } = request.params;
            const designation = await designationService.getDesignationById(Number(id));
            if (designation.companyId !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only delete designations of your own company" });
            }
            await designationService.deleteDesignation(Number(id));
            reply.code(200).send({ success: true, message: "Designation deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new DesignationController();
