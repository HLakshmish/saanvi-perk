const companyBodyProperties = {
    companyName: { type: 'string' },
    companyCode: { type: 'string' },
    companyLogo: { type: 'string', nullable: true },
    companyEmail: { type: 'string', format: 'email' },
    companyPhone: { type: 'string', nullable: true },
    website: { type: 'string', nullable: true },
    gstNumber: { type: 'string', nullable: true },
    panNumber: { type: 'string', nullable: true },
    cinNumber: { type: 'string', nullable: true },
    registrationNumber: { type: 'string', nullable: true },
    industryType: { type: 'string', nullable: true },
    companyType: { type: 'string', nullable: true },
    foundedDate: { type: 'string', format: 'date-time', nullable: true },
    employeeStrength: { type: 'number', nullable: true },
    addressLine1: { type: 'string', nullable: true },
    addressLine2: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    country: { type: 'string', nullable: true },
    pincode: { type: 'string', nullable: true },
    timezone: { type: 'string', nullable: true },
    currency: { type: 'string', nullable: true },
    workingHoursPerDay: { type: 'number', nullable: true },
    workingDaysPerWeek: { type: 'number', nullable: true },
    officeStartTime: { type: 'string', nullable: true },
    officeEndTime: { type: 'string', nullable: true },
    latitude: { type: 'number', nullable: true },
    longitude: { type: 'number', nullable: true },
    allowedRadius: { type: 'number', nullable: true },
    status: { type: 'boolean' }
};

const createCompanySchema = {
    description: 'Create a new company',
    tags: ['Company'],
    summary: 'Creates a new company in the system',
    body: {
        type: 'object',
        required: ['companyName', 'companyCode', 'companyEmail', 'superAdmin'],
        properties: {
            ...companyBodyProperties,
            superAdmin: {
                type: 'object',
                required: ['email', 'password', 'firstName'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string', nullable: true },
                    phoneNumber: { type: 'string', nullable: true }
                }
            }
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
                    properties: { 
                        companyId: { type: 'number' }, 
                        ...companyBodyProperties,
                        superAdmin: {
                            type: 'object',
                            properties: {
                                superAdminId: { type: 'number' },
                                email: { type: 'string' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string', nullable: true },
                                phoneNumber: { type: 'string', nullable: true }
                            }
                        }
                    }
                }
            }
        }
    }
};

const updateCompanySchema = {
    description: 'Update an existing company by ID',
    tags: ['Company'],
    summary: 'Updates company details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Company ID' }
        }
    },
    body: {
        type: 'object',
        properties: companyBodyProperties
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
                    properties: { companyId: { type: 'number' }, ...companyBodyProperties }
                }
            }
        }
    }
};

const getCompanyByIdSchema = {
    description: 'Get a company by ID',
    tags: ['Company'],
    summary: 'Retrieves a single company',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Company ID' }
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
                    properties: { companyId: { type: 'number' }, ...companyBodyProperties }
                }
            }
        }
    }
};

const getAllCompaniesSchema = {
    description: 'Get all companies',
    tags: ['Company'],
    summary: 'Retrieves a list of all companies',
    querystring: {
        type: 'object',
        properties: {
            companyName: { type: 'string' },
            companyCode: { type: 'string' }
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
                        properties: { companyId: { type: 'number' }, ...companyBodyProperties }
                    }
                }
            }
        }
    }
};

const deleteCompanySchema = {
    description: 'Delete a company by ID',
    tags: ['Company'],
    summary: 'Deletes a company',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Company ID' }
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
    createCompanySchema,
    updateCompanySchema,
    getCompanyByIdSchema,
    getAllCompaniesSchema,
    deleteCompanySchema
};
