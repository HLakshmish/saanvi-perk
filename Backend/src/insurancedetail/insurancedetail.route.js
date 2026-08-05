const insuranceDetailController = require("./insurancedetail.controller");
const {
    createInsuranceDetailSchema,
    updateInsuranceDetailSchema,
    getInsuranceDetailByIdSchema,
    getAllInsuranceDetailsSchema,
    deleteInsuranceDetailSchema
} = require("./insurancedetail.schema");

async function insuranceDetailRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post(
        "/",
        opts(createInsuranceDetailSchema),
        insuranceDetailController.createInsuranceDetail.bind(insuranceDetailController)
    );

    fastify.get(
        "/:id",
        opts(getInsuranceDetailByIdSchema),
        insuranceDetailController.getInsuranceDetailById.bind(insuranceDetailController)
    );

    fastify.get(
        "/",
        opts(getAllInsuranceDetailsSchema),
        insuranceDetailController.getAllInsuranceDetails.bind(insuranceDetailController)
    );

    fastify.put(
        "/:id",
        opts(updateInsuranceDetailSchema),
        insuranceDetailController.updateInsuranceDetail.bind(insuranceDetailController)
    );

    fastify.delete(
        "/:id",
        opts(deleteInsuranceDetailSchema),
        insuranceDetailController.deleteInsuranceDetail.bind(insuranceDetailController)
    );
}

module.exports = insuranceDetailRoutes;
