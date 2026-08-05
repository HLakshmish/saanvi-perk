const insuranceDetailService = require("./insurancedetail.service");

class InsuranceDetailController {

    async createInsuranceDetail(request, reply) {
        try {
            const insuranceDetail = await insuranceDetailService.createInsuranceDetail(request.body);

            reply.code(201).send({
                success: true,
                message: "Insurance details created successfully",
                data: insuranceDetail
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getInsuranceDetailById(request, reply) {
        try {
            const { id } = request.params;

            const insuranceDetail = await insuranceDetailService.getInsuranceDetailById(Number(id));

            reply.code(200).send({
                success: true,
                data: insuranceDetail
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllInsuranceDetails(request, reply) {
        try {
            const insuranceDetails = await insuranceDetailService.getAllInsuranceDetails(request.query);

            reply.code(200).send({
                success: true,
                data: insuranceDetails
            });
        } catch (error) {
            reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }

    async updateInsuranceDetail(request, reply) {
        try {
            const { id } = request.params;

            const insuranceDetail = await insuranceDetailService.updateInsuranceDetail(
                Number(id),
                request.body
            );

            reply.code(200).send({
                success: true,
                message: "Insurance details updated successfully",
                data: insuranceDetail
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteInsuranceDetail(request, reply) {
        try {
            const { id } = request.params;

            await insuranceDetailService.deleteInsuranceDetail(Number(id));

            reply.code(200).send({
                success: true,
                message: "Insurance details deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new InsuranceDetailController();
