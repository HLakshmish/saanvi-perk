const createRequestSchema = {
    tags: ['AttendanceRequest'],
    body: {
        type: 'object',
        required: ['shiftDate', 'reason', 'remarks'],
        properties: {
            userId: { type: 'number' },
            shiftDate: { type: 'string' },
            reason: { type: 'string', enum: ['BUSINESS_TOUR', 'FORGOT_ID', 'NEW_JOINEE', 'ON_DUTY', 'OTHERS'] },
            checkInTime: { type: 'string', nullable: true },
            checkOutTime: { type: 'string', nullable: true },
            isNextDay: { type: 'boolean' },
            remarks: { type: 'string', minLength: 1 }
        }
    }
};

const updateStatusSchema = {
    tags: ['AttendanceRequest'],
    params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'number' } }
    },
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'CANCELLED'] },
            rejectionReason: { type: 'string', nullable: true }
        }
    }
};

const deleteRequestSchema = {
    tags: ['AttendanceRequest'],
    params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'number' } }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

const getAllSchema = { 
    tags: ['AttendanceRequest'],
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] }
        }
    }
};

module.exports = { createRequestSchema, updateStatusSchema, deleteRequestSchema, getAllSchema };
