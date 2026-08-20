const getSuperAdminDetailsSchema = {
    description: 'Get super admin details for the current company',
    tags: ['Super Admin'],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        superAdminId: { type: 'number' },
                        companyId: { type: 'number' },
                        email: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string', nullable: true },
                        phoneNumber: { type: 'string', nullable: true },
                        status: { type: 'boolean' },
                        lastLogin: { type: 'string', format: 'date-time', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }
};

module.exports = {
    getSuperAdminDetailsSchema
};
