const compOffRequestResponseProperties = {
    id: { type: 'number' },
    companyId: { type: 'number' },
    userId: { type: 'number' },
    workDate: { type: 'string', format: 'date-time' },
    requestType: { type: 'string', nullable: true },
    holidayOrWeekOffName: { type: 'string', nullable: true },
    reason: { type: 'string' },
    status: { type: 'string' },
    reportingToId: { type: 'number', nullable: true },
    approvedBy: { type: 'number', nullable: true },
    approvedAt: { type: 'string', format: 'date-time', nullable: true },
    rejectionReason: { type: 'string', nullable: true },
    remarks: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: {
        type: 'object',
        nullable: true,
        properties: {
            userId: { type: 'number' },
            firstName: { type: 'string' },
            lastName: { type: 'string', nullable: true },
            employeeCode: { type: 'string', nullable: true }
        }
    },
    reportingTo: {
        type: 'object',
        nullable: true,
        properties: {
            userId: { type: 'number' },
            firstName: { type: 'string' },
            lastName: { type: 'string', nullable: true }
        }
    },
    approvedUser: {
        type: 'object',
        nullable: true,
        properties: {
            userId: { type: 'number' },
            firstName: { type: 'string' },
            lastName: { type: 'string', nullable: true }
        }
    }
};

const createCompOffRequestSchema = {
    description: 'Create a new Comp-Off Work Permission Request before working on a holiday or week-off',
    tags: ['Comp Off Request'],
    summary: 'Request permission to work on a holiday or week-off',
    body: {
        type: 'object',
        required: ['workDate', 'reason'],
        properties: {
            workDate: { type: 'string', description: 'YYYY-MM-DD or ISO date string' },
            requestType: { type: 'string', enum: ['HOLIDAY', 'WEEK_OFF', 'OTHER'], default: 'HOLIDAY' },
            holidayOrWeekOffName: { type: 'string', nullable: true },
            reason: { type: 'string' },
            userId: { type: 'number', description: 'Target user ID (admin override, optional)' },
            companyId: { type: 'number', nullable: true }
        }
    },
    response: {
        201: {
            description: 'Comp-Off work permission request created successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: compOffRequestResponseProperties
                }
            }
        }
    }
};

const getCompOffRequestByIdSchema = {
    description: 'Get Comp-Off Request details by ID',
    tags: ['Comp Off Request'],
    summary: 'Retrieve Comp-Off Request by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Comp-Off Request details',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: compOffRequestResponseProperties
                }
            }
        }
    }
};

const getAllCompOffRequestsSchema = {
    description: 'Get all Comp-Off Requests with optional filters',
    tags: ['Comp Off Request'],
    summary: 'List all Comp-Off Requests',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            companyId: { type: 'number' },
            status: { type: 'string' },
            reportingToId: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'List of Comp-Off Requests',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: compOffRequestResponseProperties
                    }
                }
            }
        }
    }
};

const updateCompOffRequestStatusSchema = {
    description: 'Approve or Reject a Comp-Off Work Permission Request',
    tags: ['Comp Off Request'],
    summary: 'Update request status (Approve / Reject)',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'CANCELLED'] },
            rejectionReason: { type: 'string', nullable: true },
            remarks: { type: 'string', nullable: true }
        }
    },
    response: {
        200: {
            description: 'Status updated successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: compOffRequestResponseProperties
                }
            }
        }
    }
};

const deleteCompOffRequestSchema = {
    description: 'Delete a Comp-Off Request by ID',
    tags: ['Comp Off Request'],
    summary: 'Delete Comp-Off Request',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Request deleted successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

module.exports = {
    createCompOffRequestSchema,
    getCompOffRequestByIdSchema,
    getAllCompOffRequestsSchema,
    updateCompOffRequestStatusSchema,
    deleteCompOffRequestSchema
};
