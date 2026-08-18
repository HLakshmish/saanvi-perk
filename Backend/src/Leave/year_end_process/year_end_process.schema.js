const yearEndProcessResponseProperties = {
    processId: { type: 'number' },
    companyId: { type: 'number' },
    userId: { type: 'number' },
    leaveTypeId: { type: 'number' },
    leavePolicyId: { type: 'number', nullable: true },
    year: { type: 'number' },
    closingBalance: { type: 'number' },
    carryForwardLeaves: { type: 'number' },
    encashedLeaves: { type: 'number' },
    lapsedLeaves: { type: 'number' },
    encashmentAmount: { type: 'number', nullable: true },
    processedBy: { type: 'number', nullable: true },
    processDate: { type: 'string', format: 'date-time' },
    remarks: { type: 'string', nullable: true },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createYearEndProcessSchema = {
    description: 'Create a new year end process record',
    tags: ['Year End Process'],
    summary: 'Create a year end process',
    body: {
        type: 'object',
        required: [
            'userId', 'leaveTypeId', 'year', 'closingBalance',
            'carryForwardLeaves', 'encashedLeaves', 'lapsedLeaves'
        ],
        properties: {
            userId: { type: 'number' },
            leaveTypeId: { type: 'number' },
            leavePolicyId: { type: 'number', nullable: true },
            year: { type: 'number' },
            closingBalance: { type: 'number' },
            carryForwardLeaves: { type: 'number' },
            encashedLeaves: { type: 'number' },
            lapsedLeaves: { type: 'number' },
            encashmentAmount: { type: 'number', nullable: true },
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
                    properties: yearEndProcessResponseProperties
                }
            }
        }
    }
};

const getYearEndProcessByIdSchema = {
    description: 'Get year end process by ID',
    tags: ['Year End Process'],
    summary: 'Retrieve year end process details',
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
                    properties: yearEndProcessResponseProperties
                }
            }
        }
    }
};

const getAllYearEndProcessesSchema = {
    description: 'Get all year end processes',
    tags: ['Year End Process'],
    summary: 'List all year end processes for a company',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            userId: { type: 'number' },
            year: { type: 'number' }
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
                        properties: yearEndProcessResponseProperties
                    }
                }
            }
        }
    }
};

const updateYearEndProcessSchema = {
    description: 'Update a year end process',
    tags: ['Year End Process'],
    summary: 'Update year end process details',
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
            closingBalance: { type: 'number' },
            carryForwardLeaves: { type: 'number' },
            encashedLeaves: { type: 'number' },
            lapsedLeaves: { type: 'number' },
            encashmentAmount: { type: 'number', nullable: true },
            remarks: { type: 'string', nullable: true },
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
                    properties: yearEndProcessResponseProperties
                }
            }
        }
    }
};

const deleteYearEndProcessSchema = {
    description: 'Delete a year end process',
    tags: ['Year End Process'],
    summary: 'Delete year end process by ID',
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
    createYearEndProcessSchema,
    getYearEndProcessByIdSchema,
    getAllYearEndProcessesSchema,
    updateYearEndProcessSchema,
    deleteYearEndProcessSchema
};
