const esiDetailController = require("./esidetail.controller");
const {
    createESIDetailSchema,
    updateESIDetailSchema,
    getESIDetailByIdSchema,
    getAllESIDetailsSchema,
    deleteESIDetailSchema
} = require("./esidetail.schema");

async function esiDetailRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post(
        "/",
        opts(createESIDetailSchema),
        esiDetailController.createESIDetail.bind(esiDetailController)
    );

    fastify.get(
        "/:id",
        opts(getESIDetailByIdSchema),
        esiDetailController.getESIDetailById.bind(esiDetailController)
    );

    fastify.get(
        "/",
        opts(getAllESIDetailsSchema),
        esiDetailController.getAllESIDetails.bind(esiDetailController)
    );

    fastify.put(
        "/:id",
        opts(updateESIDetailSchema),
        esiDetailController.updateESIDetail.bind(esiDetailController)
    );

    fastify.delete(
        "/:id",
        opts(deleteESIDetailSchema),
        esiDetailController.deleteESIDetail.bind(esiDetailController)
    );
}

module.exports = esiDetailRoutes;
