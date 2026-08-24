const controller = require("./weekOff.controller");
const schema = require("./weekOff.schema");
const requirePermission = require("../../middleware/checkPermission");

async function routes(fastify, options) {
    const opts = (s, permissionCode) => ({
        schema: s,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(schema.createWeekOffSchema, 'MANAGE_WEEK_OFFS'), controller.createWeekOff.bind(controller));
    fastify.get("/", opts(schema.basicSchema, 'VIEW_WEEK_OFFS'), controller.getAllWeekOffs.bind(controller));
    fastify.get("/:id", opts(schema.basicSchema, 'VIEW_WEEK_OFFS'), controller.getWeekOffById.bind(controller));
    fastify.put("/:id", opts(schema.createWeekOffSchema, 'MANAGE_WEEK_OFFS'), controller.updateWeekOff.bind(controller));
    fastify.delete("/:id", opts(schema.basicSchema, 'MANAGE_WEEK_OFFS'), controller.deleteWeekOff.bind(controller));

    fastify.post("/assign", opts(schema.assignWeekOffSchema, 'MANAGE_WEEK_OFFS'), controller.assignWeekOff.bind(controller));
    fastify.get("/assign", opts(schema.basicSchema, 'VIEW_WEEK_OFFS'), controller.getAssignedWeekOffs.bind(controller));
}

module.exports = routes;
