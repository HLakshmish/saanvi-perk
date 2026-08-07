const leaveTypeResponseProperties = {
    leaveTypeId: { type: 'number' },
    companyId: { type: 'number' },
    leaveCode: { type: 'string' },
    leaveName: { type: 'string' },
    remarks: { type: 'string', nullable: true },
    status: { type: 'boolean' },
    createdBy: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createLeaveTypeSchema = {
    description: 'Create a new leave type',
    tags: ['LeaveType'],
    summary: 'Create a leave type',
    body: {
        type: 'object',
        required: ['leaveCode', 'leaveName'],
        properties: {
            leaveCode: { type: 'string' },
            leaveName: { type: 'string' },
            remarks: { type: 'string' },
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
                    properties: leaveTypeResponseProperties
                }
            }
        }
    }
};

const getLeaveTypeByIdSchema = {
    description: 'Get leave type by ID',
    tags: ['LeaveType'],
    summary: 'Retrieve leave type details',
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
                    properties: leaveTypeResponseProperties
                }
            }
        }
    }
};

const getAllLeaveTypesSchema = {
    description: 'Get all leave types',
    tags: ['LeaveType'],
    summary: 'List all leave types for a company',
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
                        properties: leaveTypeResponseProperties
                    }
                }
            }
        }
    }
};

const updateLeaveTypeSchema = {
    description: 'Update a leave type',
    tags: ['LeaveType'],
    summary: 'Update leave type',
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
            leaveCode: { type: 'string' },
            leaveName: { type: 'string' },
            remarks: { type: 'string' },
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
                    properties: leaveTypeResponseProperties
                }
            }
        }
    }
};

const deleteLeaveTypeSchema = {
    description: 'Delete a leave type',
    tags: ['LeaveType'],
    summary: 'Delete leave type by ID',
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
    createLeaveTypeSchema,
    getLeaveTypeByIdSchema,
    getAllLeaveTypesSchema,
    updateLeaveTypeSchema,
    deleteLeaveTypeSchema
};
