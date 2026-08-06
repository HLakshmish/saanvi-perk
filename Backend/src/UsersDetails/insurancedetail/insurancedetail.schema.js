const insuranceDetailBodyProperties = {
    userId: { type: 'number' },
    insuranceProvider: { type: 'string', nullable: true },
    insuranceType: { 
        type: 'string', 
        enum: ['HEALTH', 'LIFE', 'ACCIDENT', 'GROUP_MEDICAL', 'GROUP_LIFE', 'OTHER'],
        nullable: true 
    },
    policyNumber: { type: 'string', nullable: true },
    insuranceExpiryDate: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createInsuranceDetailSchema = {
    description: 'Create insurance details',
    tags: ['Insurance Details'],
    summary: 'Creates insurance details for a user',
    body: {
        type: 'object',
        required: ['userId'],
        properties: insuranceDetailBodyProperties
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
                        insuranceId: { type: 'number' },
                        ...insuranceDetailBodyProperties
                    }
                }
            }
        }
    }
};

const updateInsuranceDetailSchema = {
    description: 'Update insurance details',
    tags: ['Insurance Details'],
    summary: 'Updates insurance details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Insurance Detail ID'
            }
        }
    },
    body: {
        type: 'object',
        properties: insuranceDetailBodyProperties
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
                        insuranceId: { type: 'number' },
                        ...insuranceDetailBodyProperties
                    }
                }
            }
        }
    }
};

const getInsuranceDetailByIdSchema = {
    description: 'Get insurance details by ID',
    tags: ['Insurance Details'],
    summary: 'Retrieves insurance details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Insurance Detail ID'
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
                        insuranceId: { type: 'number' },
                        ...insuranceDetailBodyProperties
                    }
                }
            }
        }
    }
};

const getAllInsuranceDetailsSchema = {
    description: 'Get all insurance details',
    tags: ['Insurance Details'],
    summary: 'Retrieves all insurance details records',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            policyNumber: { type: 'string' },
            insuranceProvider: { type: 'string' }
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
                            insuranceId: { type: 'number' },
                            ...insuranceDetailBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const deleteInsuranceDetailSchema = {
    description: 'Delete insurance details',
    tags: ['Insurance Details'],
    summary: 'Deletes insurance details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Insurance Detail ID'
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
    createInsuranceDetailSchema,
    updateInsuranceDetailSchema,
    getInsuranceDetailByIdSchema,
    getAllInsuranceDetailsSchema,
    deleteInsuranceDetailSchema
};
