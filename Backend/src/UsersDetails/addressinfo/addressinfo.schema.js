const addressInfoBodyProperties = {
    userId: { type: 'number' },

    addressType: {
        type: 'string',
        enum: ['PERMANENT', 'CURRENT', 'permanent', 'current']
    },

    addressLine1: { type: 'string' },
    addressLine2: { type: 'string', nullable: true },

    city: { type: 'string' },
    state: { type: 'string' },
    country: { type: 'string' },
    postalCode: { type: 'string' },
    isSame: { type: 'boolean', nullable: true }
};

const createAddressInfoSchema = {
    description: 'Create address information',
    tags: ['Address Information'],
    summary: 'Creates address information for a user',
    body: {
        type: 'object',
        required: [
            'userId',
            'addressType',
            'addressLine1',
            'city',
            'state',
            'country',
            'postalCode'
        ],
        properties: addressInfoBodyProperties
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
                        addressId: { type: 'number' },
                        ...addressInfoBodyProperties
                    }
                }
            }
        }
    }
};

const updateAddressInfoSchema = {
    description: 'Update address information',
    tags: ['Address Information'],
    summary: 'Updates address information',
  params: {
    type: 'object',
    required: ['userId', 'addressType'],
    properties: {
        userId: {
            type: 'string'
        },
        addressType: {
            type: 'string',
            enum: ['CURRENT', 'PERMANENT', 'current', 'permanent']
        }
    }
},
    body: {
        type: 'object',
        properties: addressInfoBodyProperties
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
                        addressId: { type: 'number' },
                        ...addressInfoBodyProperties
                    }
                }
            }
        }
    }
};

const getAddressInfoByUserIdSchema = {
    description: 'Get address information by User ID',
    tags: ['Address Information'],
    summary: 'Retrieves address information for a user',
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
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            addressId: { type: 'number' },
                            ...addressInfoBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const getAllAddressInfoSchema = {
    description: 'Get all address information',
    tags: ['Address Information'],
    summary: 'Retrieves all address information records',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            addressType: {
                type: 'string',
                enum: ['PERMANENT', 'CURRENT', 'permanent', 'current']
            },
            city: { type: 'string' },
            state: { type: 'string' },
            country: { type: 'string' },
            postalCode: { type: 'string' }
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
                            addressId: { type: 'number' },
                            ...addressInfoBodyProperties
                        }
                    }
                }
            }
        }
    }
};

const deleteAddressInfoSchema = {
    description: 'Delete address information',
    tags: ['Address Information'],
    summary: 'Deletes address information',
   params: {
    type: 'object',
    required: ['userId', 'addressType'],
    properties: {
        userId: {
            type: 'string'
        },
        addressType: {
            type: 'string',
            enum: ['CURRENT', 'PERMANENT', 'current', 'permanent']
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
    createAddressInfoSchema,
    updateAddressInfoSchema,
    getAddressInfoByUserIdSchema,
    getAllAddressInfoSchema,
    deleteAddressInfoSchema
};