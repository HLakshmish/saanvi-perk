const pfDetailBodyProperties = {
    userId: { type: 'number' },
    uanNumber: { type: 'string', nullable: true },
    isInternationalWorker: { type: 'boolean', default: false },
    educationLevel: { 
        type: 'string', 
        enum: ['BELOW_10TH', 'SSLC', 'PUC', 'DIPLOMA', 'GRADUATE', 'POST_GRADUATE', 'DOCTORATE', 'OTHER'],
        nullable: true 
    },
    pfNumber: { type: 'string', nullable: true },
    pfJoiningDate: { type: 'string', format: 'date-time', nullable: true },
    pfLeavingDate: { type: 'string', format: 'date-time', nullable: true },
    documentNumber: { type: 'string', nullable: true },
    documentType: { 
        type: 'string', 
        enum: ['AADHAAR', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE', 'PAN', 'OTHER'],
        nullable: true 
    },
    documentExpiryDate: { type: 'string', format: 'date-time', nullable: true },
    reasonForLeaving: { 
        type: 'string', 
        enum: ['RESIGNED', 'TERMINATED', 'RETIRED', 'TRANSFERRED', 'CONTRACT_COMPLETED', 'DECEASED', 'OTHER'],
        nullable: true 
    },
    phcCategory: { 
        type: 'string', 
        enum: ['GENERAL', 'PH', 'EXEMPT'],
        nullable: true 
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createPFDetailSchema = {
    description: 'Create PF details',
    tags: ['PF Details'],
    summary: 'Creates PF details for a user',
    body: {
        type: 'object',
        required: ['userId'],
        properties: pfDetailBodyProperties
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
                    properties: {
                        pfDetailId: { type: 'number' },
                        ...pfDetailBodyProperties
                    }
                }
            }
        }
    }
};

const updatePFDetailSchema = {
    description: 'Update PF details',
    tags: ['PF Details'],
    summary: 'Updates PF details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'PF Detail ID'
            }
        }
    },
    body: {
        type: 'object',
        properties: pfDetailBodyProperties
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        pfDetailId: { type: 'number' },
                        ...pfDetailBodyProperties
                    }
                }
            }
        }
    }
};

const getPFDetailByIdSchema = {
    description: 'Get PF details by ID',
    tags: ['PF Details'],
    summary: 'Retrieves PF details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'PF Detail ID'
            }
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
                    properties: {
                        pfDetailId: { type: 'number' },
                        ...pfDetailBodyProperties
                    }
                }
            }
        }
    }
};

const getAllPFDetailsSchema = {
    description: 'Get all PF details',
    tags: ['PF Details'],
    summary: 'Retrieves all PF details records',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            uanNumber: { type: 'string' },
            pfNumber: { type: 'string' }
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
                        properties: {
                            pfDetailId: { type: 'number' },
                            ...pfDetailBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const deletePFDetailSchema = {
    description: 'Delete PF details',
    tags: ['PF Details'],
    summary: 'Deletes PF details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'PF Detail ID'
            }
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
    createPFDetailSchema,
    updatePFDetailSchema,
    getPFDetailByIdSchema,
    getAllPFDetailsSchema,
    deletePFDetailSchema
};
