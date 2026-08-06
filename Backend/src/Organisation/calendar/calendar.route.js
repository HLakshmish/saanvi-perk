const controller = require("./calendar.controller");
const schema = require("./calendar.schema");

async function routes(fastify, options) {
    const opts = (s) => ({ schema: s, preValidation: [fastify.authenticate] });
    fastify.post("/", opts(schema.createSchema), controller.createCalendar.bind(controller));
    fastify.get("/:id", opts(schema.getByIdSchema), controller.getCalendarById.bind(controller));
    fastify.get("/", opts(schema.getAllSchema), controller.getAllCalendars.bind(controller));
    fastify.put("/:id", opts(schema.updateSchema), controller.updateCalendar.bind(controller));
    fastify.delete("/:id", opts(schema.deleteSchema), controller.deleteCalendar.bind(controller));
}
module.exports = routes;
