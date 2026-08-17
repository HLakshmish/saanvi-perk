const leavePolicyRuleController = require("./leavePolicyRule.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createSchema, 
    getByIdSchema, 
    getAllSchema, 
    updateSchema, 
    deleteSchema 
} = require("./leavePolicyRule.schema");

async function leavePolicyRuleRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(createSchema, 'MANAGE_LEAVE_POLICY_RULES'), leavePolicyRuleController.create.bind(leavePolicyRuleController));
    fastify.get("/:id", opts(getByIdSchema, 'MANAGE_LEAVE_POLICY_RULES'), leavePolicyRuleController.getById.bind(leavePolicyRuleController));
    fastify.get("/", opts(getAllSchema, 'MANAGE_LEAVE_POLICY_RULES'), leavePolicyRuleController.getAll.bind(leavePolicyRuleController));
    fastify.put("/:id", opts(updateSchema, 'MANAGE_LEAVE_POLICY_RULES'), leavePolicyRuleController.update.bind(leavePolicyRuleController));
    fastify.delete("/:id", opts(deleteSchema, 'MANAGE_LEAVE_POLICY_RULES'), leavePolicyRuleController.delete.bind(leavePolicyRuleController));
}

module.exports = leavePolicyRuleRoutes;
