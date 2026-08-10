const prisma = require("../../config/prisma");

// ============================
// Asset Repository
// ============================
class AssetRepository {
    async createAsset(data) {
        return await prisma.assetDetails.create({ data });
    }

    async getAssetById(id) {
        return await prisma.assetDetails.findUnique({
            where: { assetId: id },
            include: {
                assignments: {
                    include: { user: true }
                },
                history: true
            }
        });
    }

    async getAssetByCode(companyId, assetCode) {
        return await prisma.assetDetails.findFirst({
            where: { companyId, assetCode }
        });
    }

    async getAllAssets(where = {}) {
        return await prisma.assetDetails.findMany({
            where,
            include: {
                assignments: {
                    where: { returnedDate: null },
                    include: { user: { select: { userId: true, firstName: true, lastName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateAsset(id, data) {
        return await prisma.assetDetails.update({ where: { assetId: id }, data });
    }

    async deleteAsset(id) {
        return await prisma.assetDetails.delete({ where: { assetId: id } });
    }
}

// ============================
// Asset Assignment Repository
// ============================
class AssetAssignmentRepository {
    async getUserByIdAndCompany(userId, companyId) {
        return await prisma.user.findFirst({
            where: { userId, companyId }
        });
    }

    async createAssignment(data) {
        return await prisma.assetAssignments.create({
            data,
            include: { asset: true, user: true }
        });
    }

    async getAssignmentById(id) {
        return await prisma.assetAssignments.findUnique({
            where: { assignmentId: id },
            include: { asset: true, user: true }
        });
    }

    async getActiveAssignmentForAsset(assetId) {
        return await prisma.assetAssignments.findFirst({
            where: { assetId, returnedDate: null }
        });
    }

    async getAllAssignments(where = {}) {
        return await prisma.assetAssignments.findMany({
            where,
            include: {
                asset: true,
                user: { select: { userId: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateAssignment(id, data) {
        return await prisma.assetAssignments.update({
            where: { assignmentId: id },
            data,
            include: { asset: true, user: true }
        });
    }

    async deleteAssignment(id) {
        return await prisma.assetAssignments.delete({ where: { assignmentId: id } });
    }
}

// ============================
// Asset History Repository
// ============================
class AssetHistoryRepository {
    async createHistory(data) {
        return await prisma.assetHistory.create({ data });
    }

    async getHistoryById(id) {
        return await prisma.assetHistory.findUnique({
            where: { historyId: id },
            include: { asset: true }
        });
    }

    async getAllHistory(where = {}) {
        return await prisma.assetHistory.findMany({
            where,
            include: {
                asset: { select: { assetId: true, assetCode: true, assetName: true } }
            },
            orderBy: { actionDate: 'desc' }
        });
    }

    async deleteHistory(id) {
        return await prisma.assetHistory.delete({ where: { historyId: id } });
    }
}

module.exports = {
    assetRepository: new AssetRepository(),
    assetAssignmentRepository: new AssetAssignmentRepository(),
    assetHistoryRepository: new AssetHistoryRepository()
};
