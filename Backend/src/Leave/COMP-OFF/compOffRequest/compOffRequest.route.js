const controller = require("./compOffRequest.controller");
const schema = require("./compOffRequest.schema");

async function compOffRequestRoutes(fastify, options) {
    fastify.addHook("preValidation", fastify.authenticate);

    fastify.post("/", { schema: schema.createCompOffRequestSchema }, controller.create);
    fastify.get("/", { schema: schema.getAllCompOffRequestsSchema }, controller.getAll);
    fastify.get("/:id", { schema: schema.getCompOffRequestByIdSchema }, controller.getById);
    fastify.put("/:id/status", { schema: schema.updateCompOffRequestStatusSchema }, controller.updateStatus);
    fastify.delete("/:id", { schema: schema.deleteCompOffRequestSchema }, controller.delete);
}

module.exports = compOffRequestRoutes;
