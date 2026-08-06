const addressInfoService = require("./addressinfo.service");

class AddressInfoController {

    async createAddressInfo(request, reply) {
        try {
            const addressInfo = await addressInfoService.createAddressInfo(request.body);

            reply.code(201).send({
                success: true,
                message: "Address information created successfully",
                data: addressInfo
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAddressInfoByUserId(request, reply) {
        try {
            const { userId } = request.params;

            const addressInfo = await addressInfoService.getAddressInfoByUserId(
                Number(userId)
            );

            reply.code(200).send({
                success: true,
                data: addressInfo
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllAddressInfo(request, reply) {
        try {
            const addressInfo = await addressInfoService.getAllAddressInfo(
                request.query
            );

            reply.code(200).send({
                success: true,
                data: addressInfo
            });
        } catch (error) {
            reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }

    async updateAddressInfo(request, reply) {
        try {
            const { userId, addressType } = request.params;

            const addressInfo = await addressInfoService.updateAddressInfo(
                Number(userId),
                addressType,
                request.body
            );

            reply.code(200).send({
                success: true,
                message: "Address information updated successfully",
                data: addressInfo
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteAddressInfo(request, reply) {
        try {
            const { userId, addressType } = request.params;

            await addressInfoService.deleteAddressInfo(
                Number(userId),
                addressType
            );

            reply.code(200).send({
                success: true,
                message: "Address information deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new AddressInfoController();