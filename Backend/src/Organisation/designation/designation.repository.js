const prisma = require("../../config/prisma");

class DesignationRepository {
    async createDesignation(data) {
        return await prisma.designation.create({
            data
        });
    }

    async getDesignationById(id) {
        return await prisma.designation.findUnique({
            where: { designationId: id },
            include: {
                department: true
            }
        });
    }

    async getDesignationByCode(companyId, code) {
        return await prisma.designation.findUnique({
            where: {
                companyId_designationCode: {
                    companyId: companyId,
                    designationCode: code
                }
            }
        });
    }

    async getAllDesignations(query = {}) {
        return await prisma.designation.findMany({
            where: query,
            include: {
                department: true
            }
        });
    }

    async updateDesignation(id, data) {
        return await prisma.designation.update({
            where: { designationId: id },
            data
        });
    }

    async deleteDesignation(id) {
        return await prisma.designation.delete({
            where: { designationId: id }
        });
    }
}

module.exports = new DesignationRepository();
