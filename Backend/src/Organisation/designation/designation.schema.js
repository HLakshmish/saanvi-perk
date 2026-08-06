const designationBodyProperties = {
    departmentId: { type: 'number' },
    designationCode: { type: 'string' },
    designationName: { type: 'string' },
    remarks: { type: 'string', nullable: true },
    status: { type: 'boolean' }
};

const createDesignationSchema = {
    description: 'Create a new designation',
    tags: ['Designation'],
    summary: 'Creates a new designation',
    body: {
        type: 'object',
        required: ['departmentId', 'designationCode', 'designationName'],
        properties: designationBodyProperties
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
                    properties: { designationId: { type: 'number' }, companyId: { type: 'number' }, ...designationBodyProperties }
                }
            }
        }
    }
};

const updateDesignationSchema = {
    description: 'Update an existing designation by ID',
    tags: ['Designation'],
    summary: 'Updates designation details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Designation ID' }
        }
    },
    body: {
        type: 'object',
        properties: designationBodyProperties
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
                    properties: { designationId: { type: 'number' }, companyId: { type: 'number' }, ...designationBodyProperties }
                }
            }
        }
    }
};

const getDesignationByIdSchema = {
    description: 'Get a designation by ID',
    tags: ['Designation'],
    summary: 'Retrieves a single designation',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Designation ID' }
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
                    properties: { designationId: { type: 'number' }, companyId: { type: 'number' }, ...designationBodyProperties }
                }
            }
        }
    }
};

const getAllDesignationsSchema = {
    description: 'Get all designations',
    tags: ['Designation'],
    summary: 'Retrieves a list of all designations',
    querystring: {
        type: 'object',
        properties: {
            departmentId: { type: 'number' },
            designationName: { type: 'string' },
            designationCode: { type: 'string' }
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
                        properties: { designationId: { type: 'number' }, companyId: { type: 'number' }, ...designationBodyProperties }
                    }
                }
            }
        }
    }
};

const deleteDesignationSchema = {
    description: 'Delete a designation by ID',
    tags: ['Designation'],
    summary: 'Deletes a designation',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Designation ID' }
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
    createDesignationSchema,
    updateDesignationSchema,
    getDesignationByIdSchema,
    getAllDesignationsSchema,
    deleteDesignationSchema
};
