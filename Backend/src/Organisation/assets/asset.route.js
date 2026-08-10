const { assetController, assetAssignmentController, assetHistoryController } = require("./asset.controller");
const schema = require("./asset.schema");

async function routes(fastify, options) {
    const opts = (s) => ({ schema: s, preValidation: [fastify.authenticate] });

    // ============================
    // Asset Routes
    // ============================
    fastify.post("/", opts(schema.createAssetSchema), assetController.createAsset.bind(assetController));
    fastify.get("/", opts(schema.getAllAssetsSchema), assetController.getAllAssets.bind(assetController));
    fastify.get("/:id", opts(schema.getAssetByIdSchema), assetController.getAssetById.bind(assetController));
    fastify.put("/:id", opts(schema.updateAssetSchema), assetController.updateAsset.bind(assetController));
    fastify.delete("/:id", opts(schema.deleteAssetSchema), assetController.deleteAsset.bind(assetController));

    // ============================
    // Asset Assignment Routes
    // ============================
    fastify.post("/assignments", opts(schema.createAssignmentSchema), assetAssignmentController.createAssignment.bind(assetAssignmentController));
    fastify.get("/assignments", opts(schema.getAllAssignmentsSchema), assetAssignmentController.getAllAssignments.bind(assetAssignmentController));
    fastify.get("/assignments/:id", opts(schema.getAssignmentByIdSchema), assetAssignmentController.getAssignmentById.bind(assetAssignmentController));
    fastify.put("/assignments/:id", opts(schema.updateAssignmentSchema), assetAssignmentController.updateAssignment.bind(assetAssignmentController));
    fastify.delete("/assignments/:id", opts(schema.deleteAssignmentSchema), assetAssignmentController.deleteAssignment.bind(assetAssignmentController));

    // ============================
    // Asset History Routes
    // ============================
    fastify.post("/history", opts(schema.createHistorySchema), assetHistoryController.createHistory.bind(assetHistoryController));
    fastify.get("/history", opts(schema.getAllHistorySchema), assetHistoryController.getAllHistory.bind(assetHistoryController));
    fastify.get("/history/:id", opts(schema.getHistoryByIdSchema), assetHistoryController.getHistoryById.bind(assetHistoryController));
    fastify.delete("/history/:id", opts(schema.deleteHistorySchema), assetHistoryController.deleteHistory.bind(assetHistoryController));
}

module.exports = routes;
