const documentService = require("./employeedocument.service");

class EmployeeDocumentController {

    async uploadDocument(request, reply) {
        try {
            const data = await request.file();
            
            if (!data) {
                throw new Error("No file uploaded");
            }

            const fileBuffer = await data.toBuffer();
            const fields = data.fields;

            if (!fields.userId || !fields.documentType) {
                throw new Error("Missing required fields: userId, documentType");
            }

            const docData = {
                userId: Number(fields.userId.value),
                documentType: fields.documentType.value,
                document: fileBuffer
            };

            const createdDocument = await documentService.uploadDocument(docData);
            
            // Do not send back document buffer in response
            delete createdDocument.document;

            reply.code(201).send({
                success: true,
                message: "Document uploaded successfully",
                data: createdDocument
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getDocumentById(request, reply) {
        try {
            const { id } = request.params;
            const doc = await documentService.getDocumentById(Number(id));
            
            delete doc.document;

            reply.code(200).send({
                success: true,
                data: doc
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async downloadDocument(request, reply) {
        try {
            const { id } = request.params;
            const doc = await documentService.getDocumentById(Number(id));
            
            reply.header('Content-Disposition', `attachment; filename="document_${id}.bin"`);
            reply.type('application/octet-stream');
            reply.send(doc.document);
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getDocumentsByUserId(request, reply) {
        try {
            const { userId } = request.query;
            if (!userId) {
                throw new Error("userId query parameter is required");
            }
            const documents = await documentService.getDocumentsByUserId(Number(userId));
            reply.code(200).send({
                success: true,
                data: documents
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deleteDocument(request, reply) {
        try {
            const { id } = request.params;
            await documentService.deleteDocument(Number(id));
            reply.code(200).send({
                success: true,
                message: "Document deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new EmployeeDocumentController();
