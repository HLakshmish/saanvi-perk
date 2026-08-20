const superAdminController = require("./superAdmin.controller");
const { getSuperAdminDetailsSchema } = require("./superAdmin.schema");

async function superAdminRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.get("/", opts(getSuperAdminDetailsSchema), superAdminController.getSuperAdminDetails.bind(superAdminController));
}

module.exports = superAdminRoutes;
