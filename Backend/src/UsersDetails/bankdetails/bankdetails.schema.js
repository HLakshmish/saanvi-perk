const bankDetailsBodyProperties = {
    userId: { type: 'number' },
    accountHolderName: { type: 'string' },
    bankName: { type: 'string' },
    branchName: { type: 'string' },
    accountNumber: { type: 'string' },
    ifscCode: { type: 'string' },
    accountType: { type: 'string' },
    upiId: { type: 'string', nullable: true },
    salaryAccount: { type: 'boolean', default: false },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createBankDetailsSchema = {
    description: 'Create bank details',
    tags: ['Bank Details'],
    summary: 'Creates bank details for a user',
    body: {
        type: 'object',
        required: [
            'userId', 
            'accountHolderName', 
            'bankName', 
            'branchName', 
            'accountNumber', 
            'ifscCode', 
            'accountType'
        ],
        properties: bankDetailsBodyProperties
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
                        bankId: { type: 'number' },
                        ...bankDetailsBodyProperties
                    }
                }
            }
        }
    }
};

const updateBankDetailsSchema = {
    description: 'Update bank details',
    tags: ['Bank Details'],
    summary: 'Updates bank details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Bank Details ID'
            }
        }
    },
    body: {
        type: 'object',
        properties: bankDetailsBodyProperties
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
                        bankId: { type: 'number' },
                        ...bankDetailsBodyProperties
                    }
                }
            }
        }
    }
};

const getBankDetailsByIdSchema = {
    description: 'Get bank details by ID',
    tags: ['Bank Details'],
    summary: 'Retrieves bank details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Bank Details ID'
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
                        bankId: { type: 'number' },
                        ...bankDetailsBodyProperties
                    }
                }
            }
        }
    }
};

const getAllBankDetailsSchema = {
    description: 'Get all bank details',
    tags: ['Bank Details'],
    summary: 'Retrieves all bank details records',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            accountNumber: { type: 'string' },
            ifscCode: { type: 'string' }
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
                            bankId: { type: 'number' },
                            ...bankDetailsBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const deleteBankDetailsSchema = {
    description: 'Delete bank details',
    tags: ['Bank Details'],
    summary: 'Deletes bank details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Bank Details ID'
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
    createBankDetailsSchema,
    updateBankDetailsSchema,
    getBankDetailsByIdSchema,
    getAllBankDetailsSchema,
    deleteBankDetailsSchema
};
