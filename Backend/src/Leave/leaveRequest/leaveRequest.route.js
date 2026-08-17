const leaveRequestController = require("./leaveRequest.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createLeaveRequestSchema, 
    getLeaveRequestByIdSchema, 
    getAllLeaveRequestsSchema, 
    updateLeaveRequestStatusSchema, 
    deleteLeaveRequestSchema 
} = require("./leaveRequest.schema");

async function leaveRequestRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    // APPLY_LEAVE is a typical permission for applying
    fastify.post("/", opts(createLeaveRequestSchema, 'APPLY_LEAVE'), leaveRequestController.createLeaveRequest.bind(leaveRequestController));
    
    // VIEW_LEAVES or VIEW_OWN_LEAVE (checked in controller)
    fastify.get("/:id", opts(getLeaveRequestByIdSchema, 'VIEW_LEAVES'), leaveRequestController.getLeaveRequestById.bind(leaveRequestController));
    fastify.get("/", opts(getAllLeaveRequestsSchema, 'VIEW_LEAVES'), leaveRequestController.getAllLeaveRequests.bind(leaveRequestController));
    
    // MANAGE_LEAVES typically for HR/Managers to approve/reject
    fastify.put("/:id/status", opts(updateLeaveRequestStatusSchema, 'MANAGE_LEAVES'), leaveRequestController.updateLeaveRequestStatus.bind(leaveRequestController));
    
    // Deletion might be restricted
    fastify.delete("/:id", opts(deleteLeaveRequestSchema, 'MANAGE_LEAVES'), leaveRequestController.deleteLeaveRequest.bind(leaveRequestController));
}

module.exports = leaveRequestRoutes;
