const loginSchema = {
    description: 'User login',
    tags: ['Auth'],
    summary: 'Login using email and password',
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                token: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        userId: { type: 'number' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        companyId: { type: 'number', nullable: true }
                    }
                }
            }
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

module.exports = { loginSchema };
