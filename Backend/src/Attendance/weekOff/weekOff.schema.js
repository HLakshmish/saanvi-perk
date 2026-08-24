const weekOffRuleSchema = {
    type: 'object',
    required: ['frequency', 'dayOfWeek', 'duration'],
    properties: {
        frequency: { type: 'string', enum: ['Every', 'First', 'Second', 'Third', 'Fourth', 'Fifth'] },
        dayOfWeek: { type: 'string', enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        duration: { type: 'string', enum: ['All day', 'First half', 'Second half'] }
    }
};

const createWeekOffSchema = {
    tags: ['WeekOff'],
    body: {
        type: 'object',
        required: ['code', 'name', 'rules'],
        properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            companyId: { type: 'number' },
            rules: {
                type: 'array',
                items: weekOffRuleSchema
            }
        }
    }
};

const assignWeekOffSchema = {
    tags: ['WeekOff'],
    body: {
        type: 'object',
        required: ['userIds', 'weekOffId', 'startDate'],
        properties: {
            userIds: { type: 'array', items: { type: 'number' } },
            weekOffId: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            companyId: { type: 'number' }
        }
    }
};

const basicSchema = { tags: ['WeekOff'] };

module.exports = {
    createWeekOffSchema,
    assignWeekOffSchema,
    basicSchema
};
