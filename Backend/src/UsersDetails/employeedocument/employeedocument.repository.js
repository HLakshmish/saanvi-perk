const prisma = require("../../config/prisma");

class EmployeeDocumentRepository {

    async createDocument(data) {
        return await prisma.employeeDocument.create({
            data
        });
    }

    async getDocumentById(id) {
        return await prisma.employeeDocument.findUnique({
            where: { documentId: Number(id) }
        });
    }

    async getDocumentsByUserId(userId) {
        return await prisma.employeeDocument.findMany({
            where: { userId: Number(userId) },
            select: {
                documentId: true,
                userId: true,
                documentType: true,
                status: true,
                uploadedAt: true,
                updatedAt: true
            }
        });
    }

    async deleteDocument(id) {
        return await prisma.employeeDocument.delete({
            where: { documentId: Number(id) }
        });
    }
}

module.exports = new EmployeeDocumentRepository();
