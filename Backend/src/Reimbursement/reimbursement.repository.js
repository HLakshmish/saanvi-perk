const prisma = require("../config/prisma");

class ReimbursementRepository {
    async createClaim(data) {
        return await prisma.reimbursementClaim.create({
            data,
            include: {
                user: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            }
        });
    }

    async getClaimById(claimId, companyId) {
        const whereClause = { claimId };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.reimbursementClaim.findFirst({
            where: whereClause,
            include: {
                user: {
                    select: { userId: true, firstName: true, lastName: true }
                },
                approver: {
                    select: { userId: true, firstName: true, lastName: true }
                },
                bills: {
                    select: {
                        billId: true,
                        billNumber: true,
                        billDate: true,
                        billAmount: true,
                        vendorName: true,
                        fileName: true,
                        mimeType: true,
                        fileSize: true,
                        createdAt: true
                    }
                },
                history: {
                    include: {
                        user: {
                            select: { userId: true, firstName: true, lastName: true }
                        }
                    },
                    orderBy: { actionDate: 'desc' }
                }
            }
        });
    }

    async getAllClaims(companyId, userId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;
        if (userId) whereClause.userId = userId;

        return await prisma.reimbursementClaim.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            }
        });
    }

    async updateClaim(claimId, companyId, data) {
        const whereClause = { claimId };
        if (companyId) whereClause.companyId = companyId;

        const existingClaim = await prisma.reimbursementClaim.findFirst({ where: whereClause });
        if (!existingClaim) throw new Error("Reimbursement claim not found or does not belong to this company");

        return await prisma.reimbursementClaim.update({
            where: { claimId },
            data,
            include: {
                user: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            }
        });
    }

    async deleteClaim(claimId, companyId) {
        const whereClause = { claimId };
        if (companyId) whereClause.companyId = companyId;

        const existingClaim = await prisma.reimbursementClaim.findFirst({ where: whereClause });
        if (!existingClaim) throw new Error("Reimbursement claim not found or does not belong to this company");

        return await prisma.reimbursementClaim.delete({
            where: { claimId }
        });
    }

    async createBill(data) {
        return await prisma.reimbursementBill.create({
            data
        });
    }

    async getBillById(billId) {
        return await prisma.reimbursementBill.findUnique({
            where: { billId }
        });
    }

    async deleteBill(billId) {
        return await prisma.reimbursementBill.delete({
            where: { billId }
        });
    }

    async getClaimHistory(claimId) {
        return await prisma.reimbursementHistory.findMany({
            where: { claimId },
            include: {
                user: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            },
            orderBy: { actionDate: 'desc' }
        });
    }

    async addHistory(data) {
        return await prisma.reimbursementHistory.create({
            data
        });
    }
}

module.exports = new ReimbursementRepository();
