const parentInfoBodyProperties = {
    userId: { type: 'number' },

    fatherName: { type: 'string', nullable: true },
    fatherMobile: { type: 'string', nullable: true },
    fatherOccupation: { type: 'string', nullable: true },

    motherName: { type: 'string', nullable: true },
    motherMobile: { type: 'string', nullable: true },
    motherOccupation: { type: 'string', nullable: true },

    guardianName: { type: 'string', nullable: true },
    guardianMobile: { type: 'string', nullable: true },
    relationship: { type: 'string', nullable: true }
};

const createParentInfoSchema = {
    description: 'Create parents information',
    tags: ['Parents Information'],
    summary: 'Creates parents information for a user',
    body: {
        type: 'object',
        required: ['userId'],
        properties: parentInfoBodyProperties
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
                    properties: {
                        parentId: { type: 'number' },
                        ...parentInfoBodyProperties
                    }
                }
            }
        }
    }
};

const updateParentInfoSchema = {
    description: 'Update parents information',
    tags: ['Parents Information'],
    summary: 'Updates parents information',
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: {
                type: 'string',
                description: 'User ID'
            }
        }
    },
    body: {
        type: 'object',
        properties: parentInfoBodyProperties
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
                    properties: {
                        parentId: { type: 'number' },
                        ...parentInfoBodyProperties
                    }
                }
            }
        }
    }
};

const getParentInfoByUserIdSchema = {
    description: 'Get parents information by User ID',
    tags: ['Parents Information'],
    summary: 'Retrieves parents information',
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: {
                type: 'string',
                description: 'User ID'
            }
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
                    properties: {
                        parentId: { type: 'number' },
                        ...parentInfoBodyProperties
                    }
                }
            }
        }
    }
};

const getAllParentInfoSchema = {
    description: 'Get all parents information',
    tags: ['Parents Information'],
    summary: 'Retrieves all parents information records',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            fatherName: { type: 'string' },
            motherName: { type: 'string' },
            guardianName: { type: 'string' }
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
                        properties: {
                            parentId: { type: 'number' },
                            ...parentInfoBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const deleteParentInfoSchema = {
    description: 'Delete parents information',
    tags: ['Parents Information'],
    summary: 'Deletes parents information',
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: {
                type: 'string',
                description: 'User ID'
            }
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
    createParentInfoSchema,
    updateParentInfoSchema,
    getParentInfoByUserIdSchema,
    getAllParentInfoSchema,
    deleteParentInfoSchema
};