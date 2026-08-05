const prisma = require("../config/prisma");

class InsuranceDetailRepository {

    async createInsuranceDetail(data) {
        return await prisma.insuranceDetail.create({
            data
        });
    }

    async getInsuranceDetailById(id) {
        return await prisma.insuranceDetail.findUnique({
            where: {
                insuranceId: Number(id)
            }
        });
    }

    async getInsuranceDetailByUserId(userId) {
        return await prisma.insuranceDetail.findUnique({
            where: {
                userId: Number(userId)
            }
        });
    }

    async getAllInsuranceDetails(query = {}) {
        return await prisma.insuranceDetail.findMany({
            where: query
        });
    }

    async updateInsuranceDetail(id, data) {
        return await prisma.insuranceDetail.update({
            where: {
                insuranceId: Number(id)
            },
            data
        });
    }

    async deleteInsuranceDetail(id) {
        return await prisma.insuranceDetail.delete({
            where: {
                insuranceId: Number(id)
            }
        });
    }

}

module.exports = new InsuranceDetailRepository();
