const departmentResponseProperties = {
    departmentId: { type: 'number' },
    companyId: { type: 'number' },
    departmentCode: { type: 'string' },
    departmentName: { type: 'string' },
    departmentHead: { type: 'number', nullable: true },
    description: { type: 'string', nullable: true },
    status: { type: 'boolean' },
    createdBy: { type: 'number', nullable: true },
    updatedBy: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    headUser: {
        type: 'object',
        nullable: true,
        properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            officialEmail: { type: 'string' }
        }
    }
};

const createDepartmentSchema = {
    description: 'Create a new department',
    tags: ['Department'],
    summary: 'Create a department',
    body: {
        type: 'object',
        required: ['departmentCode', 'departmentName'],
        properties: {
            departmentCode: { type: 'string' },
            departmentName: { type: 'string' },
            departmentHead: { type: 'number', nullable: true },
            description: { type: 'string', nullable: true },
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
                    properties: departmentResponseProperties
                }
            }
        }
    }
};

const getDepartmentByIdSchema = {
    description: 'Get department by ID',
    tags: ['Department'],
    summary: 'Retrieve department details',
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
                    properties: departmentResponseProperties
                }
            }
        }
    }
};

const getAllDepartmentsSchema = {
    description: 'Get all departments',
    tags: ['Department'],
    summary: 'List all departments for a company',
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
                        properties: departmentResponseProperties
                    }
                }
            }
        }
    }
};

const updateDepartmentSchema = {
    description: 'Update a department',
    tags: ['Department'],
    summary: 'Update department details',
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
            departmentCode: { type: 'string' },
            departmentName: { type: 'string' },
            departmentHead: { type: 'number', nullable: true },
            description: { type: 'string', nullable: true },
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
                    properties: departmentResponseProperties
                }
            }
        }
    }
};

const deleteDepartmentSchema = {
    description: 'Delete a department',
    tags: ['Department'],
    summary: 'Delete department by ID',
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
    createDepartmentSchema,
    getDepartmentByIdSchema,
    getAllDepartmentsSchema,
    updateDepartmentSchema,
    deleteDepartmentSchema
};
