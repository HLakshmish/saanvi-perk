const controller = require("./leave_accumulation.controller");
const schema = require("./leave_accumulation.schema");

async function leaveAccumulationRoutes(fastify, options) {
    fastify.addHook("preValidation", fastify.authenticate);

    fastify.post("/", { schema: schema.createLeaveAccumulationSchema }, controller.create);
    fastify.get("/:id", { schema: schema.getLeaveAccumulationByIdSchema }, controller.getById);
    fastify.get("/", { schema: schema.getAllLeaveAccumulationsSchema }, controller.getAll);
    fastify.put("/:id", { schema: schema.updateLeaveAccumulationSchema }, controller.update);
    fastify.delete("/:id", { schema: schema.deleteLeaveAccumulationSchema }, controller.delete);
}

module.exports = leaveAccumulationRoutes;
