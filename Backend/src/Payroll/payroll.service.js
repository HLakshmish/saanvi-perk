const payrollRepository = require("./payroll.repository");
const prisma = require("../config/prisma");

class PayrollService {
    // Default system rates if not configured in DB yet
    getDefaultSettings() {
        return {
            basicPercentage: 50.00,
            hraPercentage: 25.00,
            otherAllowancesPercentage: 25.00,
            employeePfRate: 12.00,
            employeeEsiRate: 0.75,
            professionalTax: 200.00,
            employerPfRate: 13.00,
            employerEsiRate: 3.25,
            gratuityRate: 4.81,
            statutoryPfWageLimit: 15000.00,
            usePfWageCeiling: true,
            statutoryEsiGrossLimit: 21000.00
        };
    }

    async getSettings(companyId) {
        const settings = await payrollRepository.getSettings(companyId);
        if (!settings) {
            return {
                companyId,
                ...this.getDefaultSettings()
            };
        }

        return {
            id: settings.id,
            companyId: settings.company_id,
            basicPercentage: Number(settings.basic_percentage),
            hraPercentage: Number(settings.hra_percentage),
            otherAllowancesPercentage: Number(settings.other_allowances_percentage),
            employeePfRate: Number(settings.employee_pf_rate),
            employeeEsiRate: Number(settings.employee_esi_rate),
            professionalTax: Number(settings.professional_tax),
            employerPfRate: Number(settings.employer_pf_rate),
            employerEsiRate: Number(settings.employer_esi_rate),
            gratuityRate: Number(settings.gratuity_rate),
            statutoryPfWageLimit: Number(settings.statutory_pf_wage_limit),
            usePfWageCeiling: Boolean(settings.use_pf_wage_ceiling),
            statutoryEsiGrossLimit: Number(settings.statutory_esi_gross_limit),
            updatedAt: settings.updated_at
        };
    }

    async updateSettings(companyId, data, updatedBy) {
        const updated = await payrollRepository.upsertSettings(companyId, data, updatedBy);
        return {
            id: updated.id,
            companyId: updated.company_id,
            basicPercentage: Number(updated.basic_percentage),
            hraPercentage: Number(updated.hra_percentage),
            otherAllowancesPercentage: Number(updated.other_allowances_percentage),
            employeePfRate: Number(updated.employee_pf_rate),
            employeeEsiRate: Number(updated.employee_esi_rate),
            professionalTax: Number(updated.professional_tax),
            employerPfRate: Number(updated.employer_pf_rate),
            employerEsiRate: Number(updated.employer_esi_rate),
            gratuityRate: Number(updated.gratuity_rate),
            statutoryPfWageLimit: Number(updated.statutory_pf_wage_limit),
            usePfWageCeiling: Boolean(updated.use_pf_wage_ceiling),
            statutoryEsiGrossLimit: Number(updated.statutory_esi_gross_limit),
            updatedAt: updated.updated_at
        };
    }

    /**
     * Calculates complete salary breakup based on input CTC and dynamic percentages.
     */
    calculateSalaryBreakup({ annualCtc, monthlyCtc, monthlyGross, basicAmount }, settings) {
        const rates = { ...this.getDefaultSettings(), ...(settings || {}) };

        let mCtc = 0;
        let aCtc = 0;

        if (monthlyCtc && Number(monthlyCtc) > 0) {
            mCtc = Number(monthlyCtc);
            aCtc = Math.round(mCtc * 12 * 100) / 100;
        } else if (annualCtc && Number(annualCtc) > 0) {
            aCtc = Number(annualCtc);
            mCtc = Math.round((aCtc / 12) * 100) / 100;
        } else if (monthlyGross && Number(monthlyGross) > 0) {
            // Forward calculate from Gross
            const mGross = Number(monthlyGross);
            let basicM = basicAmount && Number(basicAmount) > 0 
                ? Number(basicAmount) 
                : Math.round(mGross * (rates.basicPercentage / 100) * 100) / 100;
            
            // Statutory PF & ESI wage limits
            const pfWage = basicM > 15000 ? 15000 : basicM;
            const esiThreshold = Number(rates.statutoryEsiGrossLimit || 21000);
            
            const employerPfM = Math.round(pfWage * (rates.employerPfRate / 100));
            // ESI Contribution: If base amount is more than 21000/m, Employer ESI is 0
            const employerEsiM = basicM > esiThreshold ? 0 : Math.round(basicM * (rates.employerEsiRate / 100));
            const gratuityM = Math.round(basicM * (rates.gratuityRate / 100));
            
            mCtc = mGross + employerPfM + employerEsiM + gratuityM;
            aCtc = Math.round(mCtc * 12 * 100) / 100;
        } else {
            throw new Error("Please provide either annualCtc, monthlyCtc, or monthlyGross.");
        }

        // Basic Pay (Basic Pay + DA + RA)
        // If basicAmount is explicitly specified (e.g. from Excel 16,666), use it;
        // otherwise calculate from configured basicPercentage (default 50%)
        let basicMonthly = 0;
        if (basicAmount && Number(basicAmount) > 0) {
            basicMonthly = Number(basicAmount);
        } else {
            basicMonthly = Math.round(mCtc * (rates.basicPercentage / 100) * 100) / 100;
        }

        // Statutory PF wage base (EPF wage capped at 15000 if basic is more than 15000)
        const pfWage = basicMonthly > 15000 ? 15000 : basicMonthly;
        const esiThreshold = Number(rates.statutoryEsiGrossLimit || 21000);

        // Employer Contributions
        // ESI Rule: if base amount (basic monthly) is more than 21,000/m, Employer ESI is 0
        const employerPfMonthly = Math.round(pfWage * (rates.employerPfRate / 100));
        const employerEsiMonthly = basicMonthly > esiThreshold ? 0 : Math.round(basicMonthly * (rates.employerEsiRate / 100));
        const gratuityMonthly = Math.round(basicMonthly * (rates.gratuityRate / 100));
        const totalEmployerContribution = employerPfMonthly + employerEsiMonthly + gratuityMonthly;

        // Gross Salary
        const monthlyGrossCalc = Math.round((mCtc - totalEmployerContribution) * 100) / 100;

        // Allowances
        const remainingGross = Math.max(0, monthlyGrossCalc - basicMonthly);
        const hraMonthly = Math.round((remainingGross / 2) * 100) / 100;
        const otherAllowancesMonthly = Math.round((remainingGross - hraMonthly) * 100) / 100;

        // Employee Deductions
        // EPF Contribution Rate: If basic is more than 15000/m take 1800 only. 12% applies only if basic <= 15000/m
        const employeePfMonthly = basicMonthly > 15000 
            ? 1800 
            : Math.round(basicMonthly * (Number(rates.employeePfRate || 12.00) / 100));
        // ESI Contribution: If base amount is more than 21000/m, Employee ESI is 0
        const employeeEsiMonthly = basicMonthly > esiThreshold ? 0 : Math.round(basicMonthly * (rates.employeeEsiRate / 100));
        const professionalTaxMonthly = Number(rates.professionalTax || 200.00);
        const totalDeductionsMonthly = employeePfMonthly + employeeEsiMonthly + professionalTaxMonthly;

        // Net Salary
        const netSalaryMonthly = Math.round((monthlyGrossCalc - totalDeductionsMonthly) * 100) / 100;

        // Annual values
        const basicAnnual = Math.round(basicMonthly * 12);
        const hraAnnual = Math.round(hraMonthly * 12);
        const otherAllowancesAnnual = Math.round(otherAllowancesMonthly * 12);
        const annualGross = Math.round(monthlyGrossCalc * 12);

        const employeePfAnnual = Math.round(employeePfMonthly * 12);
        const employeeEsiAnnual = Math.round(employeeEsiMonthly * 12);
        const professionalTaxAnnual = Math.round(professionalTaxMonthly * 12);
        const totalDeductionsAnnual = Math.round(totalDeductionsMonthly * 12);
        const netSalaryAnnual = Math.round(netSalaryMonthly * 12);

        const employerPfAnnual = Math.round(employerPfMonthly * 12);
        const employerEsiAnnual = Math.round(employerEsiMonthly * 12);
        const gratuityAnnual = Math.round(gratuityMonthly * 12);
        const annualCtcCalc = Math.round(mCtc * 12);

        return {
            ratesApplied: {
                basicPercentage: rates.basicPercentage,
                employeePfRate: rates.employeePfRate,
                employeeEsiRate: rates.employeeEsiRate,
                professionalTax: rates.professionalTax,
                employerPfRate: rates.employerPfRate,
                employerEsiRate: rates.employerEsiRate,
                gratuityRate: rates.gratuityRate,
                statutoryPfWageLimit: rates.statutoryPfWageLimit,
                usePfWageCeiling: rates.usePfWageCeiling
            },
            monthly: {
                ctc: mCtc,
                grossSalary: monthlyGrossCalc,
                basicPay: basicMonthly,
                hra: hraMonthly,
                otherAllowances: otherAllowancesMonthly,
                employeePf: employeePfMonthly,
                employeeEsi: employeeEsiMonthly,
                professionalTax: professionalTaxMonthly,
                totalDeductions: totalDeductionsMonthly,
                netSalary: netSalaryMonthly,
                employerPf: employerPfMonthly,
                employerEsi: employerEsiMonthly,
                gratuity: gratuityMonthly,
                totalEmployerContribution
            },
            annual: {
                ctc: annualCtcCalc,
                grossSalary: annualGross,
                basicPay: basicAnnual,
                hra: hraAnnual,
                otherAllowances: otherAllowancesAnnual,
                employeePf: employeePfAnnual,
                employeeEsi: employeeEsiAnnual,
                professionalTax: professionalTaxAnnual,
                totalDeductions: totalDeductionsAnnual,
                netSalary: netSalaryAnnual,
                employerPf: employerPfAnnual,
                employerEsi: employerEsiAnnual,
                gratuity: gratuityAnnual,
                totalEmployerContribution: (employerPfAnnual + employerEsiAnnual + gratuityAnnual)
            }
        };
    }

    async calculateBreakup(companyId, payload) {
        const settings = await this.getSettings(companyId);
        return this.calculateSalaryBreakup(payload, settings);
    }

    async assignSalary(companyId, userId, payload) {
        // Validate user belongs to company
        const user = await prisma.user.findFirst({
            where: { userId: Number(userId), companyId: Number(companyId) }
        });
        if (!user) {
            throw new Error("Employee not found in this company.");
        }

        const settings = await this.getSettings(companyId);
        const breakup = this.calculateSalaryBreakup(payload, settings);

        const data = {
            annualCtc: breakup.annual.ctc,
            monthlyCtc: breakup.monthly.ctc,
            monthlyGross: breakup.monthly.grossSalary,
            annualGross: breakup.annual.grossSalary,
            basicMonthly: breakup.monthly.basicPay,
            basicAnnual: breakup.annual.basicPay,
            hraMonthly: breakup.monthly.hra,
            hraAnnual: breakup.annual.hra,
            otherAllowancesMonthly: breakup.monthly.otherAllowances,
            otherAllowancesAnnual: breakup.annual.otherAllowances,
            employeePfMonthly: breakup.monthly.employeePf,
            employeePfAnnual: breakup.annual.employeePf,
            employeeEsiMonthly: breakup.monthly.employeeEsi,
            employeeEsiAnnual: breakup.annual.employeeEsi,
            professionalTaxMonthly: breakup.monthly.professionalTax,
            professionalTaxAnnual: breakup.annual.professionalTax,
            totalDeductionsMonthly: breakup.monthly.totalDeductions,
            totalDeductionsAnnual: breakup.annual.totalDeductions,
            netSalaryMonthly: breakup.monthly.netSalary,
            netSalaryAnnual: breakup.annual.netSalary,
            employerPfMonthly: breakup.monthly.employerPf,
            employerPfAnnual: breakup.annual.employerPf,
            employerEsiMonthly: breakup.monthly.employerEsi,
            employerEsiAnnual: breakup.annual.employerEsi,
            gratuityMonthly: breakup.monthly.gratuity,
            gratuityAnnual: breakup.annual.gratuity,
            effectiveDate: payload.effectiveDate || new Date().toISOString().split('T')[0],
            hikePercentage: payload.hikePercentage,
            previousCtc: payload.previousCtc,
            revisionType: payload.revisionType,
            remarks: payload.remarks
        };

        const result = await payrollRepository.assignSalaryStructure(Number(companyId), Number(userId), data, createdBy);
        return {
            ...result,
            breakup
        };
    }

    async getSalaryHistory(companyId, userId) {
        return await payrollRepository.getSalaryHistory(Number(companyId), Number(userId));
    }

    async getSalaryStructure(companyId, userId) {
        let structure = await payrollRepository.getSalaryStructureByUserId(Number(userId), Number(companyId));
        if (!structure) {
            // Auto-initialize standard structure for this employee if none exists
            const settings = await this.getSettings(Number(companyId));
            const defaultBreakup = this.calculateSalaryBreakup({ annualCtc: 858660 }, settings);
            await this.assignSalary(Number(companyId), Number(userId), {
                annualCtc: defaultBreakup.annual.ctc
            });
            structure = await payrollRepository.getSalaryStructureByUserId(Number(userId), Number(companyId));
        }
        return structure;
    }

    async getAllSalaryStructures(companyId, search) {
        // Ensure all active company users have an entry in employee_salary_structures in DB
        const activeUsers = await prisma.user.findMany({
            where: { companyId: Number(companyId), status: 'ACTIVE' },
            select: { userId: true }
        });

        const settings = await this.getSettings(Number(companyId));
        for (const u of activeUsers) {
            const existing = await payrollRepository.getSalaryStructureByUserId(u.userId, Number(companyId));
            if (!existing) {
                const defaultBreakup = this.calculateSalaryBreakup({ annualCtc: 858660 }, settings);
                await this.assignSalary(Number(companyId), u.userId, {
                    annualCtc: defaultBreakup.annual.ctc
                });
            }
        }

        return await payrollRepository.getAllSalaryStructures(Number(companyId), search);
    }

    async generateMonthlyPayroll(companyId, { month, year, userIds }) {
        if (!month || !year) throw new Error("Month and year are required.");

        // Fetch company active users
        let whereClause = { companyId: Number(companyId), status: 'ACTIVE' };
        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            whereClause.userId = { in: userIds.map(Number) };
        }

        const employees = await prisma.user.findMany({
            where: whereClause,
            select: { userId: true, firstName: true, lastName: true }
        });

        const generatedSlips = [];
        const daysInMonth = new Date(year, month, 0).getDate();
        const settings = await this.getSettings(Number(companyId));

        for (const emp of employees) {
            let structure = await payrollRepository.getSalaryStructureByUserId(emp.userId, Number(companyId));
            if (!structure) {
                // Auto-create salary structure for this employee so ALL employees have payslips stored in DB
                const defaultBreakup = this.calculateSalaryBreakup({ annualCtc: 858660 }, settings);
                await this.assignSalary(Number(companyId), emp.userId, {
                    annualCtc: defaultBreakup.annual.ctc
                });
                structure = await payrollRepository.getSalaryStructureByUserId(emp.userId, Number(companyId));
            }

            if (!structure) continue;

            // Calculate attendance/loss of pay if recorded
            const workingDays = daysInMonth;
            let lossOfPayDays = 0;
            try {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);
                const absentCount = await prisma.attendance.count({
                    where: {
                        userId: emp.userId,
                        date: { gte: startDate, lte: endDate },
                        status: 'ABSENT'
                    }
                });
                lossOfPayDays = absentCount;
            } catch (e) {
                lossOfPayDays = 0;
            }

            const paidDays = Math.max(0, workingDays - lossOfPayDays);
            const payFactor = workingDays > 0 ? paidDays / workingDays : 1;

            const basicEarned = Math.round(Number(structure.basic_monthly) * payFactor * 100) / 100;
            const hraEarned = Math.round(Number(structure.hra_monthly) * payFactor * 100) / 100;
            const otherAllowancesEarned = Math.round(Number(structure.other_allowances_monthly) * payFactor * 100) / 100;
            const grossEarned = basicEarned + hraEarned + otherAllowancesEarned;

            // EPF Contribution: If basic is more than 15000/m take 1800 only. 12% applies only if basic <= 15000/m
            let baseMonthlyPf = Number(structure.employee_pf_monthly);
            if (Number(structure.basic_monthly) > 15000) {
                baseMonthlyPf = 1800;
            } else if (Number(structure.basic_monthly) <= 15000 && (!baseMonthlyPf || baseMonthlyPf > 1800)) {
                baseMonthlyPf = Math.round(Number(structure.basic_monthly) * (Number(settings.employeePfRate || 12.00) / 100));
            }
            const employeePf = Math.round(baseMonthlyPf * payFactor * 100) / 100;

            // ESI Contribution: If base amount is more than 21000/m, both Employee and Employer ESI are 0
            const esiThreshold = Number(settings.statutoryEsiGrossLimit || 21000);
            const isEsiExempt = Number(structure.basic_monthly) > esiThreshold || basicEarned > esiThreshold;

            const employeeEsi = isEsiExempt 
                ? 0 
                : Math.round(Number(structure.employee_esi_monthly || 0) * payFactor * 100) / 100;
            const professionalTax = Number(structure.professional_tax_monthly || 0);
            const totalDeductions = employeePf + employeeEsi + professionalTax;
            const netPay = Math.round((grossEarned - totalDeductions) * 100) / 100;

            const employerPf = Math.round(Number(structure.employer_pf_monthly) * payFactor * 100) / 100;
            const employerEsi = isEsiExempt 
                ? 0 
                : Math.round(Number(structure.employer_esi_monthly || 0) * payFactor * 100) / 100;
            const gratuity = Math.round(Number(structure.gratuity_monthly) * payFactor * 100) / 100;
            const ctcEarned = grossEarned + employerPf + employerEsi + gratuity;

            const slipData = {
                userId: emp.userId,
                salaryStructureId: structure.id,
                month: Number(month),
                year: Number(year),
                workingDays,
                paidDays,
                lossOfPayDays,
                basicEarned,
                hraEarned,
                otherAllowancesEarned,
                grossEarned,
                employeePf,
                employeeEsi,
                professionalTax,
                totalDeductions,
                netPay,
                employerPf,
                employerEsi,
                gratuity,
                ctcEarned,
                paymentStatus: 'GENERATED',
                remarks: `Payroll for ${month}/${year}`
            };

            const saved = await payrollRepository.upsertPayslip(Number(companyId), slipData);
            generatedSlips.push(saved);
        }

        return {
            count: generatedSlips.length,
            payslips: generatedSlips
        };
    }

    async getPayslips(companyId, filters) {
        let slips = await payrollRepository.getPayslips(Number(companyId), filters);

        // If no payslips exist yet for the requested month and year, auto-generate them for all active employees
        if (slips.length === 0 && filters && filters.month && filters.year && !filters.userId) {
            const activeCount = await prisma.user.count({
                where: { companyId: Number(companyId), status: 'ACTIVE' }
            });
            if (activeCount > 0) {
                await this.generateMonthlyPayroll(Number(companyId), {
                    month: Number(filters.month),
                    year: Number(filters.year)
                });
                slips = await payrollRepository.getPayslips(Number(companyId), filters);
            }
        }

        return slips;
    }

    async getPayslipById(id, companyId) {
        return await payrollRepository.getPayslipById(Number(id), Number(companyId));
    }

    async updatePayslipStatus(id, companyId, status, paymentDate) {
        return await payrollRepository.updatePayslipStatus(Number(id), Number(companyId), status, paymentDate);
    }
}

module.exports = new PayrollService();
