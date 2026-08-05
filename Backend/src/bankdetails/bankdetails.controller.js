const bankDetailsService = require("./bankdetails.service");

class BankDetailsController {

    async createBankDetails(request, reply) {
        try {
            const bankDetails = await bankDetailsService.createBankDetails(request.body);

            reply.code(201).send({
                success: true,
                message: "Bank details created successfully",
                data: bankDetails
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getBankDetailsById(request, reply) {
        try {
            const { id } = request.params;

            const bankDetails = await bankDetailsService.getBankDetailsById(Number(id));

            reply.code(200).send({
                success: true,
                data: bankDetails
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllBankDetails(request, reply) {
        try {
            const bankDetails = await bankDetailsService.getAllBankDetails(request.query);

            reply.code(200).send({
                success: true,
                data: bankDetails
            });
        } catch (error) {
            reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }

    async updateBankDetails(request, reply) {
        try {
            const { id } = request.params;

            const bankDetails = await bankDetailsService.updateBankDetails(
                Number(id),
                request.body
            );

            reply.code(200).send({
                success: true,
                message: "Bank details updated successfully",
                data: bankDetails
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteBankDetails(request, reply) {
        try {
            const { id } = request.params;

            await bankDetailsService.deleteBankDetails(Number(id));

            reply.code(200).send({
                success: true,
                message: "Bank details deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new BankDetailsController();
