const leaveRequestResponseProperties = {
    leaveRequestId: { type: 'number' },
    companyId: { type: 'number' },
    userId: { type: 'number' },
    leaveTypeId: { type: 'number' },
    fromDate: { type: 'string', format: 'date-time' },
    toDate: { type: 'string', format: 'date-time' },
    numberOfDays: { type: 'number' },
    reason: { type: 'string' },
    status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
    approvedBy: { type: 'number', nullable: true },
    approvedAt: { type: 'string', format: 'date-time', nullable: true },
    rejectionReason: { type: 'string', nullable: true },
    remarks: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createLeaveRequestSchema = {
    description: 'Create a new leave request',
    tags: ['LeaveRequest'],
    summary: 'Create a leave request',
    body: {
        type: 'object',
        required: ['leaveTypeId', 'fromDate', 'toDate', 'numberOfDays', 'reason'],
        properties: {
            leaveTypeId: { type: 'number' },
            fromDate: { type: 'string', format: 'date-time' },
            toDate: { type: 'string', format: 'date-time' },
            numberOfDays: { type: 'number' },
            reason: { type: 'string' },
            userId: { type: 'number', description: 'Required for HR/ADMIN to apply for someone else' },
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
                    properties: leaveRequestResponseProperties
                }
            }
        }
    }
};

const getLeaveRequestByIdSchema = {
    description: 'Get leave request by ID',
    tags: ['LeaveRequest'],
    summary: 'Retrieve leave request details',
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
                    properties: leaveRequestResponseProperties
                }
            }
        }
    }
};

const getAllLeaveRequestsSchema = {
    description: 'Get all leave requests',
    tags: ['LeaveRequest'],
    summary: 'List all leave requests for a company',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            userId: { type: 'number', description: 'Filter by specific user' }
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
                        properties: leaveRequestResponseProperties
                    }
                }
            }
        }
    }
};

const updateLeaveRequestStatusSchema = {
    description: 'Update a leave request status',
    tags: ['LeaveRequest'],
    summary: 'Approve, Reject or Cancel leave request',
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
        required: ['status'],
        properties: {
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
            rejectionReason: { type: 'string' },
            remarks: { type: 'string' }
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
                    properties: leaveRequestResponseProperties
                }
            }
        }
    }
};

const deleteLeaveRequestSchema = {
    description: 'Delete a leave request',
    tags: ['LeaveRequest'],
    summary: 'Delete leave request by ID',
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
    createLeaveRequestSchema,
    getLeaveRequestByIdSchema,
    getAllLeaveRequestsSchema,
    updateLeaveRequestStatusSchema,
    deleteLeaveRequestSchema
};
