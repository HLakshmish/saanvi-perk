const documentResponseProperties = {
    documentId: { type: 'number' },
    userId: { type: 'number' },
    documentType: { type: 'string' },
    status: { type: 'boolean' },
    uploadedAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const uploadDocumentSchema = {
    description: 'Upload an employee document',
    tags: ['Employee Documents'],
    summary: 'Upload document (multipart/form-data)',
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        properties: {
            userId: { type: 'string', description: 'User ID' },
            documentType: { type: 'string', description: 'Type of Document (e.g. AADHAAR, PAN)' },
            file: { type: 'string', format: 'binary', description: 'The file to upload' }
        }
    },
    response: {
        201: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: documentResponseProperties
                }
            }
        }
    }
};

const getDocumentByIdSchema = {
    description: 'Get document metadata by ID',
    tags: ['Employee Documents'],
    summary: 'Retrieves document metadata',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: documentResponseProperties
                }
            }
        }
    }
};

const downloadDocumentSchema = {
    description: 'Download an employee document',
    tags: ['Employee Documents'],
    summary: 'Downloads the actual file',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    }
};

const getDocumentsByUserIdSchema = {
    description: 'Get all documents for a user',
    tags: ['Employee Documents'],
    summary: 'Retrieves all document metadata for a user',
    querystring: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: documentResponseProperties
                    }
                }
            }
        }
    }
};

const deleteDocumentSchema = {
    description: 'Delete a document',
    tags: ['Employee Documents'],
    summary: 'Deletes a document',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

module.exports = {
    uploadDocumentSchema,
    getDocumentByIdSchema,
    downloadDocumentSchema,
    getDocumentsByUserIdSchema,
    deleteDocumentSchema
};
