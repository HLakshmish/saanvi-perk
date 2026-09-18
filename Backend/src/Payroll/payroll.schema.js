const getSettingsSchema = {
    description: 'Get company payroll settings (dynamic percentages)',
    tags: ['Payroll'],
    summary: 'Get payroll settings'
};

const updateSettingsSchema = {
    description: 'Update company payroll settings (dynamic percentages)',
    tags: ['Payroll'],
    summary: 'Update payroll settings',
    body: {
        type: 'object',
        properties: {
            basicPercentage: { type: 'number', minimum: 0, maximum: 100 },
            hraPercentage: { type: 'number', minimum: 0, maximum: 100 },
            otherAllowancesPercentage: { type: 'number', minimum: 0, maximum: 100 },
            employeePfRate: { type: 'number', minimum: 0, maximum: 100 },
            employeeEsiRate: { type: 'number', minimum: 0, maximum: 100 },
            professionalTax: { type: 'number', minimum: 0 },
            employerPfRate: { type: 'number', minimum: 0, maximum: 100 },
            employerEsiRate: { type: 'number', minimum: 0, maximum: 100 },
            gratuityRate: { type: 'number', minimum: 0, maximum: 100 },
            statutoryPfWageLimit: { type: 'number', minimum: 0 },
            usePfWageCeiling: { type: 'boolean' },
            statutoryEsiGrossLimit: { type: 'number', minimum: 0 }
        }
    }
};

const calculateBreakupSchema = {
    description: 'Calculate salary breakup based on CTC and company dynamic rates',
    tags: ['Payroll'],
    summary: 'Calculate salary breakup',
    body: {
        type: 'object',
        properties: {
            annualCtc: { type: 'number' },
            monthlyCtc: { type: 'number' },
            monthlyGross: { type: 'number' },
            basicAmount: { type: 'number' }
        }
    }
};

const assignSalarySchema = {
    description: 'Assign or update employee salary structure and CTC',
    tags: ['Payroll'],
    summary: 'Assign salary structure',
    body: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'number' },
            annualCtc: { type: 'number' },
            monthlyCtc: { type: 'number' },
            monthlyGross: { type: 'number' },
            basicAmount: { type: 'number' },
            effectiveDate: { type: 'string' },
            hikePercentage: { type: 'number' },
            previousCtc: { type: 'number' },
            revisionType: { type: 'string' },
            remarks: { type: 'string' }
        }
    }
};

const getSalaryStructuresSchema = {
    description: 'Get all employee salary structures in the company',
    tags: ['Payroll'],
    summary: 'List salary structures',
    querystring: {
        type: 'object',
        properties: {
            search: { type: 'string' }
        }
    }
};

const generatePayslipsSchema = {
    description: 'Generate monthly payroll / payslips for employees',
    tags: ['Payroll'],
    summary: 'Generate monthly payslips',
    body: {
        type: 'object',
        required: ['month', 'year'],
        properties: {
            month: { type: 'number', minimum: 1, maximum: 12 },
            year: { type: 'number', minimum: 2000 },
            userIds: {
                type: 'array',
                items: { type: 'number' }
            }
        }
    }
};

const getPayslipsSchema = {
    description: 'List employee payslips',
    tags: ['Payroll'],
    summary: 'Get payslips list',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            month: { type: 'number' },
            year: { type: 'number' },
            status: { type: 'string' }
        }
    }
};

const updatePayslipStatusSchema = {
    description: 'Update payslip status',
    tags: ['Payroll'],
    summary: 'Update payslip status',
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: { type: 'string', enum: ['GENERATED', 'PAID', 'ON_HOLD'] },
            paymentDate: { type: 'string' }
        }
    }
};

module.exports = {
    getSettingsSchema,
    updateSettingsSchema,
    calculateBreakupSchema,
    assignSalarySchema,
    getSalaryStructuresSchema,
    generatePayslipsSchema,
    getPayslipsSchema,
    updatePayslipStatusSchema
};
