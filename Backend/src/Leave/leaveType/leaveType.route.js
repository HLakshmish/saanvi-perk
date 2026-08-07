const leaveTypeController = require("./leaveType.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createLeaveTypeSchema, 
    getLeaveTypeByIdSchema, 
    getAllLeaveTypesSchema, 
    updateLeaveTypeSchema, 
    deleteLeaveTypeSchema 
} = require("./leaveType.schema");

async function leaveTypeRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    fastify.post("/", opts(createLeaveTypeSchema, 'MANAGE_LEAVE_TYPES'), leaveTypeController.createLeaveType.bind(leaveTypeController));
    fastify.get("/:id", opts(getLeaveTypeByIdSchema, 'VIEW_LEAVE_TYPES'), leaveTypeController.getLeaveTypeById.bind(leaveTypeController));
    fastify.get("/", opts(getAllLeaveTypesSchema, 'VIEW_LEAVE_TYPES'), leaveTypeController.getAllLeaveTypes.bind(leaveTypeController));
    fastify.put("/:id", opts(updateLeaveTypeSchema, 'MANAGE_LEAVE_TYPES'), leaveTypeController.updateLeaveType.bind(leaveTypeController));
    fastify.delete("/:id", opts(deleteLeaveTypeSchema, 'MANAGE_LEAVE_TYPES'), leaveTypeController.deleteLeaveType.bind(leaveTypeController));
}

module.exports = leaveTypeRoutes;
