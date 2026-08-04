const prisma = require("../config/prisma");

class ParentInfoRepository {

    async createParentInfo(data) {
        return await prisma.parentsInformation.create({
            data
        });
    }

    async getParentInfoByUserId(userId) {
        return await prisma.parentsInformation.findUnique({
            where: {
                userId: Number(userId)
            }
        });
    }

    async getAllParentInfo(query = {}) {
        return await prisma.parentsInformation.findMany({
            where: query
        });
    }

    async updateParentInfo(userId, data) {
        return await prisma.parentsInformation.update({
            where: {
                userId: Number(userId)
            },
            data
        });
    }

    async deleteParentInfo(userId) {
        return await prisma.parentsInformation.delete({
            where: {
                userId: Number(userId)
            }
        });
    }

}

module.exports = new ParentInfoRepository();