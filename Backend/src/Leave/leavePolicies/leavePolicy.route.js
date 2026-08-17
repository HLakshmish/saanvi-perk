const leavePolicyController = require("./leavePolicy.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createSchema, 
    getByIdSchema, 
    getAllSchema, 
    updateSchema, 
    deleteSchema 
} = require("./leavePolicy.schema");

async function leavePolicyRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(createSchema, 'MANAGE_LEAVE_POLICIES'), leavePolicyController.create.bind(leavePolicyController));
    fastify.get("/:id", opts(getByIdSchema, 'MANAGE_LEAVE_POLICIES'), leavePolicyController.getById.bind(leavePolicyController));
    fastify.get("/", opts(getAllSchema, 'MANAGE_LEAVE_POLICIES'), leavePolicyController.getAll.bind(leavePolicyController));
    fastify.put("/:id", opts(updateSchema, 'MANAGE_LEAVE_POLICIES'), leavePolicyController.update.bind(leavePolicyController));
    fastify.delete("/:id", opts(deleteSchema, 'MANAGE_LEAVE_POLICIES'), leavePolicyController.delete.bind(leavePolicyController));
}

module.exports = leavePolicyRoutes;
