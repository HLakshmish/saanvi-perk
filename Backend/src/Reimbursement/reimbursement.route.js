const reimbursementController = require("./reimbursement.controller");
const requirePermission = require("../middleware/checkPermission");
const {
    createClaimSchema,
    getClaimByIdSchema,
    getAllClaimsSchema,
    updateClaimSchema,
    updateClaimStatusSchema,
    deleteClaimSchema,
    uploadBillSchema,
    downloadBillSchema,
    deleteBillSchema,
    getClaimHistorySchema
} = require("./reimbursement.schema");

async function reimbursementRoutes(fastify, options) {
    const opts = (schema, permissionCode) => {
        const preValidation = [fastify.authenticate];
        if (permissionCode) {
            preValidation.push(requirePermission(permissionCode));
        }
        return { schema, preValidation };
    };

    fastify.post("/", opts(createClaimSchema, 'APPLY_REIMBURSEMENT'), reimbursementController.createClaim.bind(reimbursementController));
    
    fastify.get("/:id", opts(getClaimByIdSchema, 'VIEW_REIMBURSEMENT'), reimbursementController.getClaimById.bind(reimbursementController));
    
    fastify.get("/:id/history", opts(getClaimHistorySchema, 'VIEW_REIMBURSEMENT'), reimbursementController.getClaimHistory.bind(reimbursementController));
    
    fastify.get("/", opts(getAllClaimsSchema, 'VIEW_REIMBURSEMENT'), reimbursementController.getAllClaims.bind(reimbursementController));
    
    fastify.put("/:id", opts(updateClaimSchema, 'APPLY_REIMBURSEMENT'), reimbursementController.updateClaim.bind(reimbursementController));
    
    fastify.put("/:id/status", opts(updateClaimStatusSchema, 'MANAGE_REIMBURSEMENTS'), reimbursementController.updateClaimStatus.bind(reimbursementController));
    
    fastify.delete("/:id", opts(deleteClaimSchema, 'MANAGE_REIMBURSEMENTS'), reimbursementController.deleteClaim.bind(reimbursementController));
    
    fastify.post(
        "/bills",
        {
            schema: uploadBillSchema,
            preValidation: [fastify.authenticate],
            validatorCompiler: ({ schema, method, url, httpPart }) => {
                if (httpPart === 'body') {
                    return () => true;
                }
                const compiler = fastify.validatorCompiler;
                return compiler ? compiler({ schema, method, url, httpPart }) : () => true;
            }
        },
        reimbursementController.uploadBill.bind(reimbursementController)
    );

    fastify.get("/bills/:id/download", opts(downloadBillSchema), reimbursementController.downloadBill.bind(reimbursementController));
    
    fastify.delete("/bills/:id", opts(deleteBillSchema), reimbursementController.deleteBill.bind(reimbursementController));
}

module.exports = reimbursementRoutes;
