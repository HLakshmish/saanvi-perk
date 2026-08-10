const {
    assetService,
    assetAssignmentService,
    assetHistoryService
} = require("./asset.service");

// ============================
// Asset Controller
// ============================
class AssetController {
    async createAsset(request, reply) {
        try {
            const companyId = request.user.companyId;
            if (!companyId) return reply.code(403).send({ success: false, message: "No company associated with this account" });
            const data = { ...request.body, companyId };
            const asset = await assetService.createAsset(data);
            reply.code(201).send({ success: true, message: "Asset created successfully", data: asset });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async getAssetById(request, reply) {
        try {
            const asset = await assetService.getAssetById(Number(request.params.id));
            if (asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            reply.code(200).send({ success: true, data: asset });
        } catch (error) { reply.code(404).send({ success: false, message: error.message }); }
    }

    async getAllAssets(request, reply) {
        try {
            const companyId = request.user.companyId;
            if (!companyId) return reply.code(403).send({ success: false, message: "No company associated with this account" });
            const query = { ...request.query, companyId };
            const assets = await assetService.getAllAssets(query);
            reply.code(200).send({ success: true, data: assets });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }

    async updateAsset(request, reply) {
        try {
            const asset = await assetService.getAssetById(Number(request.params.id));
            if (asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            const updated = await assetService.updateAsset(Number(request.params.id), request.body);
            reply.code(200).send({ success: true, message: "Asset updated successfully", data: updated });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async deleteAsset(request, reply) {
        try {
            const asset = await assetService.getAssetById(Number(request.params.id));
            if (asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            await assetService.deleteAsset(Number(request.params.id));
            reply.code(200).send({ success: true, message: "Asset deleted successfully" });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
}

// ============================
// Asset Assignment Controller
// ============================
class AssetAssignmentController {
    async createAssignment(request, reply) {
        try {
            const companyId = request.user.companyId;
            if (!companyId) return reply.code(403).send({ success: false, message: "No company associated with this account" });
            
            const data = { ...request.body, companyId };
            const assignment = await assetAssignmentService.createAssignment(data);
            reply.code(201).send({ success: true, message: "Asset assigned successfully", data: assignment });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async getAssignmentById(request, reply) {
        try {
            const assignment = await assetAssignmentService.getAssignmentById(Number(request.params.id));
            if (assignment.asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            reply.code(200).send({ success: true, data: assignment });
        } catch (error) { reply.code(404).send({ success: false, message: error.message }); }
    }

    async getAllAssignments(request, reply) {
        try {
            const companyId = request.user.companyId;
            if (!companyId) return reply.code(403).send({ success: false, message: "No company associated with this account" });

            const query = { ...request.query, companyId };
            const assignments = await assetAssignmentService.getAllAssignments(query);
            reply.code(200).send({ success: true, data: assignments });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }

    async updateAssignment(request, reply) {
        try {
            const assignment = await assetAssignmentService.getAssignmentById(Number(request.params.id));
            if (assignment.asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });

            const updated = await assetAssignmentService.updateAssignment(Number(request.params.id), request.body);
            reply.code(200).send({ success: true, message: "Assignment updated successfully", data: updated });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async deleteAssignment(request, reply) {
        try {
            const assignment = await assetAssignmentService.getAssignmentById(Number(request.params.id));
            if (assignment.asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });

            await assetAssignmentService.deleteAssignment(Number(request.params.id));
            reply.code(200).send({ success: true, message: "Assignment deleted successfully" });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
}

// ============================
// Asset History Controller
// ============================
class AssetHistoryController {
    async createHistory(request, reply) {
        try {
            const companyId = request.user.companyId;
            if (!companyId) return reply.code(403).send({ success: false, message: "No company associated with this account" });

            const data = { ...request.body, companyId };
            const history = await assetHistoryService.createHistory(data);
            reply.code(201).send({ success: true, message: "Asset history record created", data: history });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }

    async getHistoryById(request, reply) {
        try {
            const history = await assetHistoryService.getHistoryById(Number(request.params.id));
            if (history.asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            reply.code(200).send({ success: true, data: history });
        } catch (error) { reply.code(404).send({ success: false, message: error.message }); }
    }

    async getAllHistory(request, reply) {
        try {
            const companyId = request.user.companyId;
            if (!companyId) return reply.code(403).send({ success: false, message: "No company associated with this account" });

            const query = { ...request.query, companyId };
            const history = await assetHistoryService.getAllHistory(query);
            reply.code(200).send({ success: true, data: history });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }

    async deleteHistory(request, reply) {
        try {
            const history = await assetHistoryService.getHistoryById(Number(request.params.id));
            if (history.asset.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });

            await assetHistoryService.deleteHistory(Number(request.params.id));
            reply.code(200).send({ success: true, message: "Asset history record deleted" });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
}

module.exports = {
    assetController: new AssetController(),
    assetAssignmentController: new AssetAssignmentController(),
    assetHistoryController: new AssetHistoryController()
};
