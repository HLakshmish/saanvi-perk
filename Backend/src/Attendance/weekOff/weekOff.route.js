const controller = require("./weekOff.controller");
const schema = require("./weekOff.schema");
const requirePermission = require("../../middleware/checkPermission");

async function routes(fastify, options) {
    const opts = (s, permissionCode) => ({
        schema: s,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(schema.createWeekOffSchema, 'MANAGE_ATTENDANCE'), controller.createWeekOff.bind(controller));
    fastify.get("/", opts(schema.basicSchema, 'VIEW_ATTENDANCE'), controller.getAllWeekOffs.bind(controller));
    fastify.get("/:id", opts(schema.basicSchema, 'VIEW_ATTENDANCE'), controller.getWeekOffById.bind(controller));
    fastify.put("/:id", opts(schema.createWeekOffSchema, 'MANAGE_ATTENDANCE'), controller.updateWeekOff.bind(controller));
    fastify.delete("/:id", opts(schema.basicSchema, 'MANAGE_ATTENDANCE'), controller.deleteWeekOff.bind(controller));

    fastify.post("/assign", opts(schema.assignWeekOffSchema, 'MANAGE_ATTENDANCE'), controller.assignWeekOff.bind(controller));
    fastify.get("/assign", opts(schema.basicSchema, 'VIEW_ATTENDANCE'), controller.getAssignedWeekOffs.bind(controller));
}

module.exports = routes;
