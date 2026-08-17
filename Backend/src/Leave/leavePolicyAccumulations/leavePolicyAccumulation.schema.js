const leavePolicyAccumulationResponseProperties = {
    leavePolicyAccumulationId: { type: 'number' },
    leavePolicyId: { type: 'number' },
    leaveTypeId: { type: 'number' },
    autoAccumulate: { type: 'boolean' },
    considerDateOfJoining: { type: 'boolean' },
    considerDateOfProbation: { type: 'boolean' },
    accumulationStartDays: { type: 'number', nullable: true },
    accumulationAmount: { type: 'number', nullable: true },
    accumulationFrequency: { type: 'string', nullable: true },
    accumulationDay: { type: 'number', nullable: true },
    accumulationMonth: { type: 'number', nullable: true },
    expiryPeriod: { type: 'string', nullable: true },
    basedOnDaysPresent: { type: 'boolean' },
    presencePeriod: { type: 'string', nullable: true },
    considerForEncashment: { type: 'boolean' },
    maxLeaveBalance: { type: 'number', nullable: true },
    maxAccumulationPerYear: { type: 'number', nullable: true },
    maxNegativeBalance: { type: 'number', nullable: true },
    maxCarryForward: { type: 'number', nullable: true },
    remainingLeaveAction: { type: 'string', nullable: true },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createSchema = {
    description: 'Create a new leave policy accumulation',
    tags: ['LeavePolicyAccumulation'],
    summary: 'Create a leave policy accumulation',
    body: {
        type: 'object',
        required: ['leavePolicyId', 'leaveTypeId'],
        properties: {
            leavePolicyId: { type: 'number' },
            leaveTypeId: { type: 'number' },
            autoAccumulate: { type: 'boolean', default: false },
            considerDateOfJoining: { type: 'boolean', default: false },
            considerDateOfProbation: { type: 'boolean', default: false },
            accumulationStartDays: { type: 'number', nullable: true, default: 0 },
            accumulationAmount: { type: 'number', nullable: true },
            accumulationFrequency: { type: 'string', nullable: true },
            accumulationDay: { type: 'number', nullable: true },
            accumulationMonth: { type: 'number', nullable: true },
            expiryPeriod: { type: 'string', nullable: true },
            basedOnDaysPresent: { type: 'boolean', default: false },
            presencePeriod: { type: 'string', nullable: true },
            considerForEncashment: { type: 'boolean', default: false },
            maxLeaveBalance: { type: 'number', nullable: true },
            maxAccumulationPerYear: { type: 'number', nullable: true },
            maxNegativeBalance: { type: 'number', nullable: true },
            maxCarryForward: { type: 'number', nullable: true },
            remainingLeaveAction: { type: 'string', nullable: true },
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
                    properties: leavePolicyAccumulationResponseProperties
                }
            }
        }
    }
};

const getByIdSchema = {
    description: 'Get leave policy accumulation by ID',
    tags: ['LeavePolicyAccumulation'],
    summary: 'Retrieve leave policy accumulation details',
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
                    properties: leavePolicyAccumulationResponseProperties
                }
            }
        }
    }
};

const getAllSchema = {
    description: 'Get all leave policy accumulations',
    tags: ['LeavePolicyAccumulation'],
    summary: 'List all leave policy accumulations for a company',
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
                        properties: leavePolicyAccumulationResponseProperties
                    }
                }
            }
        }
    }
};

const updateSchema = {
    description: 'Update a leave policy accumulation',
    tags: ['LeavePolicyAccumulation'],
    summary: 'Update leave policy accumulation',
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
            leavePolicyId: { type: 'number' },
            leaveTypeId: { type: 'number' },
            autoAccumulate: { type: 'boolean' },
            considerDateOfJoining: { type: 'boolean' },
            considerDateOfProbation: { type: 'boolean' },
            accumulationStartDays: { type: 'number', nullable: true },
            accumulationAmount: { type: 'number', nullable: true },
            accumulationFrequency: { type: 'string', nullable: true },
            accumulationDay: { type: 'number', nullable: true },
            accumulationMonth: { type: 'number', nullable: true },
            expiryPeriod: { type: 'string', nullable: true },
            basedOnDaysPresent: { type: 'boolean' },
            presencePeriod: { type: 'string', nullable: true },
            considerForEncashment: { type: 'boolean' },
            maxLeaveBalance: { type: 'number', nullable: true },
            maxAccumulationPerYear: { type: 'number', nullable: true },
            maxNegativeBalance: { type: 'number', nullable: true },
            maxCarryForward: { type: 'number', nullable: true },
            remainingLeaveAction: { type: 'string', nullable: true },
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
                    properties: leavePolicyAccumulationResponseProperties
                }
            }
        }
    }
};

const deleteSchema = {
    description: 'Delete a leave policy accumulation',
    tags: ['LeavePolicyAccumulation'],
    summary: 'Delete leave policy accumulation by ID',
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
