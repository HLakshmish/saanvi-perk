const prisma = require("../config/prisma");

class PFDetailRepository {

    async createPFDetail(data) {
        return await prisma.pFDetail.create({
            data
        });
    }

    async getPFDetailById(id) {
        return await prisma.pFDetail.findUnique({
            where: {
                pfDetailId: Number(id)
            }
        });
    }

    async getPFDetailByUserId(userId) {
        return await prisma.pFDetail.findUnique({
            where: {
                userId: Number(userId)
            }
        });
    }

    async getAllPFDetails(query = {}) {
        return await prisma.pFDetail.findMany({
            where: query
        });
    }

    async updatePFDetail(id, data) {
        return await prisma.pFDetail.update({
            where: {
                pfDetailId: Number(id)
            },
            data
        });
    }

    async deletePFDetail(id) {
        return await prisma.pFDetail.delete({
            where: {
                pfDetailId: Number(id)
            }
        });
    }

}

module.exports = new PFDetailRepository();
