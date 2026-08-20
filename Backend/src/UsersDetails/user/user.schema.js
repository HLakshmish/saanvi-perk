const userResponseProperties = {
    userId: { type: 'number' },
    employeeCode: { type: 'string' },
    companyId: { type: 'number' },
    roleIds: { type: 'array', items: { type: 'number' } },
    departmentId: { type: 'number', nullable: true },
    designationId: { type: 'number', nullable: true },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    officialEmail: { type: 'string' },
    phoneNumber: { type: 'string', nullable: true },
    employmentType: { type: 'string' },
    joiningDate: { type: 'string', format: 'date-time' },
    probationEndDate: { type: 'string', format: 'date-time', nullable: true },
    reportingToId: { type: 'number', nullable: true },
    shiftId: { type: 'number', nullable: true },
    status: { type: 'string' },
    lastLogin: { type: 'string', format: 'date-time', nullable: true },
    createdBy: { type: 'number', nullable: true },
    updatedBy: { type: 'number', nullable: true },
    profilePic: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    dateOfBirth: { type: 'string', format: 'date-time', nullable: true },
    roles: {
        type: 'array',
        nullable: true,
        items: {
            type: 'object',
            properties: {
                roleId: { type: 'number' },
                roleName: { type: 'string' }
            }
        }
    },
    department: {
        type: 'object',
        nullable: true,
        properties: {
            departmentName: { type: 'string' }
        }
    },
    designation: {
        type: 'object',
        nullable: true,
        properties: {
            designationName: { type: 'string' }
        }
    }
};

const createUserSchema = {
    description: 'Create a new user/employee',
    tags: ['User'],
    summary: 'Create a user',
    body: {
        type: 'object',
        required: ['employeeCode', 'roleIds', 'firstName', 'lastName', 'officialEmail', 'password', 'employmentType', 'joiningDate', 'dateOfBirth'],
        properties: {
            employeeCode: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            roleIds: { type: 'array', items: { type: 'number' } },
            departmentId: { type: 'number', nullable: true },
            designationId: { type: 'number', nullable: true },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            officialEmail: { type: 'string' },
            phoneNumber: { type: 'string', nullable: true },
            password: { type: 'string' },
            employmentType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] },
            joiningDate: { type: 'string', format: 'date-time' },
            probationEndDate: { type: 'string', format: 'date-time', nullable: true },
            reportingToId: { type: 'number', nullable: true },
            shiftId: { type: 'number', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'RESIGNED', 'TERMINATED'], default: 'ACTIVE' },
            profilePic: { type: 'string', nullable: true },
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
                    properties: userResponseProperties
                }
            }
        }
    }
};

const getUserByIdSchema = {
    description: 'Get user by ID',
    tags: ['User'],
    summary: 'Retrieve user details',
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
                    properties: userResponseProperties
                }
            }
        }
    }
};

const getAllUsersSchema = {
    description: 'Get all users',
    tags: ['User'],
    summary: 'List all users for a company',
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
                        properties: userResponseProperties
                    }
                }
            }
        }
    }
};

const updateUserSchema = {
    description: 'Update a user',
    tags: ['User'],
    summary: 'Update user details',
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
            employeeCode: { type: 'string' },
            roleIds: { type: 'array', items: { type: 'number' } },
            departmentId: { type: 'number', nullable: true },
            designationId: { type: 'number', nullable: true },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            officialEmail: { type: 'string' },
            phoneNumber: { type: 'string', nullable: true },
            password: { type: 'string', nullable: true },
            employmentType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] },
            joiningDate: { type: 'string', format: 'date-time' },
            probationEndDate: { type: 'string', format: 'date-time', nullable: true },
            reportingToId: { type: 'number', nullable: true },
            shiftId: { type: 'number', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'RESIGNED', 'TERMINATED'] },
            profilePic: { type: 'string', nullable: true }
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
                    properties: userResponseProperties
                }
            }
        }
    }
};

const deleteUserSchema = {
    description: 'Delete a user',
    tags: ['User'],
    summary: 'Delete user by ID',
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

const getEventsSchema = {
    description: 'Get upcoming birthdays and anniversaries',
    tags: ['User'],
    summary: 'List birthdays and anniversaries based on date',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            date: { type: 'string', description: 'Target date (defaults to today)', format: 'date-time' }
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
                        birthdays: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    userId: { type: 'number' },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    employeeCode: { type: 'string' },
                                    designation: { type: 'string', nullable: true },
                                    profilePic: { type: 'string', nullable: true },
                                    dateOfBirth: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
                        anniversaries: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    userId: { type: 'number' },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    employeeCode: { type: 'string' },
                                    designation: { type: 'string', nullable: true },
                                    profilePic: { type: 'string', nullable: true },
                                    joiningDate: { type: 'string', format: 'date-time' },
                                    years: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = {
    createUserSchema,
    getUserByIdSchema,
    getAllUsersSchema,
    updateUserSchema,
    deleteUserSchema,
    getEventsSchema
};
