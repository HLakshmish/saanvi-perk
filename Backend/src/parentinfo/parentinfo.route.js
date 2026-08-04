const parentInfoController = require("./parentinfo.controller");
const {
    createParentInfoSchema,
    updateParentInfoSchema,
    getParentInfoByUserIdSchema,
    getAllParentInfoSchema,
    deleteParentInfoSchema
} = require("./parentinfo.schema");

async function parentInfoRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    // Create
    fastify.post(
        "/",
        opts(createParentInfoSchema),
        parentInfoController.createParentInfo.bind(parentInfoController)
    );

    // Get by User ID
    fastify.get(
        "/user/:userId",
        opts(getParentInfoByUserIdSchema),
        parentInfoController.getParentInfoByUserId.bind(parentInfoController)
    );

    // Get All
    fastify.get(
        "/",
        opts(getAllParentInfoSchema),
        parentInfoController.getAllParentInfo.bind(parentInfoController)
    );

    // Update by User ID
    fastify.put(
        "/user/:userId",
        opts(updateParentInfoSchema),
        parentInfoController.updateParentInfo.bind(parentInfoController)
    );

    // Delete by User ID
    fastify.delete(
        "/user/:userId",
        opts(deleteParentInfoSchema),
        parentInfoController.deleteParentInfo.bind(parentInfoController)
    );
}

module.exports = parentInfoRoutes;