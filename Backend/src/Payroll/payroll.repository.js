const prisma = require("../config/prisma");

class PayrollRepository {
    constructor() {
        this.initialized = false;
        this.initPromise = null;
    }

    async ensureTables() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                // Create payroll_settings table
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS payroll_settings (
                        id SERIAL PRIMARY KEY,
                        company_id INTEGER NOT NULL UNIQUE,
                        basic_percentage NUMERIC(5, 2) DEFAULT 50.00,
                        hra_percentage NUMERIC(5, 2) DEFAULT 25.00,
                        other_allowances_percentage NUMERIC(5, 2) DEFAULT 25.00,
                        employee_pf_rate NUMERIC(5, 2) DEFAULT 12.00,
                        employee_esi_rate NUMERIC(5, 2) DEFAULT 0.75,
                        professional_tax NUMERIC(10, 2) DEFAULT 200.00,
                        employer_pf_rate NUMERIC(5, 2) DEFAULT 13.00,
                        employer_esi_rate NUMERIC(5, 2) DEFAULT 3.25,
                        gratuity_rate NUMERIC(5, 2) DEFAULT 4.81,
                        statutory_pf_wage_limit NUMERIC(10, 2) DEFAULT 15000.00,
                        use_pf_wage_ceiling BOOLEAN DEFAULT TRUE,
                        statutory_esi_gross_limit NUMERIC(10, 2) DEFAULT 21000.00,
                        updated_by INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Create employee_salary_structures table
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS employee_salary_structures (
                        id SERIAL PRIMARY KEY,
                        company_id INTEGER NOT NULL,
                        user_id INTEGER NOT NULL UNIQUE,
                        annual_ctc NUMERIC(12, 2) NOT NULL,
                        monthly_ctc NUMERIC(12, 2) NOT NULL,
                        monthly_gross NUMERIC(12, 2) NOT NULL,
                        annual_gross NUMERIC(12, 2) NOT NULL,
                        basic_monthly NUMERIC(12, 2) NOT NULL,
                        basic_annual NUMERIC(12, 2) NOT NULL,
                        hra_monthly NUMERIC(12, 2) NOT NULL,
                        hra_annual NUMERIC(12, 2) NOT NULL,
                        other_allowances_monthly NUMERIC(12, 2) NOT NULL,
                        other_allowances_annual NUMERIC(12, 2) NOT NULL,
                        employee_pf_monthly NUMERIC(12, 2) NOT NULL,
                        employee_pf_annual NUMERIC(12, 2) NOT NULL,
                        employee_esi_monthly NUMERIC(12, 2) NOT NULL,
                        employee_esi_annual NUMERIC(12, 2) NOT NULL,
                        professional_tax_monthly NUMERIC(12, 2) NOT NULL,
                        professional_tax_annual NUMERIC(12, 2) NOT NULL,
                        total_deductions_monthly NUMERIC(12, 2) NOT NULL,
                        total_deductions_annual NUMERIC(12, 2) NOT NULL,
                        net_salary_monthly NUMERIC(12, 2) NOT NULL,
                        net_salary_annual NUMERIC(12, 2) NOT NULL,
                        employer_pf_monthly NUMERIC(12, 2) NOT NULL,
                        employer_pf_annual NUMERIC(12, 2) NOT NULL,
                        employer_esi_monthly NUMERIC(12, 2) NOT NULL,
                        employer_esi_annual NUMERIC(12, 2) NOT NULL,
                        gratuity_monthly NUMERIC(12, 2) NOT NULL,
                        gratuity_annual NUMERIC(12, 2) NOT NULL,
                        status VARCHAR(20) DEFAULT 'ACTIVE',
                        effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Create employee_payslips table
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS employee_payslips (
                        id SERIAL PRIMARY KEY,
                        company_id INTEGER NOT NULL,
                        user_id INTEGER NOT NULL,
                        salary_structure_id INTEGER,
                        month INTEGER NOT NULL,
                        year INTEGER NOT NULL,
                        working_days INTEGER DEFAULT 30,
                        paid_days NUMERIC(4, 1) DEFAULT 30,
                        loss_of_pay_days NUMERIC(4, 1) DEFAULT 0,
                        basic_earned NUMERIC(12, 2) NOT NULL,
                        hra_earned NUMERIC(12, 2) NOT NULL,
                        other_allowances_earned NUMERIC(12, 2) NOT NULL,
                        gross_earned NUMERIC(12, 2) NOT NULL,
                        employee_pf NUMERIC(12, 2) NOT NULL,
                        employee_esi NUMERIC(12, 2) NOT NULL,
                        professional_tax NUMERIC(12, 2) NOT NULL,
                        total_deductions NUMERIC(12, 2) NOT NULL,
                        net_pay NUMERIC(12, 2) NOT NULL,
                        employer_pf NUMERIC(12, 2) NOT NULL,
                        employer_esi NUMERIC(12, 2) NOT NULL,
                        gratuity NUMERIC(12, 2) NOT NULL,
                        ctc_earned NUMERIC(12, 2) NOT NULL,
                        payment_status VARCHAR(20) DEFAULT 'GENERATED',
                        payment_date TIMESTAMP,
                        remarks TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year)
                    );
                `);

                // Create employee_salary_history table for hike & revision tracking
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS employee_salary_history (
                        id SERIAL PRIMARY KEY,
                        company_id INTEGER NOT NULL,
                        user_id INTEGER NOT NULL,
                        previous_annual_ctc NUMERIC(12, 2) DEFAULT 0,
                        new_annual_ctc NUMERIC(12, 2) NOT NULL,
                        previous_monthly_ctc NUMERIC(12, 2) DEFAULT 0,
                        new_monthly_ctc NUMERIC(12, 2) NOT NULL,
                        hike_percentage NUMERIC(6, 2) DEFAULT 0,
                        hike_amount NUMERIC(12, 2) DEFAULT 0,
                        revision_type VARCHAR(50) DEFAULT 'INITIAL',
                        effective_date DATE NOT NULL,
                        remarks TEXT,
                        created_by INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Normalize any existing salary structures to ensure basic > 15000 has employee_pf capped at 1800
                await prisma.$executeRawUnsafe(`
                    UPDATE employee_salary_structures
                    SET employee_pf_monthly = 1800.00,
                        employee_pf_annual = 21600.00,
                        total_deductions_monthly = 1800.00 + employee_esi_monthly + professional_tax_monthly,
                        total_deductions_annual = 21600.00 + employee_esi_annual + professional_tax_annual,
                        net_salary_monthly = monthly_gross - (1800.00 + employee_esi_monthly + professional_tax_monthly),
                        net_salary_annual = annual_gross - (21600.00 + employee_esi_annual + professional_tax_annual)
                    WHERE basic_monthly > 15000 AND employee_pf_monthly > 1800;
                `).catch(() => {});

                // Normalize any existing salary structures to ensure basic > 21000 has ESI (both employee & employer) set to 0
                await prisma.$executeRawUnsafe(`
                    UPDATE employee_salary_structures
                    SET employee_esi_monthly = 0.00,
                        employee_esi_annual = 0.00,
                        employer_esi_monthly = 0.00,
                        employer_esi_annual = 0.00,
                        total_deductions_monthly = employee_pf_monthly + professional_tax_monthly,
                        total_deductions_annual = employee_pf_annual + professional_tax_annual,
                        net_salary_monthly = monthly_gross - (employee_pf_monthly + professional_tax_monthly),
                        net_salary_annual = annual_gross - (employee_pf_annual + professional_tax_annual)
                    WHERE basic_monthly > 21000 AND (employee_esi_monthly > 0 OR employer_esi_monthly > 0);
                `).catch(() => {});

                // Normalize payslips where basic_earned > 21000
                await prisma.$executeRawUnsafe(`
                    UPDATE payslips
                    SET employee_esi = 0.00,
                        employer_esi = 0.00,
                        total_deductions = employee_pf + professional_tax,
                        net_pay = gross_earned - (employee_pf + professional_tax),
                        ctc_earned = gross_earned + employer_pf + gratuity
                    WHERE basic_earned > 21000 AND (employee_esi > 0 OR employer_esi > 0);
                `).catch(() => {});

                this.initialized = true;
            } catch (err) {
                console.error("Error initializing payroll tables:", err);
            } finally {
                this.initPromise = null;
            }
        })();

        return this.initPromise;
    }

    async getSettings(companyId) {
        await this.ensureTables();
        const rows = await prisma.$queryRawUnsafe(
            `SELECT * FROM payroll_settings WHERE company_id = $1 LIMIT 1`,
            companyId
        );
        return rows[0] || null;
    }

    async upsertSettings(companyId, data, updatedBy) {
        await this.ensureTables();
        const existing = await this.getSettings(companyId);

        if (existing) {
            const rows = await prisma.$queryRawUnsafe(`
                UPDATE payroll_settings SET
                    basic_percentage = COALESCE($1, basic_percentage),
                    hra_percentage = COALESCE($2, hra_percentage),
                    other_allowances_percentage = COALESCE($3, other_allowances_percentage),
                    employee_pf_rate = COALESCE($4, employee_pf_rate),
                    employee_esi_rate = COALESCE($5, employee_esi_rate),
                    professional_tax = COALESCE($6, professional_tax),
                    employer_pf_rate = COALESCE($7, employer_pf_rate),
                    employer_esi_rate = COALESCE($8, employer_esi_rate),
                    gratuity_rate = COALESCE($9, gratuity_rate),
                    statutory_pf_wage_limit = COALESCE($10, statutory_pf_wage_limit),
                    use_pf_wage_ceiling = COALESCE($11, use_pf_wage_ceiling),
                    statutory_esi_gross_limit = COALESCE($12, statutory_esi_gross_limit),
                    updated_by = $13,
                    updated_at = CURRENT_TIMESTAMP
                WHERE company_id = $14
                RETURNING *
            `,
                data.basicPercentage,
                data.hraPercentage,
                data.otherAllowancesPercentage,
                data.employeePfRate,
                data.employeeEsiRate,
                data.professionalTax,
                data.employerPfRate,
                data.employerEsiRate,
                data.gratuityRate,
                data.statutoryPfWageLimit,
                data.usePfWageCeiling,
                data.statutoryEsiGrossLimit,
                updatedBy || null,
                companyId
            );
            return rows[0];
        } else {
            const rows = await prisma.$queryRawUnsafe(`
                INSERT INTO payroll_settings (
                    company_id, basic_percentage, hra_percentage, other_allowances_percentage,
                    employee_pf_rate, employee_esi_rate, professional_tax,
                    employer_pf_rate, employer_esi_rate, gratuity_rate,
                    statutory_pf_wage_limit, use_pf_wage_ceiling, statutory_esi_gross_limit,
                    updated_by
                ) VALUES (
                    $1, COALESCE($2, 50.00), COALESCE($3, 25.00), COALESCE($4, 25.00),
                    COALESCE($5, 12.00), COALESCE($6, 0.75), COALESCE($7, 200.00),
                    COALESCE($8, 13.00), COALESCE($9, 3.25), COALESCE($10, 4.81),
                    COALESCE($11, 15000.00), COALESCE($12, TRUE), COALESCE($13, 21000.00),
                    $14
                )
                RETURNING *
            `,
                companyId,
                data.basicPercentage,
                data.hraPercentage,
                data.otherAllowancesPercentage,
                data.employeePfRate,
                data.employeeEsiRate,
                data.professionalTax,
                data.employerPfRate,
                data.employerEsiRate,
                data.gratuityRate,
                data.statutoryPfWageLimit,
                data.usePfWageCeiling,
                data.statutoryEsiGrossLimit,
                updatedBy || null
            );
            return rows[0];
        }
    }

    async getSalaryStructureByUserId(userId, companyId) {
        await this.ensureTables();
        const rows = await prisma.$queryRawUnsafe(`
            SELECT s.*, 
                   u.first_name, u.last_name, u.employee_code, u.official_email,
                   d.designation_name, dept.department_name
            FROM employee_salary_structures s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN designations d ON u.designation_id = d.designation_id
            LEFT JOIN departments dept ON u.department_id = dept.department_id
            WHERE s.user_id = $1 AND s.company_id = $2
            LIMIT 1
        `, userId, companyId);
        return rows[0] || null;
    }

    async getAllSalaryStructures(companyId, search = "") {
        await this.ensureTables();
        let query = `
            SELECT s.*, 
                   u.user_id, u.first_name, u.last_name, u.employee_code, u.official_email,
                   d.designation_name, dept.department_name,
                   h.hike_percentage, h.hike_amount, h.previous_annual_ctc, h.revision_type, h.remarks as hike_remarks
            FROM users u
            LEFT JOIN employee_salary_structures s ON u.user_id = s.user_id AND s.company_id = $1
            LEFT JOIN designations d ON u.designation_id = d.designation_id
            LEFT JOIN departments dept ON u.department_id = dept.department_id
            LEFT JOIN LATERAL (
                SELECT hike_percentage, hike_amount, previous_annual_ctc, revision_type, remarks
                FROM employee_salary_history
                WHERE user_id = u.user_id AND company_id = $1
                ORDER BY effective_date DESC, created_at DESC
                LIMIT 1
            ) h ON true
            WHERE u.company_id = $1 AND u.status = 'ACTIVE'
        `;
        const params = [companyId];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2 OR u.employee_code ILIKE $2 OR u.official_email ILIKE $2)`;
        }

        query += ` ORDER BY u.first_name ASC`;
        return await prisma.$queryRawUnsafe(query, ...params);
    }

    async assignSalaryStructure(companyId, userId, data, createdBy) {
        await this.ensureTables();
        const existing = await prisma.$queryRawUnsafe(
            `SELECT id, annual_ctc, monthly_ctc, effective_date FROM employee_salary_structures WHERE user_id = $1 AND company_id = $2`,
            userId, companyId
        );

        const effDate = data.effectiveDate ? new Date(data.effectiveDate) : new Date();

        let result;
        if (existing.length > 0) {
            const oldRecord = existing[0];
            const oldAnnual = Number(oldRecord.annual_ctc) || 0;
            const newAnnual = Number(data.annualCtc) || 0;
            const oldMonthly = Number(oldRecord.monthly_ctc) || 0;
            const newMonthly = Number(data.monthlyCtc) || 0;
            const hikeAmount = Math.max(0, newAnnual - oldAnnual);
            const hikePercentage = data.hikePercentage !== undefined && data.hikePercentage !== null
                ? Number(data.hikePercentage)
                : (oldAnnual > 0 && newAnnual > oldAnnual ? Math.round(((newAnnual - oldAnnual) / oldAnnual) * 100 * 100) / 100 : 0);
            const revisionType = data.revisionType || (newAnnual > oldAnnual ? 'HIKE' : 'REVISION');

            const rows = await prisma.$queryRawUnsafe(`
                UPDATE employee_salary_structures SET
                    annual_ctc = $1, monthly_ctc = $2, monthly_gross = $3, annual_gross = $4,
                    basic_monthly = $5, basic_annual = $6, hra_monthly = $7, hra_annual = $8,
                    other_allowances_monthly = $9, other_allowances_annual = $10,
                    employee_pf_monthly = $11, employee_pf_annual = $12,
                    employee_esi_monthly = $13, employee_esi_annual = $14,
                    professional_tax_monthly = $15, professional_tax_annual = $16,
                    total_deductions_monthly = $17, total_deductions_annual = $18,
                    net_salary_monthly = $19, net_salary_annual = $20,
                    employer_pf_monthly = $21, employer_pf_annual = $22,
                    employer_esi_monthly = $23, employer_esi_annual = $24,
                    gratuity_monthly = $25, gratuity_annual = $26,
                    effective_date = $27,
                    status = 'ACTIVE',
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $28 AND company_id = $29
                RETURNING *
            `,
                data.annualCtc, data.monthlyCtc, data.monthlyGross, data.annualGross,
                data.basicMonthly, data.basicAnnual, data.hraMonthly, data.hraAnnual,
                data.otherAllowancesMonthly, data.otherAllowancesAnnual,
                data.employeePfMonthly, data.employeePfAnnual,
                data.employeeEsiMonthly, data.employeeEsiAnnual,
                data.professionalTaxMonthly, data.professionalTaxAnnual,
                data.totalDeductionsMonthly, data.totalDeductionsAnnual,
                data.netSalaryMonthly, data.netSalaryAnnual,
                data.employerPfMonthly, data.employerPfAnnual,
                data.employerEsiMonthly, data.employerEsiAnnual,
                data.gratuityMonthly, data.gratuityAnnual,
                effDate,
                userId, companyId
            );
            result = rows[0];

            // Log salary hike / revision history
            await prisma.$executeRawUnsafe(`
                INSERT INTO employee_salary_history (
                    company_id, user_id, previous_annual_ctc, new_annual_ctc,
                    previous_monthly_ctc, new_monthly_ctc, hike_percentage,
                    hike_amount, revision_type, effective_date, remarks, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `,
                companyId, userId, oldAnnual, newAnnual,
                oldMonthly, newMonthly, hikePercentage,
                hikeAmount, revisionType, effDate, data.remarks || null, createdBy || null
            ).catch(err => console.error("Error logging salary history:", err));

        } else {
            const rows = await prisma.$queryRawUnsafe(`
                INSERT INTO employee_salary_structures (
                    company_id, user_id, annual_ctc, monthly_ctc, monthly_gross, annual_gross,
                    basic_monthly, basic_annual, hra_monthly, hra_annual,
                    other_allowances_monthly, other_allowances_annual,
                    employee_pf_monthly, employee_pf_annual,
                    employee_esi_monthly, employee_esi_annual,
                    professional_tax_monthly, professional_tax_annual,
                    total_deductions_monthly, total_deductions_annual,
                    net_salary_monthly, net_salary_annual,
                    employer_pf_monthly, employer_pf_annual,
                    employer_esi_monthly, employer_esi_annual,
                    gratuity_monthly, gratuity_annual,
                    effective_date
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                    $21, $22, $23, $24, $25, $26, $27, $28, $29
                )
                RETURNING *
            `,
                companyId, userId, data.annualCtc, data.monthlyCtc, data.monthlyGross, data.annualGross,
                data.basicMonthly, data.basicAnnual, data.hraMonthly, data.hraAnnual,
                data.otherAllowancesMonthly, data.otherAllowancesAnnual,
                data.employeePfMonthly, data.employeePfAnnual,
                data.employeeEsiMonthly, data.employeeEsiAnnual,
                data.professionalTaxMonthly, data.professionalTaxAnnual,
                data.totalDeductionsMonthly, data.totalDeductionsAnnual,
                data.netSalaryMonthly, data.netSalaryAnnual,
                data.employerPfMonthly, data.employerPfAnnual,
                data.employerEsiMonthly, data.employerEsiAnnual,
                data.gratuityMonthly, data.gratuityAnnual,
                effDate
            );
            result = rows[0];

            // Log initial salary assignment history
            await prisma.$executeRawUnsafe(`
                INSERT INTO employee_salary_history (
                    company_id, user_id, previous_annual_ctc, new_annual_ctc,
                    previous_monthly_ctc, new_monthly_ctc, hike_percentage,
                    hike_amount, revision_type, effective_date, remarks, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `,
                companyId, userId, 0, Number(data.annualCtc),
                0, Number(data.monthlyCtc), 0,
                0, data.revisionType || 'INITIAL', effDate, data.remarks || 'Initial Salary Assignment', createdBy || null
            ).catch(err => console.error("Error logging initial salary history:", err));
        }

        return result;
    }

    async getSalaryHistory(companyId, userId) {
        await this.ensureTables();
        return await prisma.$queryRawUnsafe(`
            SELECT * FROM employee_salary_history 
            WHERE user_id = $1 AND company_id = $2 
            ORDER BY effective_date DESC, created_at DESC
        `, userId, companyId);
    }

    async upsertPayslip(companyId, slip) {
        await this.ensureTables();
        const rows = await prisma.$queryRawUnsafe(`
            INSERT INTO employee_payslips (
                company_id, user_id, salary_structure_id, month, year,
                working_days, paid_days, loss_of_pay_days,
                basic_earned, hra_earned, other_allowances_earned, gross_earned,
                employee_pf, employee_esi, professional_tax, total_deductions,
                net_pay, employer_pf, employer_esi, gratuity, ctc_earned,
                payment_status, remarks
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14, $15, $16,
                $17, $18, $19, $20, $21,
                COALESCE($22, 'GENERATED'), $23
            )
            ON CONFLICT (user_id, month, year) DO UPDATE SET
                working_days = EXCLUDED.working_days,
                paid_days = EXCLUDED.paid_days,
                loss_of_pay_days = EXCLUDED.loss_of_pay_days,
                basic_earned = EXCLUDED.basic_earned,
                hra_earned = EXCLUDED.hra_earned,
                other_allowances_earned = EXCLUDED.other_allowances_earned,
                gross_earned = EXCLUDED.gross_earned,
                employee_pf = EXCLUDED.employee_pf,
                employee_esi = EXCLUDED.employee_esi,
                professional_tax = EXCLUDED.professional_tax,
                total_deductions = EXCLUDED.total_deductions,
                net_pay = EXCLUDED.net_pay,
                employer_pf = EXCLUDED.employer_pf,
                employer_esi = EXCLUDED.employer_esi,
                gratuity = EXCLUDED.gratuity,
                ctc_earned = EXCLUDED.ctc_earned,
                payment_status = EXCLUDED.payment_status,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `,
            companyId, slip.userId, slip.salaryStructureId || null, slip.month, slip.year,
            slip.workingDays, slip.paidDays, slip.lossOfPayDays,
            slip.basicEarned, slip.hraEarned, slip.otherAllowancesEarned, slip.grossEarned,
            slip.employeePf, slip.employeeEsi, slip.professionalTax, slip.totalDeductions,
            slip.netPay, slip.employerPf, slip.employerEsi, slip.gratuity, slip.ctcEarned,
            slip.paymentStatus || 'GENERATED', slip.remarks || null
        );
        return rows[0];
    }

    async getPayslips(companyId, filters = {}) {
        await this.ensureTables();
        let query = `
            SELECT p.*,
                   u.first_name, u.last_name, u.employee_code, u.official_email,
                   d.designation_name, dept.department_name,
                   b.bank_name, b.account_number, b.ifsc_code,
                   pf.uan_number, pf.pf_number, esi.esi_number,
                   pi.pan_number
            FROM employee_payslips p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN designations d ON u.designation_id = d.designation_id
            LEFT JOIN departments dept ON u.department_id = dept.department_id
            LEFT JOIN bank_details b ON u.user_id = b.user_id
            LEFT JOIN pf_details pf ON u.user_id = pf.user_id
            LEFT JOIN esi_details esi ON u.user_id = esi.user_id
            LEFT JOIN personal_information pi ON u.user_id = pi.user_id
            WHERE p.company_id = $1
        `;
        const params = [companyId];
        let idx = 2;

        if (filters.userId) {
            query += ` AND p.user_id = $${idx++}`;
            params.push(Number(filters.userId));
        }
        if (filters.month) {
            query += ` AND p.month = $${idx++}`;
            params.push(Number(filters.month));
        }
        if (filters.year) {
            query += ` AND p.year = $${idx++}`;
            params.push(Number(filters.year));
        }
        if (filters.status) {
            query += ` AND p.payment_status = $${idx++}`;
            params.push(filters.status);
        }

        query += ` ORDER BY p.year DESC, p.month DESC, u.first_name ASC`;
        return await prisma.$queryRawUnsafe(query, ...params);
    }

    async getPayslipById(id, companyId) {
        await this.ensureTables();
        const rows = await prisma.$queryRawUnsafe(`
            SELECT p.*,
                   u.first_name, u.last_name, u.employee_code, u.official_email, u.joining_date,
                   d.designation_name, dept.department_name,
                   b.bank_name, b.account_number, b.ifsc_code,
                   pf.uan_number, pf.pf_number, esi.esi_number,
                   pi.pan_number,
                   c.company_name, c.company_code
            FROM employee_payslips p
            JOIN users u ON p.user_id = u.user_id
            JOIN company_details c ON p.company_id = c.company_id
            LEFT JOIN designations d ON u.designation_id = d.designation_id
            LEFT JOIN departments dept ON u.department_id = dept.department_id
            LEFT JOIN bank_details b ON u.user_id = b.user_id
            LEFT JOIN pf_details pf ON u.user_id = pf.user_id
            LEFT JOIN esi_details esi ON u.user_id = esi.user_id
            LEFT JOIN personal_information pi ON u.user_id = pi.user_id
            WHERE p.id = $1 AND p.company_id = $2
            LIMIT 1
        `, Number(id), companyId);
        return rows[0] || null;
    }

    async updatePayslipStatus(id, companyId, status, paymentDate) {
        await this.ensureTables();
        const rows = await prisma.$queryRawUnsafe(`
            UPDATE employee_payslips
            SET payment_status = $1,
                payment_date = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND company_id = $4
            RETURNING *
        `, status, paymentDate ? new Date(paymentDate) : null, Number(id), companyId);
        return rows[0] || null;
    }
}

module.exports = new PayrollRepository();
