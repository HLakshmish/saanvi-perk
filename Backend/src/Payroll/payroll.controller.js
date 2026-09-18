const payrollService = require("./payroll.service");
const prisma = require("../config/prisma");

async function checkCanManagePayroll(user) {
    if (!user) return false;
    if (user.role === 'OWNER' || user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.role === 'HR') {
        return true;
    }
    if (user.permissions && (user.permissions.includes('MANAGE_PAYROLL') || user.permissions.includes('VIEW_PAYROLL'))) {
        return true;
    }
    if (user.userId) {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { userId: Number(user.userId) },
                include: {
                    userRoles: {
                        include: {
                            role: true
                        }
                    }
                }
            });
            if (dbUser && dbUser.userRoles) {
                return dbUser.userRoles.some(ur => {
                    const code = (ur.role?.roleCode || '').toUpperCase();
                    const name = (ur.role?.roleName || '').toUpperCase();
                    return code.includes('ADMIN') || code.includes('HR') || code.includes('MGR') || code.includes('MANAGER') ||
                           name.includes('ADMIN') || name.includes('HR') || name.includes('MANAGER');
                });
            }
        } catch (e) {
            console.error("Error checking user roles in DB:", e);
        }
    }
    return false;
}

class PayrollController {
    // 1. Get company payroll settings (dynamic percentages)
    async getSettings(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : companyId;
            }
            if (!companyId) {
                return reply.code(400).send({ success: false, message: "Company ID is required" });
            }

            const settings = await payrollService.getSettings(Number(companyId));
            reply.code(200).send({ success: true, data: settings });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    // 2. Update company payroll settings
    async updateSettings(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.body.companyId ? Number(request.body.companyId) : companyId;
            }
            if (!companyId) {
                return reply.code(400).send({ success: false, message: "Company ID is required" });
            }

            const canManage = await checkCanManagePayroll(request.user);
            if (!canManage) {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to update payroll settings." });
            }

            const updated = await payrollService.updateSettings(Number(companyId), request.body, request.user.userId);
            reply.code(200).send({ success: true, message: "Payroll settings updated successfully", data: updated });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    // 3. Calculate salary breakup (dry run / calculator)
    async calculateBreakup(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.body.companyId) {
                companyId = Number(request.body.companyId);
            }
            if (!companyId) {
                return reply.code(400).send({ success: false, message: "Company ID is required" });
            }

            const breakup = await payrollService.calculateBreakup(Number(companyId), request.body);
            reply.code(200).send({ success: true, data: breakup });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    // 4. Assign salary structure to employee
    async assignSalary(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.body.companyId) {
                companyId = Number(request.body.companyId);
            }
            if (!companyId) {
                return reply.code(400).send({ success: false, message: "Company ID is required" });
            }

            const canManage = await checkCanManagePayroll(request.user);
            if (!canManage) {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to assign employee salary." });
            }

            const { userId, ...payload } = request.body;
            if (!userId) {
                return reply.code(400).send({ success: false, message: "Target userId is required." });
            }

            const result = await payrollService.assignSalary(Number(companyId), Number(userId), payload, request.user?.userId);
            reply.code(200).send({ success: true, message: "Salary structure assigned successfully", data: result });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    // 4b. Get salary revision & hike history for employee
    async getSalaryHistory(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }
            if (!companyId) {
                return reply.code(400).send({ success: false, message: "Company ID is required" });
            }

            const { userId } = request.params;
            if (!userId) {
                return reply.code(400).send({ success: false, message: "userId parameter is required." });
            }

            const history = await payrollService.getSalaryHistory(Number(companyId), Number(userId));
            reply.code(200).send({ success: true, data: history });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    // 5. Get salary structure for a specific employee
    async getSalaryStructure(request, reply) {
        try {
            let companyId = request.user.companyId;
            const targetUserId = Number(request.params.userId || request.user.userId);

            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }

            // Normal users can only view their own structure
            if (request.user.role === 'USER' && Number(targetUserId) !== Number(request.user.userId)) {
                const canManage = await checkCanManagePayroll(request.user);
                if (!canManage) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Cannot view another user's salary structure." });
                }
            }

            const structure = await payrollService.getSalaryStructure(Number(companyId), targetUserId);
            if (!structure) {
                return reply.code(404).send({ success: false, message: "Salary structure not configured for this employee." });
            }

            reply.code(200).send({ success: true, data: structure });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    // 6. Get all employee salary structures in company
    async getAllSalaryStructures(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }

            const canManage = await checkCanManagePayroll(request.user);
            if (!canManage) {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to view all employee salaries." });
            }

            const structures = await payrollService.getAllSalaryStructures(Number(companyId), request.query.search || "");
            reply.code(200).send({ success: true, data: structures });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    // 7. Generate monthly payroll / payslips
    async generateMonthlyPayroll(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.body.companyId) {
                companyId = Number(request.body.companyId);
            }

            const canManage = await checkCanManagePayroll(request.user);
            if (!canManage) {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to run payroll." });
            }

            const result = await payrollService.generateMonthlyPayroll(Number(companyId), request.body);
            reply.code(201).send({ success: true, message: `Successfully generated ${result.count} payslip(s)`, data: result });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    // 8. Get payslips list
    async getPayslips(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }

            const filters = { ...request.query };

            // Regular employees only see their own payslips
            const canManage = await checkCanManagePayroll(request.user);
            if (!canManage) {
                filters.userId = request.user.userId;
            }

            const payslips = await payrollService.getPayslips(Number(companyId), filters);
            reply.code(200).send({ success: true, data: payslips });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    // 9. Get payslip by ID
    async getPayslipById(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.query.companyId) {
                companyId = Number(request.query.companyId);
            }

            const payslip = await payrollService.getPayslipById(Number(request.params.id), Number(companyId));
            if (!payslip) {
                return reply.code(404).send({ success: false, message: "Payslip not found" });
            }

            // Regular employees can only view their own
            const canManage = await checkCanManagePayroll(request.user);
            if (!canManage && Number(payslip.user_id) !== Number(request.user.userId)) {
                return reply.code(403).send({ success: false, message: "Forbidden: Cannot view another employee's payslip." });
            }

            reply.code(200).send({ success: true, data: payslip });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    // 10. Update payslip status
    async updatePayslipStatus(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER' && request.body.companyId) {
                companyId = Number(request.body.companyId);
            }

            const canManage = await checkCanManagePayroll(request.user);
            if (!canManage) {
                return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to update payslip status." });
            }

            const { status, paymentDate } = request.body;
            const updated = await payrollService.updatePayslipStatus(Number(request.params.id), Number(companyId), status, paymentDate);
            if (!updated) {
                return reply.code(404).send({ success: false, message: "Payslip not found" });
            }

            reply.code(200).send({ success: true, message: "Payslip status updated", data: updated });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new PayrollController();
