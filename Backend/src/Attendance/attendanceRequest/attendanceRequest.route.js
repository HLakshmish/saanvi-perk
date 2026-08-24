const controller = require("./attendanceRequest.controller");
const schema = require("./attendanceRequest.schema");
const requirePermission = require("../../middleware/checkPermission");

async function routes(fastify, options) {
    const opts = (s, permissionCode) => ({
        schema: s,
        preValidation: permissionCode 
            ? [fastify.authenticate, requirePermission(permissionCode)]
            : [fastify.authenticate]
    });

    fastify.post("/", opts(schema.createRequestSchema), controller.createRequest.bind(controller));
    fastify.get("/", opts(schema.getAllSchema, 'VIEW_ATTENDANCE_REQUESTS'), controller.getAllRequests.bind(controller));
    fastify.put("/:id/status", opts(schema.updateStatusSchema, 'MANAGE_ATTENDANCE_REQUESTS'), controller.updateRequestStatus.bind(controller));
}

module.exports = routes;
