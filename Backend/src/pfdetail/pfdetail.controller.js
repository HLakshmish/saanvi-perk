const pfDetailService = require("./pfdetail.service");

class PFDetailController {

    async createPFDetail(request, reply) {
        try {
            const pfDetail = await pfDetailService.createPFDetail(request.body);

            reply.code(201).send({
                success: true,
                message: "PF details created successfully",
                data: pfDetail
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getPFDetailById(request, reply) {
        try {
            const { id } = request.params;

            const pfDetail = await pfDetailService.getPFDetailById(Number(id));

            reply.code(200).send({
                success: true,
                data: pfDetail
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllPFDetails(request, reply) {
        try {
            const pfDetails = await pfDetailService.getAllPFDetails(request.query);

            reply.code(200).send({
                success: true,
                data: pfDetails
            });
        } catch (error) {
            reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }

    async updatePFDetail(request, reply) {
        try {
            const { id } = request.params;

            const pfDetail = await pfDetailService.updatePFDetail(
                Number(id),
                request.body
            );

            reply.code(200).send({
                success: true,
                message: "PF details updated successfully",
                data: pfDetail
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deletePFDetail(request, reply) {
        try {
            const { id } = request.params;

            await pfDetailService.deletePFDetail(Number(id));

            reply.code(200).send({
                success: true,
                message: "PF details deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new PFDetailController();
