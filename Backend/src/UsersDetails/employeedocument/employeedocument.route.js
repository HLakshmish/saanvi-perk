const documentController = require("./employeedocument.controller");
const {
    uploadDocumentSchema,
    getDocumentByIdSchema,
    downloadDocumentSchema,
    getDocumentsByUserIdSchema,
    deleteDocumentSchema
} = require("./employeedocument.schema");

async function documentRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post(
        "/",
        {
            schema: uploadDocumentSchema,
            preValidation: [fastify.authenticate],
            validatorCompiler: ({ schema, method, url, httpPart }) => {
                if (httpPart === 'body') {
                    return () => true;
                }
                const compiler = fastify.validatorCompiler;
                return compiler ? compiler({ schema, method, url, httpPart }) : () => true;
            }
        },
        documentController.uploadDocument.bind(documentController)
    );

    fastify.get(
        "/:id",
        opts(getDocumentByIdSchema),
        documentController.getDocumentById.bind(documentController)
    );

    fastify.get(
        "/:id/download",
        opts(downloadDocumentSchema),
        documentController.downloadDocument.bind(documentController)
    );

    fastify.get(
        "/",
        opts(getDocumentsByUserIdSchema),
        documentController.getDocumentsByUserId.bind(documentController)
    );

    fastify.delete(
        "/:id",
        opts(deleteDocumentSchema),
        documentController.deleteDocument.bind(documentController)
    );
}

module.exports = documentRoutes;
