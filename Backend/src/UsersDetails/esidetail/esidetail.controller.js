const esiDetailService = require("./esidetail.service");

class ESIDetailController {

    async createESIDetail(request, reply) {
        try {
            const esiDetail = await esiDetailService.createESIDetail(request.body);

            reply.code(201).send({
                success: true,
                message: "ESI details created successfully",
                data: esiDetail
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getESIDetailById(request, reply) {
        try {
            const { id } = request.params;

            const esiDetail = await esiDetailService.getESIDetailById(Number(id));

            reply.code(200).send({
                success: true,
                data: esiDetail
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllESIDetails(request, reply) {
        try {
            const esiDetails = await esiDetailService.getAllESIDetails(request.query);

            reply.code(200).send({
                success: true,
                data: esiDetails
            });
        } catch (error) {
            reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }

    async updateESIDetail(request, reply) {
        try {
            const { id } = request.params;

            const esiDetail = await esiDetailService.updateESIDetail(
                Number(id),
                request.body
            );

            reply.code(200).send({
                success: true,
                message: "ESI details updated successfully",
                data: esiDetail
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteESIDetail(request, reply) {
        try {
            const { id } = request.params;

            await esiDetailService.deleteESIDetail(Number(id));

            reply.code(200).send({
                success: true,
                message: "ESI details deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new ESIDetailController();
