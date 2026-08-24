const controller = require("./attendance.controller");
const schema = require("./attendance.schema");

async function routes(fastify, options) {
    const opts = (s) => ({ schema: s, preValidation: [fastify.authenticate] });
    fastify.get("/report/view", opts(schema.viewReportSchema), controller.viewReport.bind(controller));
    fastify.get("/report/download", opts(schema.downloadReportSchema), controller.downloadReport.bind(controller));
    fastify.post("/", opts(schema.createSchema), controller.createAttendance.bind(controller));
    fastify.get("/:id", opts(schema.getByIdSchema), controller.getAttendanceById.bind(controller));
    fastify.get("/", opts(schema.getAllSchema), controller.getAllAttendances.bind(controller));
    fastify.put("/:id", opts(schema.updateSchema), controller.updateAttendance.bind(controller));
    fastify.delete("/:id", opts(schema.deleteSchema), controller.deleteAttendance.bind(controller));
}
module.exports = routes;
