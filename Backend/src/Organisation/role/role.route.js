const roleController = require("./role.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createRoleSchema, 
    getRoleByIdSchema, 
    getAllRolesSchema, 
    updateRoleSchema, 
    deleteRoleSchema 
} = require("./role.schema");

async function roleRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(createRoleSchema, 'MANAGE_ROLES'), roleController.createRole.bind(roleController));
    fastify.get("/:id", opts(getRoleByIdSchema, 'VIEW_ROLES'), roleController.getRoleById.bind(roleController));
    fastify.get("/", opts(getAllRolesSchema, 'VIEW_ROLES'), roleController.getAllRoles.bind(roleController));
    fastify.put("/:id", opts(updateRoleSchema, 'MANAGE_ROLES'), roleController.updateRole.bind(roleController));
    fastify.delete("/:id", opts(deleteRoleSchema, 'MANAGE_ROLES'), roleController.deleteRole.bind(roleController));
}

module.exports = roleRoutes;
