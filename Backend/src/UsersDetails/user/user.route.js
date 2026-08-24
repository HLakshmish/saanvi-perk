const userController = require("./user.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createUserSchema, 
    getUserByIdSchema, 
    getAllUsersSchema, 
    updateUserSchema, 
    deleteUserSchema,
    getEventsSchema,
    downloadReportSchema,
    viewReportSchema
} = require("./user.schema");

async function userRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.get("/report/view", opts(viewReportSchema, 'VIEW_USERS'), userController.viewReport.bind(userController));
    fastify.get("/report/download", opts(downloadReportSchema, 'VIEW_USERS'), userController.downloadReport.bind(userController));
    fastify.post("/", opts(createUserSchema, 'MANAGE_USERS'), userController.createUser.bind(userController));
    fastify.get("/events", opts(getEventsSchema, 'VIEW_USERS'), userController.getEvents.bind(userController));
    fastify.get("/:id", opts(getUserByIdSchema, 'VIEW_USERS'), userController.getUserById.bind(userController));
    fastify.get("/", opts(getAllUsersSchema, 'VIEW_USERS'), userController.getAllUsers.bind(userController));
    fastify.put("/:id", opts(updateUserSchema, 'MANAGE_USERS'), userController.updateUser.bind(userController));
    fastify.delete("/:id", opts(deleteUserSchema, 'MANAGE_USERS'), userController.deleteUser.bind(userController));
}

module.exports = userRoutes;
