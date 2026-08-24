const createRequestSchema = {
    tags: ['AttendanceRequest'],
    body: {
        type: 'object',
        required: ['shiftDate', 'reason', 'remarks'],
        properties: {
            shiftDate: { type: 'string', format: 'date-time' },
            reason: { type: 'string', enum: ['BUSINESS_TOUR', 'FORGOT_ID', 'NEW_JOINEE', 'ON_DUTY', 'OTHERS'] },
            checkInTime: { type: 'string', format: 'date-time', nullable: true },
            checkOutTime: { type: 'string', format: 'date-time', nullable: true },
            isNextDay: { type: 'boolean' },
            remarks: { type: 'string' }
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
            status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
            rejectionReason: { type: 'string', nullable: true }
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

module.exports = { createRequestSchema, updateStatusSchema, getAllSchema };
