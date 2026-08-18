const compOffPolicyResponseProperties = {
    id: { type: 'number' },
    companyId: { type: 'number' },
    policyName: { type: 'string' },
    leaveTypeId: { type: 'number' },
    weekOffWorked: { type: 'boolean' },
    holidayWorked: { type: 'boolean' },
    otHoursEnabled: { type: 'boolean' },
    otFullDayHours: { type: 'number', nullable: true },
    otFullDayMinutes: { type: 'number', nullable: true },
    otHalfDayHours: { type: 'number', nullable: true },
    otHalfDayMinutes: { type: 'number', nullable: true },
    regularHoursEnabled: { type: 'boolean' },
    regularFullDayHours: { type: 'number', nullable: true },
    regularFullDayMinutes: { type: 'number', nullable: true },
    regularHalfDayHours: { type: 'number', nullable: true },
    regularHalfDayMinutes: { type: 'number', nullable: true },
    availabilityType: { type: 'string' },
    availabilityDays: { type: 'number', nullable: true },
    accumulationType: { type: 'string' },
    requestRequired: { type: 'boolean' },
    requestDeadlineType: { type: 'string', nullable: true },
    requestWithinDays: { type: 'number', nullable: true },
    maxRequestsPerMonth: { type: 'number', nullable: true },
    maxRequestsPerYear: { type: 'number', nullable: true },
    status: { type: 'boolean' },
    createdBy: { type: 'number', nullable: true },
    updatedBy: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createCompOffPolicySchema = {
    description: 'Create a new Comp Off Policy',
    tags: ['Comp Off Policy'],
    summary: 'Create a Comp Off Policy',
    body: {
        type: 'object',
        required: [
            'policyName', 'leaveTypeId', 'availabilityType', 'accumulationType'
        ],
        properties: {
            policyName: { type: 'string' },
            leaveTypeId: { type: 'number' },
            weekOffWorked: { type: 'boolean', default: false },
            holidayWorked: { type: 'boolean', default: false },
            otHoursEnabled: { type: 'boolean', default: false },
            otFullDayHours: { type: 'number', nullable: true },
            otFullDayMinutes: { type: 'number', nullable: true },
            otHalfDayHours: { type: 'number', nullable: true },
            otHalfDayMinutes: { type: 'number', nullable: true },
            regularHoursEnabled: { type: 'boolean', default: false },
            regularFullDayHours: { type: 'number', nullable: true },
            regularFullDayMinutes: { type: 'number', nullable: true },
            regularHalfDayHours: { type: 'number', nullable: true },
            regularHalfDayMinutes: { type: 'number', nullable: true },
            availabilityType: { type: 'string' },
            availabilityDays: { type: 'number', nullable: true },
            accumulationType: { type: 'string' },
            requestRequired: { type: 'boolean', default: false },
            requestDeadlineType: { type: 'string', nullable: true },
            requestWithinDays: { type: 'number', nullable: true },
            maxRequestsPerMonth: { type: 'number', nullable: true },
            maxRequestsPerYear: { type: 'number', nullable: true },
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
                    properties: compOffPolicyResponseProperties
                }
            }
        }
    }
};

const getCompOffPolicyByIdSchema = {
    description: 'Get Comp Off Policy by ID',
    tags: ['Comp Off Policy'],
    summary: 'Retrieve Comp Off Policy details',
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
                    properties: compOffPolicyResponseProperties
                }
            }
        }
    }
};

const getAllCompOffPoliciesSchema = {
    description: 'Get all Comp Off Policies',
    tags: ['Comp Off Policy'],
    summary: 'List all Comp Off Policies for a company',
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
                        properties: compOffPolicyResponseProperties
                    }
                }
            }
        }
    }
};

const updateCompOffPolicySchema = {
    description: 'Update a Comp Off Policy',
    tags: ['Comp Off Policy'],
    summary: 'Update Comp Off Policy details',
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
            policyName: { type: 'string' },
            leaveTypeId: { type: 'number' },
            weekOffWorked: { type: 'boolean' },
            holidayWorked: { type: 'boolean' },
            otHoursEnabled: { type: 'boolean' },
            otFullDayHours: { type: 'number', nullable: true },
            otFullDayMinutes: { type: 'number', nullable: true },
            otHalfDayHours: { type: 'number', nullable: true },
            otHalfDayMinutes: { type: 'number', nullable: true },
            regularHoursEnabled: { type: 'boolean' },
            regularFullDayHours: { type: 'number', nullable: true },
            regularFullDayMinutes: { type: 'number', nullable: true },
            regularHalfDayHours: { type: 'number', nullable: true },
            regularHalfDayMinutes: { type: 'number', nullable: true },
            availabilityType: { type: 'string' },
            availabilityDays: { type: 'number', nullable: true },
            accumulationType: { type: 'string' },
            requestRequired: { type: 'boolean' },
            requestDeadlineType: { type: 'string', nullable: true },
            requestWithinDays: { type: 'number', nullable: true },
            maxRequestsPerMonth: { type: 'number', nullable: true },
            maxRequestsPerYear: { type: 'number', nullable: true },
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
                    properties: compOffPolicyResponseProperties
                }
            }
        }
    }
};

const deleteCompOffPolicySchema = {
    description: 'Delete a Comp Off Policy',
    tags: ['Comp Off Policy'],
    summary: 'Delete Comp Off Policy by ID',
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
    createCompOffPolicySchema,
    getCompOffPolicyByIdSchema,
    getAllCompOffPoliciesSchema,
    updateCompOffPolicySchema,
    deleteCompOffPolicySchema
};
