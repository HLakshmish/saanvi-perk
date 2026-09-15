const payrollController = require("./payroll.controller");
const {
    getSettingsSchema,
    updateSettingsSchema,
    calculateBreakupSchema,
    assignSalarySchema,
    getSalaryStructuresSchema,
    generatePayslipsSchema,
    getPayslipsSchema,
    updatePayslipStatusSchema
} = require("./payroll.schema");

async function payrollRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    // 1. Settings (dynamic percentages)
    fastify.get("/settings", opts(getSettingsSchema), payrollController.getSettings.bind(payrollController));
    fastify.put("/settings", opts(updateSettingsSchema), payrollController.updateSettings.bind(payrollController));

    // 2. Salary Breakup Calculator
    fastify.post("/calculate", opts(calculateBreakupSchema), payrollController.calculateBreakup.bind(payrollController));

    // 3. Employee Salary Structures & CTC Assignments
    fastify.get("/salaries", opts(getSalaryStructuresSchema), payrollController.getAllSalaryStructures.bind(payrollController));
    fastify.get("/salaries/:userId", opts(), payrollController.getSalaryStructure.bind(payrollController));
    fastify.post("/salaries", opts(assignSalarySchema), payrollController.assignSalary.bind(payrollController));

    // 4. Monthly Payroll & Payslips
    fastify.post("/payslips/generate", opts(generatePayslipsSchema), payrollController.generateMonthlyPayroll.bind(payrollController));
    fastify.get("/payslips", opts(getPayslipsSchema), payrollController.getPayslips.bind(payrollController));
    fastify.get("/payslips/:id", opts(), payrollController.getPayslipById.bind(payrollController));
    fastify.put("/payslips/:id/status", opts(updatePayslipStatusSchema), payrollController.updatePayslipStatus.bind(payrollController));
}

module.exports = payrollRoutes;
