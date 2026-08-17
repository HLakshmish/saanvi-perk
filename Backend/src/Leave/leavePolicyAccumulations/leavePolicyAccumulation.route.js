const leavePolicyAccumulationController = require("./leavePolicyAccumulation.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createSchema, 
    getByIdSchema, 
    getAllSchema, 
    updateSchema, 
    deleteSchema 
} = require("./leavePolicyAccumulation.schema");

async function leavePolicyAccumulationRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(createSchema, 'MANAGE_LEAVE_POLICY_ACCUMULATIONS'), leavePolicyAccumulationController.create.bind(leavePolicyAccumulationController));
    fastify.get("/:id", opts(getByIdSchema, 'MANAGE_LEAVE_POLICY_ACCUMULATIONS'), leavePolicyAccumulationController.getById.bind(leavePolicyAccumulationController));
    fastify.get("/", opts(getAllSchema, 'MANAGE_LEAVE_POLICY_ACCUMULATIONS'), leavePolicyAccumulationController.getAll.bind(leavePolicyAccumulationController));
    fastify.put("/:id", opts(updateSchema, 'MANAGE_LEAVE_POLICY_ACCUMULATIONS'), leavePolicyAccumulationController.update.bind(leavePolicyAccumulationController));
    fastify.delete("/:id", opts(deleteSchema, 'MANAGE_LEAVE_POLICY_ACCUMULATIONS'), leavePolicyAccumulationController.delete.bind(leavePolicyAccumulationController));
}

module.exports = leavePolicyAccumulationRoutes;
