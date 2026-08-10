const reimbursementRepository = require("./reimbursement.repository");

class ReimbursementService {
    async createClaim(data, userId) {
        // Generating a unique claim number
        const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const claimData = {
            ...data,
            userId,
            claimNumber,
            claimDate: data.claimDate ? new Date(data.claimDate) : new Date(),
            status: data.status || 'DRAFT',
        };

        const claim = await reimbursementRepository.createClaim(claimData);

        // Add history
        await reimbursementRepository.addHistory({
            claimId: claim.claimId,
            action: 'CREATED',
            newStatus: claim.status,
            actionBy: userId,
            remarks: 'Claim created'
        });

        return claim;
    }

    async getClaimById(claimId, companyId) {
        const claim = await reimbursementRepository.getClaimById(claimId, companyId);
        if (!claim) {
            throw new Error("Reimbursement claim not found");
        }
        return claim;
    }

    async getAllClaims(companyId, userId) {
        return await reimbursementRepository.getAllClaims(companyId, userId);
    }

    async updateClaim(claimId, companyId, data, userId) {
        const existingClaim = await this.getClaimById(claimId, companyId);
        
        const previousStatus = existingClaim.status;
        const newStatus = data.status || previousStatus;

        if (data.claimDate) data.claimDate = new Date(data.claimDate);

        const updatedClaim = await reimbursementRepository.updateClaim(claimId, companyId, data);

        if (previousStatus !== newStatus) {
            await reimbursementRepository.addHistory({
                claimId,
                action: 'STATUS_UPDATED',
                previousStatus,
                newStatus,
                actionBy: userId,
                remarks: `Status updated to ${newStatus}`
            });
        }

        return updatedClaim;
    }

    async updateClaimStatus(claimId, companyId, data, userId) {
        const existingClaim = await this.getClaimById(claimId, companyId);
        
        const previousStatus = existingClaim.status;
        const newStatus = data.status;

        const updateData = {
            status: newStatus,
            rejectionReason: data.rejectionReason || null,
            remarks: data.remarks || existingClaim.remarks
        };

        if (newStatus === 'APPROVED') {
            updateData.approvedBy = userId;
            updateData.approvedAt = new Date();
            if (data.approvedAmount) {
                updateData.approvedAmount = data.approvedAmount;
            } else {
                updateData.approvedAmount = existingClaim.totalAmount;
            }
        }

        if (newStatus === 'PAID') {
            updateData.paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();
        }

        const updatedClaim = await reimbursementRepository.updateClaim(claimId, companyId, updateData);

        await reimbursementRepository.addHistory({
            claimId,
            action: 'STATUS_UPDATED',
            previousStatus,
            newStatus,
            actionBy: userId,
            remarks: data.remarks || `Status updated to ${newStatus}`
        });

        return updatedClaim;
    }

    async deleteClaim(claimId, companyId) {
        return await reimbursementRepository.deleteClaim(claimId, companyId);
    }

    async uploadBill(billData, userId) {
        const existingClaim = await this.getClaimById(billData.claimId, billData.companyId);
        
        if (!existingClaim) {
            throw new Error("Reimbursement claim not found");
        }

        const bill = await reimbursementRepository.createBill({
            claimId: billData.claimId,
            billNumber: billData.billNumber,
            billDate: billData.billDate ? new Date(billData.billDate) : null,
            billAmount: billData.billAmount,
            vendorName: billData.vendorName,
            fileName: billData.fileName,
            mimeType: billData.mimeType,
            fileSize: billData.fileSize,
            fileData: billData.fileData
        });

        await reimbursementRepository.addHistory({
            claimId: billData.claimId,
            action: 'BILL_UPLOADED',
            actionBy: userId,
            remarks: `Bill uploaded: ${billData.fileName}`
        });

        return bill;
    }

    async getBillById(billId) {
        const bill = await reimbursementRepository.getBillById(billId);
        if (!bill) {
            throw new Error("Bill not found");
        }
        return bill;
    }

    async deleteBill(billId, userId) {
        const bill = await this.getBillById(billId);
        
        await reimbursementRepository.deleteBill(billId);

        await reimbursementRepository.addHistory({
            claimId: bill.claimId,
            action: 'BILL_DELETED',
            actionBy: userId,
            remarks: `Bill deleted: ${bill.fileName}`
        });

        return { message: "Bill deleted successfully" };
    }
    async getClaimHistory(claimId, companyId) {
        // First verify the claim belongs to this company/user
        await this.getClaimById(claimId, companyId);
        
        return await reimbursementRepository.getClaimHistory(claimId);
    }
}

module.exports = new ReimbursementService();
