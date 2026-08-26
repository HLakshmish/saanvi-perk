const {
    assetRepository,
    assetAssignmentRepository,
    assetHistoryRepository
} = require("./asset.repository");

// ============================
// Asset Service
// ============================
class AssetService {
    async createAsset(data) {
        // Check for duplicate asset code within company
        const existing = await assetRepository.getAssetByCode(data.companyId, data.assetCode);
        if (existing) throw new Error(`Asset with code '${data.assetCode}' already exists`);

        // Parse dates
        if (data.purchaseDate === "") data.purchaseDate = null;
        else if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate);
        if (data.warrantyStartDate === "") data.warrantyStartDate = null;
        else if (data.warrantyStartDate) data.warrantyStartDate = new Date(data.warrantyStartDate);
        if (data.warrantyEndDate === "") data.warrantyEndDate = null;
        else if (data.warrantyEndDate) data.warrantyEndDate = new Date(data.warrantyEndDate);

        // Default status
        if (!data.assetStatus) data.assetStatus = 'AVAILABLE';

        return await assetRepository.createAsset(data);
    }

    async getAssetById(id) {
        const asset = await assetRepository.getAssetById(id);
        if (!asset) throw new Error("Asset not found");
        return asset;
    }

    async getAllAssets(query) {
        const { companyId, assetType, assetStatus, brand } = query;
        const where = { companyId };
        if (assetType) where.assetType = assetType;
        if (assetStatus) where.assetStatus = assetStatus;
        if (brand) where.brand = brand;
        return await assetRepository.getAllAssets(where);
    }

    async updateAsset(id, data) {
        await this.getAssetById(id);
        if (data.purchaseDate === "") data.purchaseDate = null;
        else if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate);
        if (data.warrantyStartDate === "") data.warrantyStartDate = null;
        else if (data.warrantyStartDate) data.warrantyStartDate = new Date(data.warrantyStartDate);
        if (data.warrantyEndDate === "") data.warrantyEndDate = null;
        else if (data.warrantyEndDate) data.warrantyEndDate = new Date(data.warrantyEndDate);
        return await assetRepository.updateAsset(id, data);
    }

    async deleteAsset(id) {
        await this.getAssetById(id);
        return await assetRepository.deleteAsset(id);
    }
}

// ============================
// Asset Assignment Service
// ============================
class AssetAssignmentService {
    async createAssignment(data) {
        // Validate that the asset exists and is available
        const asset = await assetRepository.getAssetById(data.assetId);
        if (!asset) throw new Error("Asset not found");
        if (asset.companyId !== data.companyId) throw new Error("Forbidden");
        if (asset.assetStatus !== 'AVAILABLE') throw new Error(`Asset is not available for assignment (current status: ${asset.assetStatus})`);

        // Validate that the target user exists and belongs to the same company
        const targetUser = await assetAssignmentRepository.getUserByIdAndCompany(data.userId, data.companyId);
        if (!targetUser) throw new Error("Target user not found or does not belong to your company");

        // Check for active assignment
        const activeAssignment = await assetAssignmentRepository.getActiveAssignmentForAsset(data.assetId);
        if (activeAssignment) throw new Error("Asset already has an active assignment");

        if (data.assignedDate === "") data.assignedDate = null;
        else if (data.assignedDate) data.assignedDate = new Date(data.assignedDate);
        if (data.expectedReturnDate === "") data.expectedReturnDate = null;
        else if (data.expectedReturnDate) data.expectedReturnDate = new Date(data.expectedReturnDate);

        if (!data.assignmentStatus) data.assignmentStatus = 'ACTIVE';

        // Remove companyId from data payload before saving, as it's not in the DB schema for assignment
        const payload = { ...data };
        delete payload.companyId;

        const assignment = await assetAssignmentRepository.createAssignment(payload);

        // Update asset status to ASSIGNED
        await assetRepository.updateAsset(data.assetId, { assetStatus: 'ASSIGNED' });

        // Log history
        await assetHistoryRepository.createHistory({
            assetId: data.assetId,
            userId: data.userId,
            action: 'ASSIGNED',
            previousStatus: 'AVAILABLE',
            newStatus: 'ASSIGNED',
            actionDate: data.assignedDate,
            performedBy: data.assignedBy || null,
            remarks: data.remarks || null
        });

        return assignment;
    }

    async getAssignmentById(id) {
        const assignment = await assetAssignmentRepository.getAssignmentById(id);
        if (!assignment) throw new Error("Asset assignment not found");
        return assignment;
    }

    async getAllAssignments(query) {
        const { assetId, userId, assignmentStatus, companyId } = query;
        const where = {
            asset: { companyId }
        };
        if (assetId) where.assetId = Number(assetId);
        if (userId) where.userId = Number(userId);
        if (assignmentStatus) where.assignmentStatus = assignmentStatus;
        return await assetAssignmentRepository.getAllAssignments(where);
    }

    async updateAssignment(id, data) {
        const assignment = await this.getAssignmentById(id);

        if (data.assignedDate === "") data.assignedDate = null;
        else if (data.assignedDate) data.assignedDate = new Date(data.assignedDate);
        if (data.expectedReturnDate === "") data.expectedReturnDate = null;
        else if (data.expectedReturnDate) data.expectedReturnDate = new Date(data.expectedReturnDate);
        if (data.returnedDate === "") data.returnedDate = null;
        else if (data.returnedDate) data.returnedDate = new Date(data.returnedDate);

        const updated = await assetAssignmentRepository.updateAssignment(id, data);

        // If asset is being returned, update asset status to AVAILABLE and log history
        if (data.returnedDate && !assignment.returnedDate) {
            await assetRepository.updateAsset(assignment.assetId, { assetStatus: 'AVAILABLE' });
            await assetHistoryRepository.createHistory({
                assetId: assignment.assetId,
                userId: assignment.userId,
                action: 'RETURNED',
                previousStatus: 'ASSIGNED',
                newStatus: 'AVAILABLE',
                actionDate: data.returnedDate,
                performedBy: data.returnedBy || null,
                remarks: data.remarks || null
            });
        }

        return updated;
    }

    async deleteAssignment(id) {
        await this.getAssignmentById(id);
        return await assetAssignmentRepository.deleteAssignment(id);
    }
}

// ============================
// Asset History Service
// ============================
class AssetHistoryService {
    async createHistory(data) {
        const asset = await assetRepository.getAssetById(data.assetId);
        if (!asset) throw new Error("Asset not found");
        if (asset.companyId !== data.companyId) throw new Error("Forbidden");
        
        if (data.userId) {
            const targetUser = await assetAssignmentRepository.getUserByIdAndCompany(data.userId, data.companyId);
            if (!targetUser) throw new Error("Target user not found or does not belong to your company");
        }

        if (data.actionDate) data.actionDate = new Date(data.actionDate);

        // Remove companyId before saving
        const payload = { ...data };
        delete payload.companyId;

        return await assetHistoryRepository.createHistory(payload);
    }

    async getHistoryById(id) {
        const history = await assetHistoryRepository.getHistoryById(id);
        if (!history) throw new Error("Asset history record not found");
        return history;
    }

    async getAllHistory(query) {
        const { assetId, userId, action, companyId } = query;
        const where = {
            asset: { companyId }
        };
        if (assetId) where.assetId = Number(assetId);
        if (userId) where.userId = Number(userId);
        if (action) where.action = action;
        return await assetHistoryRepository.getAllHistory(where);
    }

    async deleteHistory(id) {
        await this.getHistoryById(id);
        return await assetHistoryRepository.deleteHistory(id);
    }
}

module.exports = {
    assetService: new AssetService(),
    assetAssignmentService: new AssetAssignmentService(),
    assetHistoryService: new AssetHistoryService()
};
