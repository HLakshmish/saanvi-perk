const locationBodyProperties = {
    locationCode: { type: 'string' },
    locationName: { type: 'string' },
    addressLine1: { type: 'string', nullable: true },
    addressLine2: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    country: { type: 'string', nullable: true },
    pincode: { type: 'string', nullable: true },
    officePhoneNumber: { type: 'string', nullable: true },
    mobileNumber: { type: 'string', nullable: true },
    fax: { type: 'string', nullable: true },
    website: { type: 'string', nullable: true },
    timezone: { type: 'string', nullable: true },
    latitude: { type: 'number', nullable: true },
    longitude: { type: 'number', nullable: true },
    remarks: { type: 'string', nullable: true },
    status: { type: 'boolean' }
};

const createLocationSchema = {
    description: 'Create a new location',
    tags: ['Location'],
    summary: 'Creates a new office location',
    body: {
        type: 'object',
        required: ['locationCode', 'locationName'],
        properties: locationBodyProperties
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
                    properties: { officeLocationId: { type: 'number' }, companyId: { type: 'number' }, ...locationBodyProperties }
                }
            }
        }
    }
};

const updateLocationSchema = {
    description: 'Update an existing location by ID',
    tags: ['Location'],
    summary: 'Updates location details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Location ID' }
        }
    },
    body: {
        type: 'object',
        properties: locationBodyProperties
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
                    properties: { officeLocationId: { type: 'number' }, companyId: { type: 'number' }, ...locationBodyProperties }
                }
            }
        }
    }
};

const getLocationByIdSchema = {
    description: 'Get a location by ID',
    tags: ['Location'],
    summary: 'Retrieves a single location',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Location ID' }
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
                    properties: { officeLocationId: { type: 'number' }, companyId: { type: 'number' }, ...locationBodyProperties }
                }
            }
        }
    }
};

const getAllLocationsSchema = {
    description: 'Get all locations',
    tags: ['Location'],
    summary: 'Retrieves a list of all locations',
    querystring: {
        type: 'object',
        properties: {
            locationName: { type: 'string' },
            locationCode: { type: 'string' }
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
                        properties: { officeLocationId: { type: 'number' }, companyId: { type: 'number' }, ...locationBodyProperties }
                    }
                }
            }
        }
    }
};

const deleteLocationSchema = {
    description: 'Delete a location by ID',
    tags: ['Location'],
    summary: 'Deletes a location',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Location ID' }
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
    createLocationSchema,
    updateLocationSchema,
    getLocationByIdSchema,
    getAllLocationsSchema,
    deleteLocationSchema
};
