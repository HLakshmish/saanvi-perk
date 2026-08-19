const compOffAssignResponseProperties = {
    id: { type: 'number' },
    companyId: { type: 'number' },
    userId: { type: 'number' },
    policyId: { type: 'number' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    status: { type: 'boolean' },
    createdBy: { type: 'number', nullable: true },
    updatedBy: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createCompOffAssignSchema = {
    description: 'Assign a Comp Off Policy to one or more users',
    tags: ['Comp Off Assign'],
    summary: 'Assign Comp Off Policy',
    body: {
        type: 'object',
        required: ['userIds', 'policyId', 'startDate', 'endDate'],
        properties: {
            userIds: { 
                type: 'array',
                items: { type: 'number' }
            },
            policyId: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
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
                count: { type: 'number' }
            }
        }
    }
};

const getCompOffAssignByIdSchema = {
    description: 'Get Comp Off Assignment by ID',
    tags: ['Comp Off Assign'],
    summary: 'Retrieve Comp Off Assignment details',
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
                    properties: compOffAssignResponseProperties
                }
            }
        }
    }
};

const getAllCompOffAssignsSchema = {
    description: 'Get all Comp Off Assignments',
    tags: ['Comp Off Assign'],
    summary: 'List all Comp Off Assignments for a company',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            userId: { type: 'number', description: 'Filter by user ID' },
            policyId: { type: 'number', description: 'Filter by policy ID' }
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
                        properties: compOffAssignResponseProperties
                    }
                }
            }
        }
    }
};

const updateCompOffAssignSchema = {
    description: 'Update a Comp Off Assignment',
    tags: ['Comp Off Assign'],
    summary: 'Update Comp Off Assignment details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    body: {
        type: 'object',
        properties: {
            policyId: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'boolean' },
            companyId: { type: 'number', description: 'Required for OWNER' }
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
                    properties: compOffAssignResponseProperties
                }
            }
        }
    }
};

const deleteCompOffAssignSchema = {
    description: 'Delete a Comp Off Assignment',
    tags: ['Comp Off Assign'],
    summary: 'Delete Comp Off Assignment by ID',
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
    createCompOffAssignSchema,
    getCompOffAssignByIdSchema,
    getAllCompOffAssignsSchema,
    updateCompOffAssignSchema,
    deleteCompOffAssignSchema
};
