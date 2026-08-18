const leaveAccumulationResponseProperties = {
    leaveAccumulationId: { type: 'number' },
    companyId: { type: 'number' },
    userId: { type: 'number' },
    leaveTypeId: { type: 'number' },
    leavePolicyId: { type: 'number', nullable: true },
    accumulationDate: { type: 'string', format: 'date-time' },
    numberOfLeaves: { type: 'number' },
    isOpeningBalance: { type: 'boolean' },
    accumulationPeriodFrom: { type: 'string', format: 'date-time' },
    accumulationPeriodTo: { type: 'string', format: 'date-time' },
    availabilityPeriodFrom: { type: 'string', format: 'date-time' },
    availabilityPeriodTo: { type: 'string', format: 'date-time' },
    note: { type: 'string', nullable: true },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createLeaveAccumulationSchema = {
    description: 'Create a new leave accumulation',
    tags: ['Leave Accumulation'],
    summary: 'Create a leave accumulation',
    body: {
        type: 'object',
        required: [
            'userId', 'leaveTypeId', 'accumulationDate', 'numberOfLeaves',
            'accumulationPeriodFrom', 'accumulationPeriodTo',
            'availabilityPeriodFrom', 'availabilityPeriodTo'
        ],
        properties: {
            userId: { type: 'number' },
            leaveTypeId: { type: 'number' },
            leavePolicyId: { type: 'number', nullable: true },
            accumulationDate: { type: 'string', format: 'date-time' },
            numberOfLeaves: { type: 'number' },
            isOpeningBalance: { type: 'boolean', default: false },
            accumulationPeriodFrom: { type: 'string', format: 'date-time' },
            accumulationPeriodTo: { type: 'string', format: 'date-time' },
            availabilityPeriodFrom: { type: 'string', format: 'date-time' },
            availabilityPeriodTo: { type: 'string', format: 'date-time' },
            note: { type: 'string', nullable: true },
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
                    properties: leaveAccumulationResponseProperties
                }
            }
        }
    }
};

const getLeaveAccumulationByIdSchema = {
    description: 'Get leave accumulation by ID',
    tags: ['Leave Accumulation'],
    summary: 'Retrieve leave accumulation details',
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
                    properties: leaveAccumulationResponseProperties
                }
            }
        }
    }
};

const getAllLeaveAccumulationsSchema = {
    description: 'Get all leave accumulations',
    tags: ['Leave Accumulation'],
    summary: 'List all leave accumulations for a company',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            userId: { type: 'number' },
            leaveTypeId: { type: 'number' }
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
                        properties: leaveAccumulationResponseProperties
                    }
                }
            }
        }
    }
};

const updateLeaveAccumulationSchema = {
    description: 'Update a leave accumulation',
    tags: ['Leave Accumulation'],
    summary: 'Update leave accumulation details',
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
            leavePolicyId: { type: 'number', nullable: true },
            accumulationDate: { type: 'string', format: 'date-time' },
            numberOfLeaves: { type: 'number' },
            isOpeningBalance: { type: 'boolean' },
            accumulationPeriodFrom: { type: 'string', format: 'date-time' },
            accumulationPeriodTo: { type: 'string', format: 'date-time' },
            availabilityPeriodFrom: { type: 'string', format: 'date-time' },
            availabilityPeriodTo: { type: 'string', format: 'date-time' },
            note: { type: 'string', nullable: true },
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
                    properties: leaveAccumulationResponseProperties
                }
            }
        }
    }
};

const deleteLeaveAccumulationSchema = {
    description: 'Delete a leave accumulation',
    tags: ['Leave Accumulation'],
    summary: 'Delete leave accumulation by ID',
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
    createLeaveAccumulationSchema,
    getLeaveAccumulationByIdSchema,
    getAllLeaveAccumulationsSchema,
    updateLeaveAccumulationSchema,
    deleteLeaveAccumulationSchema
};
