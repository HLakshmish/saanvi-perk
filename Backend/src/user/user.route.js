const userController = require("./user.controller");
const requirePermission = require("../middleware/checkPermission");
const { 
    createUserSchema, 
    getUserByIdSchema, 
    getAllUsersSchema, 
    updateUserSchema, 
    deleteUserSchema 
} = require("./user.schema");

async function userRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(createUserSchema, 'MANAGE_USERS'), userController.createUser.bind(userController));
    fastify.get("/:id", opts(getUserByIdSchema, 'VIEW_USERS'), userController.getUserById.bind(userController));
    fastify.get("/", opts(getAllUsersSchema, 'VIEW_USERS'), userController.getAllUsers.bind(userController));
    fastify.put("/:id", opts(updateUserSchema, 'MANAGE_USERS'), userController.updateUser.bind(userController));
    fastify.delete("/:id", opts(deleteUserSchema, 'MANAGE_USERS'), userController.deleteUser.bind(userController));
}

module.exports = userRoutes;
