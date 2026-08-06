const bankDetailsController = require("./bankdetails.controller");
const {
    createBankDetailsSchema,
    updateBankDetailsSchema,
    getBankDetailsByIdSchema,
    getAllBankDetailsSchema,
    deleteBankDetailsSchema
} = require("./bankdetails.schema");

async function bankDetailsRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post(
        "/",
        opts(createBankDetailsSchema),
        bankDetailsController.createBankDetails.bind(bankDetailsController)
    );

    fastify.get(
        "/:id",
        opts(getBankDetailsByIdSchema),
        bankDetailsController.getBankDetailsById.bind(bankDetailsController)
    );

    fastify.get(
        "/",
        opts(getAllBankDetailsSchema),
        bankDetailsController.getAllBankDetails.bind(bankDetailsController)
    );

    fastify.put(
        "/:id",
        opts(updateBankDetailsSchema),
        bankDetailsController.updateBankDetails.bind(bankDetailsController)
    );

    fastify.delete(
        "/:id",
        opts(deleteBankDetailsSchema),
        bankDetailsController.deleteBankDetails.bind(bankDetailsController)
    );
}

module.exports = bankDetailsRoutes;
