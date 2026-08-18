const controller = require("./compOffPolicy.controller");
const schema = require("./compOffPolicy.schema");

async function compOffPolicyRoutes(fastify, options) {
    fastify.addHook("preValidation", fastify.authenticate);

    fastify.post("/", { schema: schema.createCompOffPolicySchema }, controller.create);
    fastify.get("/:id", { schema: schema.getCompOffPolicyByIdSchema }, controller.getById);
    fastify.get("/", { schema: schema.getAllCompOffPoliciesSchema }, controller.getAll);
    fastify.put("/:id", { schema: schema.updateCompOffPolicySchema }, controller.update);
    fastify.delete("/:id", { schema: schema.deleteCompOffPolicySchema }, controller.delete);
}

module.exports = compOffPolicyRoutes;
