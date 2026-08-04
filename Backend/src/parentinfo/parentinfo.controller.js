const parentInfoService = require("./parentinfo.service");

class ParentInfoController {

    async createParentInfo(request, reply) {
        try {
            const parentInfo = await parentInfoService.createParentInfo(request.body);

            reply.code(201).send({
                success: true,
                message: "Parents information created successfully",
                data: parentInfo
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getParentInfoByUserId(request, reply) {
        try {
            const { userId } = request.params;

            const parentInfo = await parentInfoService.getParentInfoByUserId(Number(userId));

            reply.code(200).send({
                success: true,
                data: parentInfo
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllParentInfo(request, reply) {
        try {
            const parentInfo = await parentInfoService.getAllParentInfo(request.query);

            reply.code(200).send({
                success: true,
                data: parentInfo
            });
        } catch (error) {
            reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }

    async updateParentInfo(request, reply) {
        try {
            const { userId } = request.params;

            const parentInfo = await parentInfoService.updateParentInfo(
                Number(userId),
                request.body
            );

            reply.code(200).send({
                success: true,
                message: "Parents information updated successfully",
                data: parentInfo
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteParentInfo(request, reply) {
        try {
            const { userId } = request.params;

            await parentInfoService.deleteParentInfo(Number(userId));

            reply.code(200).send({
                success: true,
                message: "Parents information deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new ParentInfoController();