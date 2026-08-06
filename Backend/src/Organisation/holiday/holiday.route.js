const controller = require("./holiday.controller");
const schema = require("./holiday.schema");

async function routes(fastify, options) {
    const opts = (s) => ({ schema: s, preValidation: [fastify.authenticate] });
    fastify.post("/", opts(schema.createSchema), controller.createHoliday.bind(controller));
    fastify.get("/:id", opts(schema.getByIdSchema), controller.getHolidayById.bind(controller));
    fastify.get("/", opts(schema.getAllSchema), controller.getAllHolidays.bind(controller));
    fastify.put("/:id", opts(schema.updateSchema), controller.updateHoliday.bind(controller));
    fastify.delete("/:id", opts(schema.deleteSchema), controller.deleteHoliday.bind(controller));
}
module.exports = routes;
