const leavePolicyResponseProperties = {
    leavePolicyId: { type: 'number' },
    companyId: { type: 'number' },
    policyName: { type: 'string' },
    policyCode: { type: 'string' },
    remarks: { type: 'string', nullable: true },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createSchema = {
    description: 'Create a new leave policy',
    tags: ['LeavePolicy'],
    summary: 'Create a leave policy',
    body: {
        type: 'object',
        required: ['policyName', 'policyCode'],
        properties: {
            policyName: { type: 'string' },
            policyCode: { type: 'string' },
            remarks: { type: 'string', nullable: true },
            status: { type: 'boolean', default: true },
            companyId: { type: 'number', description: 'Required for OWNER' }
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
                    properties: leavePolicyResponseProperties
                }
            }
        }
    }
};

const getByIdSchema = {
    description: 'Get leave policy by ID',
    tags: ['LeavePolicy'],
    summary: 'Retrieve leave policy details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
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
                    properties: leavePolicyResponseProperties
                }
            }
        }
    }
};

const getAllSchema = {
    description: 'Get all leave policies',
    tags: ['LeavePolicy'],
    summary: 'List all leave policies for a company',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
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
                        properties: leavePolicyResponseProperties
                    }
                }
            }
        }
    }
};

const updateSchema = {
    description: 'Update a leave policy',
    tags: ['LeavePolicy'],
    summary: 'Update leave policy',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
        }
    },
    body: {
        type: 'object',
        properties: {
            policyName: { type: 'string' },
            policyCode: { type: 'string' },
            remarks: { type: 'string', nullable: true },
            status: { type: 'boolean' }
        }
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
                    properties: leavePolicyResponseProperties
                }
            }
        }
    }
};

const deleteSchema = {
    description: 'Delete a leave policy',
    tags: ['LeavePolicy'],
    summary: 'Delete leave policy by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
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
    createSchema,
    getByIdSchema,
    getAllSchema,
    updateSchema,
    deleteSchema
};
