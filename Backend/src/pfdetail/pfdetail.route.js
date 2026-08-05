const pfDetailController = require("./pfdetail.controller");
const {
    createPFDetailSchema,
    updatePFDetailSchema,
    getPFDetailByIdSchema,
    getAllPFDetailsSchema,
    deletePFDetailSchema
} = require("./pfdetail.schema");

async function pfDetailRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post(
        "/",
        opts(createPFDetailSchema),
        pfDetailController.createPFDetail.bind(pfDetailController)
    );

    fastify.get(
        "/:id",
        opts(getPFDetailByIdSchema),
        pfDetailController.getPFDetailById.bind(pfDetailController)
    );

    fastify.get(
        "/",
        opts(getAllPFDetailsSchema),
        pfDetailController.getAllPFDetails.bind(pfDetailController)
    );

    fastify.put(
        "/:id",
        opts(updatePFDetailSchema),
        pfDetailController.updatePFDetail.bind(pfDetailController)
    );

    fastify.delete(
        "/:id",
        opts(deletePFDetailSchema),
        pfDetailController.deletePFDetail.bind(pfDetailController)
    );
}

module.exports = pfDetailRoutes;
