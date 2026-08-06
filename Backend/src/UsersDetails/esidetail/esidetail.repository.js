const prisma = require("../../config/prisma");

class ESIDetailRepository {

    async createESIDetail(data) {
        return await prisma.eSIDetail.create({
            data
        });
    }

    async getESIDetailById(id) {
        return await prisma.eSIDetail.findUnique({
            where: {
                esiDetailId: Number(id)
            }
        });
    }

    async getESIDetailByUserId(userId) {
        return await prisma.eSIDetail.findUnique({
            where: {
                userId: Number(userId)
            }
        });
    }

    async getAllESIDetails(query = {}) {
        return await prisma.eSIDetail.findMany({
            where: query
        });
    }

    async updateESIDetail(id, data) {
        return await prisma.eSIDetail.update({
            where: {
                esiDetailId: Number(id)
            },
            data
        });
    }

    async deleteESIDetail(id) {
        return await prisma.eSIDetail.delete({
            where: {
                esiDetailId: Number(id)
            }
        });
    }

}

module.exports = new ESIDetailRepository();
