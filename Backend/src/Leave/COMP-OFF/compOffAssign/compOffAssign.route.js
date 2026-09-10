const controller = require("./compOffAssign.controller");
const schema = require("./compOffAssign.schema");

async function compOffAssignRoutes(fastify, options) {
    fastify.addHook("preValidation", fastify.authenticate);

    // Specific endpoints registered before parametric /:id route
    fastify.get("/user-details", { schema: schema.getUserCompOffDetailsSchema }, controller.getUserCompOffDetails);
    fastify.get("/admin/all-employees-summary", { schema: schema.getAdminCompOffOverviewSchema }, controller.getAdminCompOffOverview);

    fastify.post("/", { schema: schema.createCompOffAssignSchema }, controller.create);
    fastify.get("/:id", { schema: schema.getCompOffAssignByIdSchema }, controller.getById);
    fastify.get("/", { schema: schema.getAllCompOffAssignsSchema }, controller.getAll);
    fastify.put("/:id", { schema: schema.updateCompOffAssignSchema }, controller.update);
    fastify.delete("/:id", { schema: schema.deleteCompOffAssignSchema }, controller.delete);
}

module.exports = compOffAssignRoutes;
