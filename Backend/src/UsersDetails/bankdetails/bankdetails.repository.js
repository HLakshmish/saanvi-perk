const prisma = require("../../config/prisma");

class BankDetailsRepository {

    async createBankDetails(data) {
        return await prisma.bankDetails.create({
            data
        });
    }

    async getBankDetailsById(id) {
        return await prisma.bankDetails.findUnique({
            where: {
                bankId: Number(id)
            }
        });
    }

    async getBankDetailsByUserId(userId) {
        return await prisma.bankDetails.findFirst({
            where: {
                userId: Number(userId)
            }
        });
    }

    async getAllBankDetails(query = {}) {
        return await prisma.bankDetails.findMany({
            where: query
        });
    }

    async updateBankDetails(id, data) {
        return await prisma.bankDetails.update({
            where: {
                bankId: Number(id)
            },
            data
        });
    }

    async deleteBankDetails(id) {
        return await prisma.bankDetails.delete({
            where: {
                bankId: Number(id)
            }
        });
    }

}

module.exports = new BankDetailsRepository();
