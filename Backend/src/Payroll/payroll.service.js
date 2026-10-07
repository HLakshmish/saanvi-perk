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

    async getSettings(companyId, targetDate = null) {
        const settings = await payrollRepository.getSettings(companyId, targetDate);
        if (!settings) {
            return {
                companyId,
                effectiveFrom: '2024-01-01',
                effectiveTo: null,
                versionName: 'Statutory Default',
                remarks: 'Default system policy',
                ...this.getDefaultSettings()
            };
        }

        return {
            id: settings.id,
            companyId: settings.company_id,
            effectiveFrom: settings.effective_from ? new Date(settings.effective_from).toISOString().split('T')[0] : '2024-01-01',
            effectiveTo: settings.effective_to ? new Date(settings.effective_to).toISOString().split('T')[0] : null,
            versionName: settings.version_name || null,
            remarks: settings.remarks || null,
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
            updatedAt: settings.updated_at,
            createdAt: settings.created_at
        };
    }

    async getSettingsHistory(companyId) {
        const rows = await payrollRepository.getSettingsHistory(companyId);
        if (!rows || rows.length === 0) {
            return [{
                companyId,
                effectiveFrom: '2024-01-01',
                effectiveTo: null,
                versionName: 'Statutory Default',
                remarks: 'Default system policy',
                ...this.getDefaultSettings()
            }];
        }

        return rows.map(s => ({
            id: s.id,
            companyId: s.company_id,
            effectiveFrom: s.effective_from ? new Date(s.effective_from).toISOString().split('T')[0] : '2024-01-01',
            effectiveTo: s.effective_to ? new Date(s.effective_to).toISOString().split('T')[0] : null,
            versionName: s.version_name || null,
            remarks: s.remarks || null,
            basicPercentage: Number(s.basic_percentage),
            hraPercentage: Number(s.hra_percentage),
            otherAllowancesPercentage: Number(s.other_allowances_percentage),
            employeePfRate: Number(s.employee_pf_rate),
            employeeEsiRate: Number(s.employee_esi_rate),
            professionalTax: Number(s.professional_tax),
            employerPfRate: Number(s.employer_pf_rate),
            employerEsiRate: Number(s.employer_esi_rate),
            gratuityRate: Number(s.gratuity_rate),
            statutoryPfWageLimit: Number(s.statutory_pf_wage_limit),
            usePfWageCeiling: Boolean(s.use_pf_wage_ceiling),
            statutoryEsiGrossLimit: Number(s.statutory_esi_gross_limit),
            updatedAt: s.updated_at,
            createdAt: s.created_at
        }));
    }

    async updateSettings(companyId, data, updatedBy) {
        const updated = await payrollRepository.upsertSettings(companyId, data, updatedBy);
        return {
            id: updated.id,
            companyId: updated.company_id,
            effectiveFrom: updated.effective_from ? new Date(updated.effective_from).toISOString().split('T')[0] : null,
            effectiveTo: updated.effective_to ? new Date(updated.effective_to).toISOString().split('T')[0] : null,
            versionName: updated.version_name || null,
            remarks: updated.remarks || null,
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

    async deleteSettingsVersion(companyId, id) {
        return await payrollRepository.deleteSettingsVersion(Number(companyId), Number(id));
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
        const settings = await this.getSettings(companyId, payload.effectiveDate || null);
        return this.calculateSalaryBreakup(payload, settings);
    }

    async assignSalary(companyId, userId, payload, createdBy) {
        // Validate user belongs to company
        const user = await prisma.user.findFirst({
            where: { userId: Number(userId), companyId: Number(companyId) }
        });
        if (!user) {
            throw new Error("Employee not found in this company.");
        }

        const effDate = payload.effectiveDate || new Date().toISOString().split('T')[0];
        const settings = await this.getSettings(companyId, effDate);
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
            effectiveDate: effDate,
            effectiveTo: payload.effectiveTo || null,
            hikePercentage: payload.hikePercentage,
            previousCtc: payload.previousCtc,
            revisionType: payload.revisionType,
            remarks: payload.remarks,
            ratesApplied: breakup.ratesApplied
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

    async getSalaryStructure(companyId, userId, targetDate = null) {
        return await payrollRepository.getSalaryStructureByUserId(Number(userId), Number(companyId), targetDate);
    }

    async getAllSalaryStructures(companyId, search) {
        return await payrollRepository.getAllSalaryStructures(Number(companyId), search);
    }

    async generateMonthlyPayroll(companyId, { month, year, userIds }) {
        if (!month || !year) throw new Error("Month and year are required.");

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Disallow generating payslips for the current ongoing month or future months
        if (Number(year) > currentYear || (Number(year) === currentYear && Number(month) >= currentMonth)) {
            throw new Error(`Current month (${month}/${year}) payslip cannot be generated. Payslips can only be generated for completed past months.`);
        }

        // Fetch company active users
        let whereClause = { companyId: Number(companyId) };
        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            whereClause.userId = { in: userIds.map(Number) };
        } else {
            whereClause.status = { notIn: ['RESIGNED', 'TERMINATED', 'INACTIVE'] };
        }

        const employees = await prisma.user.findMany({
            where: whereClause,
            select: { userId: true, firstName: true, lastName: true, employeeCode: true, joiningDate: true, leavingDate: true }
        });

        const generatedSlips = [];
        const skippedEmployees = [];
        const monthStart = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
        const monthEnd = new Date(year, month - 1, daysInMonth, 23, 59, 59, 999);
        const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

        // Fetch company settings EFFECTIVE for this payroll cycle date!
        const settings = await this.getSettings(Number(companyId), targetDateStr);

        for (const emp of employees) {
            // 1. Check Joining Date: Employees CANNOT get a payslip before their joining date!
            if (emp.joiningDate) {
                const jDate = new Date(emp.joiningDate);
                const jYear = jDate.getFullYear();
                const jMonth = jDate.getMonth() + 1;
                if (jYear > Number(year) || (jYear === Number(year) && jMonth > Number(month))) {
                    console.log(`[PAYROLL] Skipped employee ${emp.userId} (${emp.firstName}): joined on ${jDate.toISOString().split('T')[0]}, cycle is ${month}/${year}`);
                    skippedEmployees.push({
                        userId: emp.userId,
                        name: `${emp.firstName} ${emp.lastName || ''}`.trim() || `User #${emp.userId}`,
                        employeeCode: emp.employeeCode || '',
                        joiningDate: jDate.toISOString().split('T')[0],
                        reason: `Joined on ${jDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, which is after ${month}/${year}. Payslips can only be generated from joining date onwards.`
                    });
                    continue;
                }
            }

            // 2. Check Leaving Date: Employees who left before this cycle cannot get a payslip
            if (emp.leavingDate) {
                const lDate = new Date(emp.leavingDate);
                const lYear = lDate.getFullYear();
                const lMonth = lDate.getMonth() + 1;
                if (lYear < Number(year) || (lYear === Number(year) && lMonth < Number(month))) {
                    console.log(`[PAYROLL] Skipped employee ${emp.userId} (${emp.firstName}): left on ${lDate.toISOString().split('T')[0]}, cycle is ${month}/${year}`);
                    skippedEmployees.push({
                        userId: emp.userId,
                        name: `${emp.firstName} ${emp.lastName || ''}`.trim() || `User #${emp.userId}`,
                        employeeCode: emp.employeeCode || '',
                        reason: `Left on ${lDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, prior to ${month}/${year}.`
                    });
                    continue;
                }
            }

            // Fetch employee salary structure EFFECTIVE for this payroll cycle date!
            const structure = await payrollRepository.getSalaryStructureByUserId(emp.userId, Number(companyId), targetDateStr);
            if (!structure || !structure.annual_ctc || Number(structure.annual_ctc) <= 0) {
                console.log(`[PAYROLL] Skipped employee ${emp.userId} (${emp.firstName}): no active salary structure found for ${month}/${year}`);
                skippedEmployees.push({
                    userId: emp.userId,
                    name: `${emp.firstName} ${emp.lastName || ''}`.trim() || `User #${emp.userId}`,
                    employeeCode: emp.employeeCode || '',
                    reason: `No salary structure or CTC assigned yet.`
                });
                continue;
            }

            // Ensure component breakup values are populated (compute dynamically from CTC if needed)
            let basicMonthly = Number(structure.basic_monthly || 0);
            let hraMonthly = Number(structure.hra_monthly || 0);
            let otherAllowancesMonthly = Number(structure.other_allowances_monthly || 0);
            let employeePfMonthly = Number(structure.employee_pf_monthly || 0);
            let employeeEsiMonthly = Number(structure.employee_esi_monthly || 0);
            let professionalTaxMonthly = Number(structure.professional_tax_monthly || 0);
            let employerPfMonthly = Number(structure.employer_pf_monthly || 0);
            let employerEsiMonthly = Number(structure.employer_esi_monthly || 0);
            let gratuityMonthly = Number(structure.gratuity_monthly || 0);

            if ((!basicMonthly || basicMonthly === 0) && Number(structure.annual_ctc || 0) > 0) {
                try {
                    const computed = this.calculateSalaryBreakup({ annualCtc: Number(structure.annual_ctc) }, settings);
                    basicMonthly = computed.monthly.basicPay;
                    hraMonthly = computed.monthly.hra;
                    otherAllowancesMonthly = computed.monthly.otherAllowances;
                    employeePfMonthly = computed.monthly.employeePf;
                    employeeEsiMonthly = computed.monthly.employeeEsi;
                    professionalTaxMonthly = computed.monthly.professionalTax;
                    employerPfMonthly = computed.monthly.employerPf;
                    employerEsiMonthly = computed.monthly.employerEsi;
                    gratuityMonthly = computed.monthly.gratuity;
                } catch (e) {
                    console.error("Error computing dynamic salary breakup:", e);
                }
            }

            // Calculate working days & pro-ration for employees joining/leaving mid-month
            const totalDaysInMonth = daysInMonth;
            let activeDaysInMonth = totalDaysInMonth;

            // If employee joined during this month, payable tenure begins on their joining date
            if (emp.joiningDate) {
                const jDate = new Date(emp.joiningDate);
                const jYear = jDate.getFullYear();
                const jMonth = jDate.getMonth() + 1;
                if (jYear === Number(year) && jMonth === Number(month)) {
                    const joiningDay = jDate.getDate();
                    activeDaysInMonth = Math.max(1, totalDaysInMonth - joiningDay + 1);
                }
            }

            // If employee left during this month, tenure ends on leaving date
            if (emp.leavingDate) {
                const lDate = new Date(emp.leavingDate);
                const lYear = lDate.getFullYear();
                const lMonth = lDate.getMonth() + 1;
                if (lYear === Number(year) && lMonth === Number(month)) {
                    const leavingDay = lDate.getDate();
                    activeDaysInMonth = Math.min(activeDaysInMonth, leavingDay);
                }
            }

            const workingDays = activeDaysInMonth;

            // Calculate attendance/loss of pay if recorded
            let lossOfPayDays = 0;
            try {
                let attendanceStartDate = monthStart;
                let attendanceEndDate = monthEnd;

                if (emp.joiningDate) {
                    const jDate = new Date(emp.joiningDate);
                    if (jDate > monthStart && jDate <= monthEnd) {
                        attendanceStartDate = jDate;
                    }
                }

                if (emp.leavingDate) {
                    const lDate = new Date(emp.leavingDate);
                    if (lDate >= monthStart && lDate < monthEnd) {
                        attendanceEndDate = lDate;
                    }
                }

                const absentCount = await prisma.attendance.count({
                    where: {
                        userId: emp.userId,
                        date: { gte: attendanceStartDate, lte: attendanceEndDate },
                        status: 'ABSENT'
                    }
                });
                lossOfPayDays = absentCount;
            } catch (e) {
                lossOfPayDays = 0;
            }

            const paidDays = Math.max(0, workingDays - lossOfPayDays);
            const payFactor = totalDaysInMonth > 0 ? paidDays / totalDaysInMonth : 1;

            const basicEarned = Math.round((basicMonthly || 0) * payFactor * 100) / 100;
            const hraEarned = Math.round((hraMonthly || 0) * payFactor * 100) / 100;
            const otherAllowancesEarned = Math.round((otherAllowancesMonthly || 0) * payFactor * 100) / 100;
            const grossEarned = basicEarned + hraEarned + otherAllowancesEarned;

            // EPF Contribution: If basic is more than 15000/m take 1800 only. 12% applies only if basic <= 15000/m
            let baseMonthlyPf = employeePfMonthly;
            if (basicMonthly > 15000) {
                baseMonthlyPf = 1800;
            } else if (basicMonthly <= 15000 && (!baseMonthlyPf || baseMonthlyPf > 1800)) {
                baseMonthlyPf = Math.round(basicMonthly * (Number(settings.employeePfRate || 12.00) / 100));
            }
            const employeePf = Math.round(baseMonthlyPf * payFactor * 100) / 100;

            // ESI Contribution: If base amount is more than 21000/m, both Employee and Employer ESI are 0
            const esiThreshold = Number(settings.statutoryEsiGrossLimit || 21000);
            const isEsiExempt = basicMonthly > esiThreshold || basicEarned > esiThreshold;

            const employeeEsi = isEsiExempt 
                ? 0 
                : Math.round((employeeEsiMonthly || 0) * payFactor * 100) / 100;
            const professionalTax = professionalTaxMonthly;
            const totalDeductions = employeePf + employeeEsi + professionalTax;
            const netPay = Math.round((grossEarned - totalDeductions) * 100) / 100;

            const employerPf = Math.round((employerPfMonthly || 0) * payFactor * 100) / 100;
            const employerEsi = isEsiExempt 
                ? 0 
                : Math.round((employerEsiMonthly || 0) * payFactor * 100) / 100;
            const gratuity = Math.round((gratuityMonthly || 0) * payFactor * 100) / 100;
            const ctcEarned = grossEarned + employerPf + employerEsi + gratuity;

            const slipData = {
                userId: emp.userId,
                salaryStructureId: structure.id || null,
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
                basicPercentage: Number(settings.basicPercentage || 50),
                employeePfRate: Number(settings.employeePfRate || 12),
                employeeEsiRate: Number(settings.employeeEsiRate || 0.75),
                employerPfRate: Number(settings.employerPfRate || 13),
                employerEsiRate: Number(settings.employerEsiRate || 3.25),
                gratuityRate: Number(settings.gratuityRate || 4.81),
                ratesApplied: settings,
                paymentStatus: 'GENERATED',
                remarks: `Payroll for ${month}/${year}`
            };

            const saved = await payrollRepository.upsertPayslip(Number(companyId), slipData);
            generatedSlips.push(saved);
        }

        let message = `Successfully generated ${generatedSlips.length} payslip(s) for ${month}/${year}.`;
        if (generatedSlips.length === 0) {
            if (employees.length === 0) {
                message = `No active employees found in this company.`;
            } else if (skippedEmployees.length > 0) {
                const joinedAfter = skippedEmployees.filter(s => s.reason.includes('after'));
                const noSalary = skippedEmployees.filter(s => s.reason.includes('No salary'));
                if (joinedAfter.length === employees.length) {
                    const firstDate = skippedEmployees[0]?.joiningDate || '';
                    message = `No payslips generated: All active employees joined after ${month}/${year}. (e.g. joined ${firstDate}). Payslips can only be generated from joining date onwards.`;
                } else if (noSalary.length === employees.length) {
                    message = `No payslips generated: Active employees have not been assigned CTC / salary structure yet. Please assign salary structure first.`;
                } else {
                    message = `No payslips generated: ${skippedEmployees.map(s => `${s.name} (${s.reason})`).join('; ')}`;
                }
            }
        }

        return {
            count: generatedSlips.length,
            payslips: generatedSlips,
            skipped: skippedEmployees,
            totalEmployeesChecked: employees.length,
            message
        };
    }

    async getPayslips(companyId, filters) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const isCurrentOrFuture = filters && filters.year && filters.month &&
            (Number(filters.year) > currentYear || (Number(filters.year) === currentYear && Number(filters.month) >= currentMonth));

        // If current ongoing month or future month is requested, return empty
        if (isCurrentOrFuture) {
            return [];
        }

        return await payrollRepository.getPayslips(Number(companyId), filters);
    }

    async getPayslipById(id, companyId) {
        return await payrollRepository.getPayslipById(Number(id), Number(companyId));
    }

    async updatePayslipStatus(id, companyId, status, paymentDate) {
        return await payrollRepository.updatePayslipStatus(Number(id), Number(companyId), status, paymentDate);
    }

    async deletePayslip(id, companyId) {
        return await payrollRepository.deletePayslip(Number(id), Number(companyId));
    }
}

module.exports = new PayrollService();
