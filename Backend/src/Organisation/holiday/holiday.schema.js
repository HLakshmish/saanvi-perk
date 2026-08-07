const properties = {
    calendarId: { type: 'number' },
    holidayCode: { type: 'string' },
    holidayName: { type: 'string' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    holidayType: { type: 'string', enum: ['HOLIDAY', 'WEEK_OFF'] },
    isHalfDay: { type: 'boolean' },
    isOptional: { type: 'boolean' },
    remarks: { type: 'string', nullable: true },
    status: { type: 'boolean' }
};
const createSchema = {
    tags: ['Holiday'],
    body: { type: 'object', required: ['calendarId', 'holidayCode', 'holidayName', 'startDate', 'endDate', 'holidayType'], properties },
    response: { 201: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { holidayId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};
const updateSchema = {
    tags: ['Holiday'],
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    body: { type: 'object', properties },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { holidayId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};
const getByIdSchema = {
    tags: ['Holiday'],
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { holidayId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};
const getAllSchema = {
    tags: ['Holiday'],
    querystring: { type: 'object', properties: { calendarId: { type: 'number' }, holidayCode: { type: 'string' }, holidayName: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'object', properties: { holidayId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } } }
};
const deleteSchema = {
    tags: ['Holiday'],
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } }
};
module.exports = { createSchema, updateSchema, getByIdSchema, getAllSchema, deleteSchema };
