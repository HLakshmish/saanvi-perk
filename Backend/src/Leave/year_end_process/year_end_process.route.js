const controller = require("./year_end_process.controller");
const schema = require("./year_end_process.schema");

async function yearEndProcessRoutes(fastify, options) {
    fastify.addHook("preValidation", fastify.authenticate);

    fastify.post("/", { schema: schema.createYearEndProcessSchema }, controller.create);
    fastify.get("/:id", { schema: schema.getYearEndProcessByIdSchema }, controller.getById);
    fastify.get("/", { schema: schema.getAllYearEndProcessesSchema }, controller.getAll);
    fastify.put("/:id", { schema: schema.updateYearEndProcessSchema }, controller.update);
    fastify.delete("/:id", { schema: schema.deleteYearEndProcessSchema }, controller.delete);
}

module.exports = yearEndProcessRoutes;
