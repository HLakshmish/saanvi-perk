const esiDetailBodyProperties = {
    userId: { type: 'number' },
    esiNumber: { type: 'string', nullable: true },
    esiJoiningDate: { type: 'string', format: 'date-time', nullable: true },
    esiLeavingDate: { type: 'string', format: 'date-time', nullable: true },
    reasonForLeaving: { 
        type: 'string', 
        enum: ['RESIGNED', 'TERMINATED', 'RETIRED', 'CONTRACT_COMPLETED', 'TRANSFERRED', 'DECEASED', 'OTHER'],
        nullable: true 
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createESIDetailSchema = {
    description: 'Create ESI details',
    tags: ['ESI Details'],
    summary: 'Creates ESI details for a user',
    body: {
        type: 'object',
        required: ['userId'],
        properties: esiDetailBodyProperties
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
                        esiDetailId: { type: 'number' },
                        ...esiDetailBodyProperties
                    }
                }
            }
        }
    }
};

const updateESIDetailSchema = {
    description: 'Update ESI details',
    tags: ['ESI Details'],
    summary: 'Updates ESI details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'ESI Detail ID'
            }
        }
    },
    body: {
        type: 'object',
        properties: esiDetailBodyProperties
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
                        esiDetailId: { type: 'number' },
                        ...esiDetailBodyProperties
                    }
                }
            }
        }
    }
};

const getESIDetailByIdSchema = {
    description: 'Get ESI details by ID',
    tags: ['ESI Details'],
    summary: 'Retrieves ESI details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'ESI Detail ID'
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
                        esiDetailId: { type: 'number' },
                        ...esiDetailBodyProperties
                    }
                }
            }
        }
    }
};

const getAllESIDetailsSchema = {
    description: 'Get all ESI details',
    tags: ['ESI Details'],
    summary: 'Retrieves all ESI details records',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            esiNumber: { type: 'string' }
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
                            esiDetailId: { type: 'number' },
                            ...esiDetailBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const deleteESIDetailSchema = {
    description: 'Delete ESI details',
    tags: ['ESI Details'],
    summary: 'Deletes ESI details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'ESI Detail ID'
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
    createESIDetailSchema,
    updateESIDetailSchema,
    getESIDetailByIdSchema,
    getAllESIDetailsSchema,
    deleteESIDetailSchema
};
