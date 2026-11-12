const controller = require("./attendanceRequest.controller");
const schema = require("./attendanceRequest.schema");

async function routes(fastify, options) {
    fastify.addHook("preValidation", fastify.authenticate);

    fastify.post("/", { schema: schema.createRequestSchema }, controller.createRequest.bind(controller));
    fastify.get("/", { schema: schema.getAllSchema }, controller.getAllRequests.bind(controller));
    fastify.put("/:id/status", { schema: schema.updateStatusSchema }, controller.updateRequestStatus.bind(controller));
    fastify.delete("/:id", { schema: schema.deleteRequestSchema }, controller.deleteRequest.bind(controller));
}

module.exports = routes;
