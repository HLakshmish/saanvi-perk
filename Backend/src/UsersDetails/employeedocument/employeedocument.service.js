const documentRepository = require("./employeedocument.repository");

class EmployeeDocumentService {

    async uploadDocument(data) {
        return await documentRepository.createDocument(data);
    }

    async getDocumentById(id) {
        const doc = await documentRepository.getDocumentById(id);
        if (!doc) {
            throw new Error("Document not found");
        }
        return doc;
    }

    async getDocumentsByUserId(userId) {
        return await documentRepository.getDocumentsByUserId(userId);
    }

    async deleteDocument(id) {
        await this.getDocumentById(id);
        return await documentRepository.deleteDocument(id);
    }
}

module.exports = new EmployeeDocumentService();
