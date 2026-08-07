const properties = {
    calendarCode: { type: 'string' },
    calendarName: { type: 'string' },
    remarks: { type: 'string', nullable: true },
    status: { type: 'boolean' }
};
const createSchema = {
    tags: ['Calendar'],
    body: { type: 'object', required: ['calendarCode', 'calendarName'], properties },
    response: { 201: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { calendarId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};
const updateSchema = {
    tags: ['Calendar'],
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    body: { type: 'object', properties },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { calendarId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};
const getByIdSchema = {
    tags: ['Calendar'],
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { calendarId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};
const getAllSchema = {
    tags: ['Calendar'],
    querystring: { type: 'object', properties: { calendarCode: { type: 'string' }, calendarName: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'object', properties: { calendarId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } } }
};
const deleteSchema = {
    tags: ['Calendar'],
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } }
};
module.exports = { createSchema, updateSchema, getByIdSchema, getAllSchema, deleteSchema };
