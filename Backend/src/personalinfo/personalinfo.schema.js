const personalInfoBodyProperties = {
    userId: { type: 'number' },

    dateOfBirth: { type: 'string', format: 'date-time', nullable: true },
    gender: { type: 'string', nullable: true },
    maritalStatus: { type: 'string', nullable: true },
    bloodGroup: { type: 'string', nullable: true },
    nationality: { type: 'string', nullable: true },
    religion: { type: 'string', nullable: true },
    motherTongue: { type: 'string', nullable: true },

    aadhaarNumber: { type: 'string', nullable: true },
    panNumber: { type: 'string', nullable: true },
    passportNumber: { type: 'string', nullable: true },
    drivingLicenseNumber: { type: 'string', nullable: true },

    officialEmail: { type: 'string', format: 'email', nullable: true },
    personalEmail: { type: 'string', format: 'email', nullable: true },
    profilePhoto: { type: 'string', nullable: true }
};

const createPersonalInfoSchema = {
    description: 'Create personal information',
    tags: ['Personal Information'],
    summary: 'Creates personal information for a user',
    body: {
        type: 'object',
        required: ['userId'],
        properties: personalInfoBodyProperties
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
                        personalInfoId: { type: 'number' },
                        ...personalInfoBodyProperties
                    }
                }
            }
        }
    }
};

const updatePersonalInfoSchema = {
    description: 'Update personal information',
    tags: ['Personal Information'],
    summary: 'Updates personal information',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Personal Information ID'
            }
        }
    },
    body: {
        type: 'object',
        properties: personalInfoBodyProperties
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
                        personalInfoId: { type: 'number' },
                        ...personalInfoBodyProperties
                    }
                }
            }
        }
    }
};

const getPersonalInfoByIdSchema = {
    description: 'Get personal information by ID',
    tags: ['Personal Information'],
    summary: 'Retrieves personal information',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Personal Information ID'
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
                        personalInfoId: { type: 'number' },
                        ...personalInfoBodyProperties
                    }
                }
            }
        }
    }
};

const getAllPersonalInfoSchema = {
    description: 'Get all personal information',
    tags: ['Personal Information'],
    summary: 'Retrieves all personal information records',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            officialEmail: { type: 'string' },
            personalEmail: { type: 'string' },
            aadhaarNumber: { type: 'string' },
            panNumber: { type: 'string' },
            passportNumber: { type: 'string' }
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
                            personalInfoId: { type: 'number' },
                            ...personalInfoBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const deletePersonalInfoSchema = {
    description: 'Delete personal information',
    tags: ['Personal Information'],
    summary: 'Deletes personal information',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                description: 'Personal Information ID'
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
    createPersonalInfoSchema,
    updatePersonalInfoSchema,
    getPersonalInfoByIdSchema,
    getAllPersonalInfoSchema,
    deletePersonalInfoSchema
};