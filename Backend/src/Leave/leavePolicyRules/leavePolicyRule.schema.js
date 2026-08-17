const leavePolicyRuleResponseProperties = {
    leavePolicyRuleId: { type: 'number' },
    leavePolicyId: { type: 'number' },
    leaveTypeId: { type: 'number' },
    requestSubmissionDays: { type: 'number', nullable: true },
    requestSubmissionPeriod: { type: 'string', nullable: true },
    informLeaveGreaterThan: { type: 'number', nullable: true },
    informAfterDays: { type: 'number', nullable: true },
    informPeriod: { type: 'string', nullable: true },
    minLeaveDays: { type: 'number', nullable: true },
    maxLeaveDays: { type: 'number', nullable: true },
    annualRequestLimit: { type: 'number', nullable: true },
    isPaid: { type: 'boolean' },
    payMultiplier: { type: 'number', nullable: true },
    allowFileAttachment: { type: 'boolean' },
    attachmentRequiredAfterDays: { type: 'number', nullable: true },
    countHolidayDuring: { type: 'boolean' },
    countHolidayAfter: { type: 'boolean' },
    countHolidayBefore: { type: 'boolean' },
    optionalHolidayOnly: { type: 'boolean' },
    countWeekoffDuring: { type: 'boolean' },
    countWeekoffAfter: { type: 'boolean' },
    countWeekoffBefore: { type: 'boolean' },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createSchema = {
    description: 'Create a new leave policy rule',
    tags: ['LeavePolicyRule'],
    summary: 'Create a leave policy rule',
    body: {
        type: 'object',
        required: ['leavePolicyId', 'leaveTypeId'],
        properties: {
            leavePolicyId: { type: 'number' },
            leaveTypeId: { type: 'number' },
            requestSubmissionDays: { type: 'number', nullable: true },
            requestSubmissionPeriod: { type: 'string', nullable: true },
            informLeaveGreaterThan: { type: 'number', nullable: true },
            informAfterDays: { type: 'number', nullable: true },
            informPeriod: { type: 'string', nullable: true },
            minLeaveDays: { type: 'number', nullable: true },
            maxLeaveDays: { type: 'number', nullable: true },
            annualRequestLimit: { type: 'number', nullable: true },
            isPaid: { type: 'boolean', default: false },
            payMultiplier: { type: 'number', nullable: true },
            allowFileAttachment: { type: 'boolean', default: false },
            attachmentRequiredAfterDays: { type: 'number', nullable: true },
            countHolidayDuring: { type: 'boolean', default: false },
            countHolidayAfter: { type: 'boolean', default: false },
            countHolidayBefore: { type: 'boolean', default: false },
            optionalHolidayOnly: { type: 'boolean', default: false },
            countWeekoffDuring: { type: 'boolean', default: false },
            countWeekoffAfter: { type: 'boolean', default: false },
            countWeekoffBefore: { type: 'boolean', default: false },
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
                    properties: leavePolicyRuleResponseProperties
                }
            }
        }
    }
};

const getByIdSchema = {
    description: 'Get leave policy rule by ID',
    tags: ['LeavePolicyRule'],
    summary: 'Retrieve leave policy rule details',
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
                    properties: leavePolicyRuleResponseProperties
                }
            }
        }
    }
};

const getAllSchema = {
    description: 'Get all leave policy rules',
    tags: ['LeavePolicyRule'],
    summary: 'List all leave policy rules for a company',
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
                        properties: leavePolicyRuleResponseProperties
                    }
                }
            }
        }
    }
};

const updateSchema = {
    description: 'Update a leave policy rule',
    tags: ['LeavePolicyRule'],
    summary: 'Update leave policy rule',
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
            requestSubmissionDays: { type: 'number', nullable: true },
            requestSubmissionPeriod: { type: 'string', nullable: true },
            informLeaveGreaterThan: { type: 'number', nullable: true },
            informAfterDays: { type: 'number', nullable: true },
            informPeriod: { type: 'string', nullable: true },
            minLeaveDays: { type: 'number', nullable: true },
            maxLeaveDays: { type: 'number', nullable: true },
            annualRequestLimit: { type: 'number', nullable: true },
            isPaid: { type: 'boolean' },
            payMultiplier: { type: 'number', nullable: true },
            allowFileAttachment: { type: 'boolean' },
            attachmentRequiredAfterDays: { type: 'number', nullable: true },
            countHolidayDuring: { type: 'boolean' },
            countHolidayAfter: { type: 'boolean' },
            countHolidayBefore: { type: 'boolean' },
            optionalHolidayOnly: { type: 'boolean' },
            countWeekoffDuring: { type: 'boolean' },
            countWeekoffAfter: { type: 'boolean' },
            countWeekoffBefore: { type: 'boolean' },
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
                    properties: leavePolicyRuleResponseProperties
                }
            }
        }
    }
};

const deleteSchema = {
    description: 'Delete a leave policy rule',
    tags: ['LeavePolicyRule'],
    summary: 'Delete leave policy rule by ID',
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
