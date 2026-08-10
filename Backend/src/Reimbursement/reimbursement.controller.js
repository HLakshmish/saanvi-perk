const reimbursementService = require("./reimbursement.service");

class ReimbursementController {
    async createClaim(request, reply) {
        try {
            const data = request.body;
            // Support companyId from token if it exists (for HR/owner) or from body
            const companyId = request.user.companyId || data.companyId;
            data.companyId = companyId;

            // Support applying on behalf of someone else
            const userId = data.userId || request.user.userId;

            const claim = await reimbursementService.createClaim(data, request.user.userId);
            
            reply.code(201).send({
                success: true,
                message: "Reimbursement claim created successfully",
                data: claim
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getClaimById(request, reply) {
        try {
            const { id } = request.params;
            const companyId = request.user.companyId || request.query.companyId;

            const claim = await reimbursementService.getClaimById(Number(id), companyId);
            
            reply.code(200).send({
                success: true,
                data: claim
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllClaims(request, reply) {
        try {
            const companyId = request.user.companyId || request.query.companyId;
            const userId = request.query.userId;
            
            const claims = await reimbursementService.getAllClaims(companyId, userId ? Number(userId) : null);
            
            reply.code(200).send({
                success: true,
                data: claims
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async updateClaim(request, reply) {
        try {
            const { id } = request.params;
            const data = request.body;
            const companyId = request.user.companyId || request.query.companyId;

            const claim = await reimbursementService.updateClaim(Number(id), companyId, data, request.user.userId);
            
            reply.code(200).send({
                success: true,
                message: "Reimbursement claim updated successfully",
                data: claim
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async updateClaimStatus(request, reply) {
        try {
            const { id } = request.params;
            const data = request.body;
            const companyId = request.user.companyId || request.query.companyId;

            const claim = await reimbursementService.updateClaimStatus(Number(id), companyId, data, request.user.userId);
            
            reply.code(200).send({
                success: true,
                message: "Reimbursement claim status updated successfully",
                data: claim
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteClaim(request, reply) {
        try {
            const { id } = request.params;
            const companyId = request.user.companyId || request.query.companyId;

            await reimbursementService.deleteClaim(Number(id), companyId);
            
            reply.code(200).send({
                success: true,
                message: "Reimbursement claim deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async uploadBill(request, reply) {
        try {
            const data = await request.file();
            
            if (!data) {
                throw new Error("No file uploaded");
            }

            const fileBuffer = await data.toBuffer();
            const fields = data.fields;

            if (!fields.claimId || !fields.billAmount) {
                throw new Error("Missing required fields: claimId, billAmount");
            }

            const companyId = request.user.companyId || (fields.companyId ? Number(fields.companyId.value) : null);

            const billData = {
                claimId: Number(fields.claimId.value),
                companyId,
                billNumber: fields.billNumber ? fields.billNumber.value : null,
                billDate: fields.billDate ? fields.billDate.value : null,
                billAmount: parseFloat(fields.billAmount.value),
                vendorName: fields.vendorName ? fields.vendorName.value : null,
                fileName: data.filename,
                mimeType: data.mimetype,
                fileSize: fileBuffer.length,
                fileData: fileBuffer
            };

            const createdBill = await reimbursementService.uploadBill(billData, request.user.userId);
            
            delete createdBill.fileData;

            reply.code(201).send({
                success: true,
                message: "Bill uploaded successfully",
                data: createdBill
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getClaimHistory(request, reply) {
        try {
            const { id } = request.params;
            const companyId = request.user.companyId || request.query.companyId;

            const history = await reimbursementService.getClaimHistory(Number(id), companyId);
            
            reply.code(200).send({
                success: true,
                data: history
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }
    async downloadBill(request, reply) {
        try {
            const { id } = request.params;
            const bill = await reimbursementService.getBillById(Number(id));
            
            reply.header('Content-Disposition', `attachment; filename="${bill.fileName}"`);
            reply.type(bill.mimeType);
            reply.send(bill.fileData);
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteBill(request, reply) {
        try {
            const { id } = request.params;
            const result = await reimbursementService.deleteBill(Number(id), request.user.userId);
            
            reply.code(200).send({
                success: true,
                message: result.message
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ReimbursementController();
