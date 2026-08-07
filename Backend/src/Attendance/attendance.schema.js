const properties = {
    userId: { type: 'number' },
    attendanceDate: { type: 'string' },
    checkInTime: { type: 'string', nullable: true },
    checkOutTime: { type: 'string', nullable: true },
    checkInLatitude: { type: 'number', nullable: true },
    checkInLongitude: { type: 'number', nullable: true },
    checkOutLatitude: { type: 'number', nullable: true },
    checkOutLongitude: { type: 'number', nullable: true },
    workingMinutes: { type: 'number', nullable: true },
    overtimeMinutes: { type: 'number', nullable: true },
    earlyCheckoutMinutes: { type: 'number', nullable: true },
    attendanceStatus: { type: 'string', enum: ['PRESENT', 'HALF_DAY', 'ABSENT', 'WEEK_OFF', 'HOLIDAY'] },
    remarks: { type: 'string', nullable: true }
};

const createSchema = {
    description: 'Create a new attendance record',
    tags: ['Attendance'],
    summary: 'Creates a new attendance record in the system',
    body: { type: 'object', required: ['userId', 'attendanceDate', 'attendanceStatus'], properties },
    response: { 201: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { attendanceId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};

const updateSchema = {
    description: 'Update an attendance record by ID',
    tags: ['Attendance'],
    summary: 'Updates an attendance record',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    body: { type: 'object', properties },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { attendanceId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};

const getByIdSchema = {
    description: 'Get an attendance record by ID',
    tags: ['Attendance'],
    summary: 'Retrieves a single attendance record',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { attendanceId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } }
};

const getAllSchema = {
    description: 'Get all attendance records',
    tags: ['Attendance'],
    summary: 'Retrieves a list of all attendance records',
    querystring: { type: 'object', properties: { userId: { type: 'number' }, attendanceStatus: { type: 'string' }, attendanceDate: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'object', properties: { attendanceId: { type: 'number' }, companyId: { type: 'number' }, ...properties } } } } } }
};

const deleteSchema = {
    description: 'Delete an attendance record by ID',
    tags: ['Attendance'],
    summary: 'Deletes an attendance record',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } }
};

module.exports = { createSchema, updateSchema, getByIdSchema, getAllSchema, deleteSchema };
