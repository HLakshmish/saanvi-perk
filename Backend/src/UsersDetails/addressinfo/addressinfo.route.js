const addressInfoController = require("./addressinfo.controller");
const {
    createAddressInfoSchema,
    updateAddressInfoSchema,
    getAddressInfoByUserIdSchema,
    getAllAddressInfoSchema,
    deleteAddressInfoSchema
} = require("./addressinfo.schema");

async function addressInfoRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    // Create Address
    fastify.post(
        "/",
        opts(createAddressInfoSchema),
        addressInfoController.createAddressInfo.bind(addressInfoController)
    );

    // Get Address by User ID
    fastify.get(
        "/user/:userId",
        opts(getAddressInfoByUserIdSchema),
        addressInfoController.getAddressInfoByUserId.bind(addressInfoController)
    );

    // Get All Addresses
    fastify.get(
        "/",
        opts(getAllAddressInfoSchema),
        addressInfoController.getAllAddressInfo.bind(addressInfoController)
    );

    fastify.put(
    "/user/:userId/:addressType",
    opts(updateAddressInfoSchema),
    addressInfoController.updateAddressInfo.bind(addressInfoController)
);

fastify.delete(
    "/user/:userId/:addressType",
    opts(deleteAddressInfoSchema),
    addressInfoController.deleteAddressInfo.bind(addressInfoController)
);
}

module.exports = addressInfoRoutes;