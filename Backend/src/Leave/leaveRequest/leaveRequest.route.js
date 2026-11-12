const leaveRequestController = require("./leaveRequest.controller");
const requirePermission = require("../../middleware/checkPermission");
const { 
    createLeaveRequestSchema, 
    getLeaveRequestByIdSchema, 
    getAllLeaveRequestsSchema, 
    updateLeaveRequestStatusSchema, 
    deleteLeaveRequestSchema,
    downloadLeaveReportSchema,
    viewLeaveReportSchema
} = require("./leaveRequest.schema");

async function leaveRequestRoutes(fastify, options) {
    const opts = (schema, permissionCode) => ({
        schema,
        preValidation: [fastify.authenticate, requirePermission(permissionCode)]
    });

    // APPLY_LEAVE is a typical permission for applying
    fastify.get("/report/view", opts(viewLeaveReportSchema, 'VIEW_LEAVES'), leaveRequestController.viewReport.bind(leaveRequestController));
    fastify.get("/report/download", opts(downloadLeaveReportSchema, 'VIEW_LEAVES'), leaveRequestController.downloadReport.bind(leaveRequestController));
    fastify.post("/", opts(createLeaveRequestSchema, 'APPLY_LEAVE'), leaveRequestController.createLeaveRequest.bind(leaveRequestController));
    
    // VIEW_LEAVES or VIEW_OWN_LEAVE (checked in controller)
    fastify.get("/:id", opts(getLeaveRequestByIdSchema, 'VIEW_LEAVES'), leaveRequestController.getLeaveRequestById.bind(leaveRequestController));
    fastify.get("/", opts(getAllLeaveRequestsSchema, 'VIEW_LEAVES'), leaveRequestController.getAllLeaveRequests.bind(leaveRequestController));
    
    // Status update: Managers/HR can approve/reject; employees can cancel their own pending request
    fastify.put("/:id/status", {
        schema: updateLeaveRequestStatusSchema,
        preValidation: [fastify.authenticate]
    }, leaveRequestController.updateLeaveRequestStatus.bind(leaveRequestController));
    
    // Deletion: Managers/HR or employees cancelling their own pending request
    fastify.delete("/:id", {
        schema: deleteLeaveRequestSchema,
        preValidation: [fastify.authenticate]
    }, leaveRequestController.deleteLeaveRequest.bind(leaveRequestController));
}

module.exports = leaveRequestRoutes;
