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
                        company_id INTEGER NOT NULL,
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
                        effective_from DATE DEFAULT '2024-01-01',
                        effective_to DATE,
                        version_name VARCHAR(100),
                        remarks TEXT,
                        updated_by INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Drop legacy company_id UNIQUE constraint if exists to support date-based versioning
                await prisma.$executeRawUnsafe(`
                    ALTER TABLE payroll_settings DROP CONSTRAINT IF EXISTS payroll_settings_company_id_key;
                `).catch(() => {});

                // Add date-based versioning columns to payroll_settings
                await prisma.$executeRawUnsafe(`
                    ALTER TABLE payroll_settings ADD COLUMN IF NOT EXISTS effective_from DATE DEFAULT '2024-01-01';
                    ALTER TABLE payroll_settings ADD COLUMN IF NOT EXISTS effective_to DATE;
                    ALTER TABLE payroll_settings ADD COLUMN IF NOT EXISTS version_name VARCHAR(100);
                    ALTER TABLE payroll_settings ADD COLUMN IF NOT EXISTS remarks TEXT;
                    UPDATE payroll_settings SET effective_from = '2024-01-01' WHERE effective_from IS NULL;
                `).catch(() => {});

                // Deduplicate any rows having the exact same (company_id, effective_from)
                await prisma.$executeRawUnsafe(`
                    DELETE FROM payroll_settings a
                    USING payroll_settings b
                    WHERE a.company_id = b.company_id
                      AND a.effective_from = b.effective_from
                      AND (a.updated_at < b.updated_at OR (a.updated_at = b.updated_at AND a.id < b.id));
                `).catch(() => {});

                // Chain effective_to dates so that historical policies end 1 day prior to the next version
                await prisma.$executeRawUnsafe(`
                    WITH ordered AS (
                        SELECT id, company_id, effective_from,
                               LEAD(effective_from) OVER (PARTITION BY company_id ORDER BY effective_from ASC) as next_eff_from
                        FROM payroll_settings
                    )
                    UPDATE payroll_settings p
                    SET effective_to = (o.next_eff_from - INTERVAL '1 day')::date
                    FROM ordered o
                    WHERE p.id = o.id AND o.next_eff_from IS NOT NULL;
                `).catch(() => {});

                // Ensure only the single latest version per company has effective_to = NULL (Active)
                await prisma.$executeRawUnsafe(`
                    WITH latest AS (
                        SELECT DISTINCT ON (company_id) id
                        FROM payroll_settings
                        ORDER BY company_id, effective_from DESC, updated_at DESC
                    )
                    UPDATE payroll_settings
                    SET effective_to = NULL
                    WHERE id IN (SELECT id FROM latest);
                `).catch(() => {});

                // Ensure unique index per company and effective_from so overlapping duplicates cannot occur
                await prisma.$executeRawUnsafe(`
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_settings_company_eff 
                    ON payroll_settings (company_id, effective_from);
                `).catch(() => {});

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
                        basic_percentage NUMERIC(5, 2) DEFAULT 50.00,
                        employee_pf_rate NUMERIC(5, 2) DEFAULT 12.00,
                        employee_esi_rate NUMERIC(5, 2) DEFAULT 0.75,
                        employer_pf_rate NUMERIC(5, 2) DEFAULT 13.00,
                        employer_esi_rate NUMERIC(5, 2) DEFAULT 3.25,
                        gratuity_rate NUMERIC(5, 2) DEFAULT 4.81,
                        rates_applied JSONB,
                        payment_status VARCHAR(20) DEFAULT 'GENERATED',
                        payment_date TIMESTAMP,
                        remarks TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year)
                    );
                `);

                // Add snapshot columns to employee_payslips
                await prisma.$executeRawUnsafe(`
                    ALTER TABLE employee_payslips ADD COLUMN IF NOT EXISTS basic_percentage NUMERIC(5, 2) DEFAULT 50.00;
                    ALTER TABLE employee_payslips ADD COLUMN IF NOT EXISTS employee_pf_rate NUMERIC(5, 2) DEFAULT 12.00;
                    ALTER TABLE employee_payslips ADD COLUMN IF NOT EXISTS employee_esi_rate NUMERIC(5, 2) DEFAULT 0.75;
                    ALTER TABLE employee_payslips ADD COLUMN IF NOT EXISTS employer_pf_rate NUMERIC(5, 2) DEFAULT 13.00;
                    ALTER TABLE employee_payslips ADD COLUMN IF NOT EXISTS employer_esi_rate NUMERIC(5, 2) DEFAULT 3.25;
                    ALTER TABLE employee_payslips ADD COLUMN IF NOT EXISTS gratuity_rate NUMERIC(5, 2) DEFAULT 4.81;
                    ALTER TABLE employee_payslips ADD COLUMN IF NOT EXISTS rates_applied JSONB;
                `).catch(() => {});

                // Create employee_salary_history table for hike & revision tracking with complete component breakdown
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
                        monthly_gross NUMERIC(12, 2),
                        annual_gross NUMERIC(12, 2),
                        basic_monthly NUMERIC(12, 2),
                        basic_annual NUMERIC(12, 2),
                        hra_monthly NUMERIC(12, 2),
                        hra_annual NUMERIC(12, 2),
                        other_allowances_monthly NUMERIC(12, 2),
                        other_allowances_annual NUMERIC(12, 2),
                        employee_pf_monthly NUMERIC(12, 2),
                        employee_pf_annual NUMERIC(12, 2),
                        employee_esi_monthly NUMERIC(12, 2),
                        employee_esi_annual NUMERIC(12, 2),
                        professional_tax_monthly NUMERIC(12, 2),
                        professional_tax_annual NUMERIC(12, 2),
                        total_deductions_monthly NUMERIC(12, 2),
                        total_deductions_annual NUMERIC(12, 2),
                        net_salary_monthly NUMERIC(12, 2),
                        net_salary_annual NUMERIC(12, 2),
                        employer_pf_monthly NUMERIC(12, 2),
                        employer_pf_annual NUMERIC(12, 2),
                        employer_esi_monthly NUMERIC(12, 2),
                        employer_esi_annual NUMERIC(12, 2),
                        gratuity_monthly NUMERIC(12, 2),
                        gratuity_annual NUMERIC(12, 2),
                        rates_applied JSONB,
                        remarks TEXT,
                        created_by INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Add component breakdown columns to existing employee_salary_history if not present
                await prisma.$executeRawUnsafe(`
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS monthly_gross NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS annual_gross NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS basic_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS basic_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS hra_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS hra_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS other_allowances_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS other_allowances_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employee_pf_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employee_pf_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employee_esi_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employee_esi_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS professional_tax_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS professional_tax_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS total_deductions_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS total_deductions_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS net_salary_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS net_salary_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employer_pf_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employer_pf_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employer_esi_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS employer_esi_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS gratuity_monthly NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS gratuity_annual NUMERIC(12, 2);
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS rates_applied JSONB;
                    ALTER TABLE employee_salary_structures ADD COLUMN IF NOT EXISTS effective_to DATE;
                    ALTER TABLE employee_salary_history ADD COLUMN IF NOT EXISTS effective_to DATE;
                `).catch(() => {});

                // Backfill any salary history records missing breakdown from current structure
                await prisma.$executeRawUnsafe(`
                    UPDATE employee_salary_history h
                    SET monthly_gross = s.monthly_gross,
                        annual_gross = s.annual_gross,
                        basic_monthly = s.basic_monthly,
                        basic_annual = s.basic_annual,
                        hra_monthly = s.hra_monthly,
                        hra_annual = s.hra_annual,
                        other_allowances_monthly = s.other_allowances_monthly,
                        other_allowances_annual = s.other_allowances_annual,
                        employee_pf_monthly = s.employee_pf_monthly,
                        employee_pf_annual = s.employee_pf_annual,
                        employee_esi_monthly = s.employee_esi_monthly,
                        employee_esi_annual = s.employee_esi_annual,
                        professional_tax_monthly = s.professional_tax_monthly,
                        professional_tax_annual = s.professional_tax_annual,
                        total_deductions_monthly = s.total_deductions_monthly,
                        total_deductions_annual = s.total_deductions_annual,
                        net_salary_monthly = s.net_salary_monthly,
                        net_salary_annual = s.net_salary_annual,
                        employer_pf_monthly = s.employer_pf_monthly,
                        employer_pf_annual = s.employer_pf_annual,
                        employer_esi_monthly = s.employer_esi_monthly,
                        employer_esi_annual = s.employer_esi_annual,
                        gratuity_monthly = s.gratuity_monthly,
                        gratuity_annual = s.gratuity_annual
                    FROM employee_salary_structures s
                    WHERE h.user_id = s.user_id AND h.company_id = s.company_id AND h.basic_monthly IS NULL;
                `).catch(() => {});

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

                // Backfill effective_to for prior history rows based on the subsequent revision start date
                await prisma.$executeRawUnsafe(`
                    UPDATE employee_salary_history h
                    SET effective_to = (
                        SELECT (h2.effective_date - INTERVAL '1 day')::date
                        FROM employee_salary_history h2
                        WHERE h2.user_id = h.user_id AND h2.company_id = h.company_id
                          AND h2.effective_date > h.effective_date
                        ORDER BY h2.effective_date ASC
                        LIMIT 1
                    )
                    WHERE h.effective_to IS NULL
                      AND EXISTS (
                        SELECT 1 FROM employee_salary_history h2
                        WHERE h2.user_id = h.user_id AND h2.company_id = h.company_id
                          AND h2.effective_date > h.effective_date
                      );
                `).catch(() => {});

                // Restore / sync employee_salary_structures from latest history if structure row is missing
                await prisma.$executeRawUnsafe(`
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
                        effective_date, effective_to, status
                    )
                    SELECT DISTINCT ON (h.company_id, h.user_id)
                        h.company_id, h.user_id, h.new_annual_ctc, h.new_monthly_ctc, 
                        COALESCE(h.monthly_gross, ROUND(h.new_monthly_ctc * 0.9, 2)),
                        COALESCE(h.annual_gross, ROUND(h.new_annual_ctc * 0.9, 2)),
                        COALESCE(h.basic_monthly, ROUND(h.new_monthly_ctc * 0.5, 2)),
                        COALESCE(h.basic_annual, ROUND(h.new_annual_ctc * 0.5, 2)),
                        COALESCE(h.hra_monthly, ROUND(h.new_monthly_ctc * 0.25, 2)),
                        COALESCE(h.hra_annual, ROUND(h.new_annual_ctc * 0.25, 2)),
                        COALESCE(h.other_allowances_monthly, ROUND(h.new_monthly_ctc * 0.15, 2)),
                        COALESCE(h.other_allowances_annual, ROUND(h.new_annual_ctc * 0.15, 2)),
                        COALESCE(h.employee_pf_monthly, 1800.00),
                        COALESCE(h.employee_pf_annual, 21600.00),
                        COALESCE(h.employee_esi_monthly, 0.00),
                        COALESCE(h.employee_esi_annual, 0.00),
                        COALESCE(h.professional_tax_monthly, 200.00),
                        COALESCE(h.professional_tax_annual, 2400.00),
                        COALESCE(h.total_deductions_monthly, 2000.00),
                        COALESCE(h.total_deductions_annual, 24000.00),
                        COALESCE(h.net_salary_monthly, ROUND(h.new_monthly_ctc * 0.85, 2)),
                        COALESCE(h.net_salary_annual, ROUND(h.new_annual_ctc * 0.85, 2)),
                        COALESCE(h.employer_pf_monthly, 1950.00),
                        COALESCE(h.employer_pf_annual, 23400.00),
                        COALESCE(h.employer_esi_monthly, 0.00),
                        COALESCE(h.employer_esi_annual, 0.00),
                        COALESCE(h.gratuity_monthly, 0.00),
                        COALESCE(h.gratuity_annual, 0.00),
                        h.effective_date, h.effective_to, 'ACTIVE'
                    FROM employee_salary_history h
                    WHERE h.new_annual_ctc > 0
                      AND NOT EXISTS (
                        SELECT 1 FROM employee_salary_structures s 
                        WHERE s.user_id = h.user_id AND s.company_id = h.company_id
                      )
                    ORDER BY h.company_id, h.user_id, h.effective_date DESC, h.created_at DESC;
                `).catch(() => {});

                // Remove any invalid historical payslips generated prior to the employee's joining date
                await prisma.$executeRawUnsafe(`
                    DELETE FROM employee_payslips p
                    USING users u
                    WHERE p.user_id = u.user_id
                      AND u.joining_date IS NOT NULL
                      AND u.joining_date > (make_date(p.year, p.month, 1) + INTERVAL '1 month' - INTERVAL '1 day')::date;
                `).catch(() => {});

                // Remove any prematurely generated payslips for current ongoing or future months
                await prisma.$executeRawUnsafe(`
                    DELETE FROM employee_payslips
                    WHERE year > EXTRACT(YEAR FROM CURRENT_DATE)
                       OR (year = EXTRACT(YEAR FROM CURRENT_DATE) AND month >= EXTRACT(MONTH FROM CURRENT_DATE));
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

    async getSettings(companyId, targetDate = null) {
        await this.ensureTables();
        if (targetDate) {
            const rows = await prisma.$queryRawUnsafe(
                `SELECT * FROM payroll_settings 
                 WHERE company_id = $1 AND (effective_from <= $2::date OR effective_from IS NULL)
                 ORDER BY effective_from DESC, created_at DESC 
                 LIMIT 1`,
                companyId, targetDate
            );
            if (rows[0]) return rows[0];
        }

        const rows = await prisma.$queryRawUnsafe(
            `SELECT * FROM payroll_settings 
             WHERE company_id = $1 
             ORDER BY effective_from DESC, created_at DESC 
             LIMIT 1`,
            companyId
        );
        return rows[0] || null;
    }

    async rechainSettingsVersions(companyId) {
        // 1. Delete duplicate rows with identical (company_id, effective_from), keeping the newest
        await prisma.$executeRawUnsafe(`
            DELETE FROM payroll_settings a
            USING payroll_settings b
            WHERE a.company_id = $1 AND b.company_id = $1
              AND a.effective_from = b.effective_from
              AND (a.updated_at < b.updated_at OR (a.updated_at = b.updated_at AND a.id < b.id));
        `, companyId).catch(() => {});

        // 2. Chain older versions so effective_to ends strictly 1 day before the next version starts
        await prisma.$executeRawUnsafe(`
            WITH ordered AS (
                SELECT id, company_id, effective_from,
                       LEAD(effective_from) OVER (PARTITION BY company_id ORDER BY effective_from ASC) as next_eff_from
                FROM payroll_settings
                WHERE company_id = $1
            )
            UPDATE payroll_settings p
            SET effective_to = (o.next_eff_from - INTERVAL '1 day')::date,
                updated_at = CURRENT_TIMESTAMP
            FROM ordered o
            WHERE p.id = o.id AND o.next_eff_from IS NOT NULL;
        `, companyId).catch(() => {});

        // 3. Ensure strictly ONLY the single latest version has effective_to = NULL (Active)
        await prisma.$executeRawUnsafe(`
            WITH latest AS (
                SELECT id
                FROM payroll_settings
                WHERE company_id = $1
                ORDER BY effective_from DESC, updated_at DESC
                LIMIT 1
            )
            UPDATE payroll_settings
            SET effective_to = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE company_id = $1 AND id IN (SELECT id FROM latest);
        `, companyId).catch(() => {});
    }

    async getSettingsHistory(companyId) {
        await this.ensureTables();
        await this.rechainSettingsVersions(companyId);
        return await prisma.$queryRawUnsafe(
            `SELECT DISTINCT ON (effective_from) * 
             FROM payroll_settings 
             WHERE company_id = $1 
             ORDER BY effective_from DESC, updated_at DESC`,
            companyId
        );
    }

    async deleteSettingsVersion(companyId, versionId) {
        await this.ensureTables();
        const total = await prisma.$queryRawUnsafe(
            `SELECT count(*) as count FROM payroll_settings WHERE company_id = $1`,
            companyId
        );
        if (Number(total[0]?.count || 0) <= 1) {
            throw new Error("Cannot delete the only existing payroll policy version.");
        }
        await prisma.$executeRawUnsafe(
            `DELETE FROM payroll_settings WHERE id = $1 AND company_id = $2`,
            Number(versionId), companyId
        );
        await this.rechainSettingsVersions(companyId);
        return true;
    }

    async upsertSettings(companyId, data, updatedBy) {
        await this.ensureTables();
        const effFrom = data.effectiveFrom 
            ? new Date(data.effectiveFrom).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0];

        // Check if an existing version exists for this EXACT effective_from date
        const existingVersion = await prisma.$queryRawUnsafe(
            `SELECT * FROM payroll_settings WHERE company_id = $1 AND effective_from = $2::date LIMIT 1`,
            companyId, effFrom
        );

        let saved;
        if (existingVersion.length > 0) {
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
                    version_name = COALESCE($13, version_name),
                    remarks = COALESCE($14, remarks),
                    updated_by = $15,
                    updated_at = CURRENT_TIMESTAMP
                WHERE company_id = $16 AND effective_from = $17::date
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
                data.versionName || null,
                data.remarks || null,
                updatedBy || null,
                companyId,
                effFrom
            );
            saved = rows[0];

            // Remove any other duplicate entries with the same company and date
            await prisma.$executeRawUnsafe(
                `DELETE FROM payroll_settings WHERE company_id = $1 AND effective_from = $2::date AND id <> $3`,
                companyId, effFrom, saved.id
            ).catch(() => {});
        } else {
            const rows = await prisma.$queryRawUnsafe(`
                INSERT INTO payroll_settings (
                    company_id, basic_percentage, hra_percentage, other_allowances_percentage,
                    employee_pf_rate, employee_esi_rate, professional_tax,
                    employer_pf_rate, employer_esi_rate, gratuity_rate,
                    statutory_pf_wage_limit, use_pf_wage_ceiling, statutory_esi_gross_limit,
                    effective_from, effective_to, version_name, remarks,
                    updated_by
                ) VALUES (
                    $1, COALESCE($2, 50.00), COALESCE($3, 25.00), COALESCE($4, 25.00),
                    COALESCE($5, 12.00), COALESCE($6, 0.75), COALESCE($7, 200.00),
                    COALESCE($8, 13.00), COALESCE($9, 3.25), COALESCE($10, 4.81),
                    COALESCE($11, 15000.00), COALESCE($12, TRUE), COALESCE($13, 21000.00),
                    $14::date, NULL, $15, $16,
                    $17
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
                effFrom,
                data.versionName || `Policy starting ${effFrom}`,
                data.remarks || null,
                updatedBy || null
            );
            saved = rows[0];
        }

        // Rechain all versions to guarantee strictly zero overlap and only one active version
        await this.rechainSettingsVersions(companyId);

        return saved;
    }

    async getSalaryStructureByUserId(userId, companyId, targetDate = null) {
        await this.ensureTables();

        // If targetDate is provided, look in employee_salary_history for the structure active on that date
        if (targetDate) {
            const histRows = await prisma.$queryRawUnsafe(`
                SELECT h.id, h.company_id, h.user_id,
                       h.new_annual_ctc as annual_ctc, h.new_monthly_ctc as monthly_ctc,
                       h.monthly_gross, h.annual_gross,
                       h.basic_monthly, h.basic_annual,
                       h.hra_monthly, h.hra_annual,
                       h.other_allowances_monthly, h.other_allowances_annual,
                       h.employee_pf_monthly, h.employee_pf_annual,
                       h.employee_esi_monthly, h.employee_esi_annual,
                       h.professional_tax_monthly, h.professional_tax_annual,
                       h.total_deductions_monthly, h.total_deductions_annual,
                       h.net_salary_monthly, h.net_salary_annual,
                       h.employer_pf_monthly, h.employer_pf_annual,
                       h.employer_esi_monthly, h.employer_esi_annual,
                       h.gratuity_monthly, h.gratuity_annual,
                       h.effective_date, h.effective_to,
                       u.first_name, u.last_name, u.employee_code, u.official_email,
                       d.designation_name, dept.department_name
                FROM employee_salary_history h
                JOIN users u ON h.user_id = u.user_id
                LEFT JOIN designations d ON u.designation_id = d.designation_id
                LEFT JOIN departments dept ON u.department_id = dept.department_id
                WHERE h.user_id = $1 AND h.company_id = $2 
                  AND h.effective_date <= $3::date
                  AND (h.effective_to IS NULL OR h.effective_to >= date_trunc('month', $3::date)::date)
                ORDER BY h.effective_date DESC, h.created_at DESC
                LIMIT 1
            `, userId, companyId, targetDate);

            if (histRows.length > 0) {
                return histRows[0];
            }
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT s.*, 
                   u.first_name, u.last_name, u.employee_code, u.official_email,
                   d.designation_name, dept.department_name
            FROM employee_salary_structures s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN designations d ON u.designation_id = d.designation_id
            LEFT JOIN departments dept ON u.department_id = dept.department_id
            WHERE s.user_id = $1 AND (s.company_id = $2 OR $2 IS NULL)
              AND s.annual_ctc > 0
            LIMIT 1
        `, userId, companyId);
        if (rows.length > 0) {
            return rows[0];
        }

        // Secondary fallback: return the earliest recorded salary structure from history
        const fallbackHist = await prisma.$queryRawUnsafe(`
            SELECT h.id, h.company_id, h.user_id,
                   h.new_annual_ctc as annual_ctc, h.new_monthly_ctc as monthly_ctc,
                   h.monthly_gross, h.annual_gross,
                   h.basic_monthly, h.basic_annual,
                   h.hra_monthly, h.hra_annual,
                   h.other_allowances_monthly, h.other_allowances_annual,
                   h.employee_pf_monthly, h.employee_pf_annual,
                   h.employee_esi_monthly, h.employee_esi_annual,
                   h.professional_tax_monthly, h.professional_tax_annual,
                   h.total_deductions_monthly, h.total_deductions_annual,
                   h.net_salary_monthly, h.net_salary_annual,
                   h.employer_pf_monthly, h.employer_pf_annual,
                   h.employer_esi_monthly, h.employer_esi_annual,
                   h.gratuity_monthly, h.gratuity_annual,
                   h.effective_date, h.effective_to,
                   u.first_name, u.last_name, u.employee_code, u.official_email,
                   d.designation_name, dept.department_name
            FROM employee_salary_history h
            JOIN users u ON h.user_id = u.user_id
            LEFT JOIN designations d ON u.designation_id = d.designation_id
            LEFT JOIN departments dept ON u.department_id = dept.department_id
            WHERE h.user_id = $1 AND (h.company_id = $2 OR $2 IS NULL) AND h.new_annual_ctc > 0
            ORDER BY h.effective_date ASC, h.created_at ASC
            LIMIT 1
        `, userId, companyId);
        return fallbackHist[0] || null;
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
            `SELECT id, annual_ctc, monthly_ctc, effective_date, effective_to FROM employee_salary_structures WHERE user_id = $1 AND company_id = $2`,
            userId, companyId
        );

        const effDate = data.effectiveDate ? new Date(data.effectiveDate) : new Date();
        const effTo = data.effectiveTo ? new Date(data.effectiveTo) : null;

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
                    effective_to = $28,
                    status = 'ACTIVE',
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $29 AND company_id = $30
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
                effTo,
                userId, companyId
            );
            result = rows[0];

            // Log salary hike / revision history with COMPLETE breakdown, applied rates, and end date
            await prisma.$executeRawUnsafe(`
                INSERT INTO employee_salary_history (
                    company_id, user_id, previous_annual_ctc, new_annual_ctc,
                    previous_monthly_ctc, new_monthly_ctc, hike_percentage,
                    hike_amount, revision_type, effective_date, effective_to, remarks, created_by,
                    monthly_gross, annual_gross, basic_monthly, basic_annual,
                    hra_monthly, hra_annual, other_allowances_monthly, other_allowances_annual,
                    employee_pf_monthly, employee_pf_annual, employee_esi_monthly, employee_esi_annual,
                    professional_tax_monthly, professional_tax_annual, total_deductions_monthly, total_deductions_annual,
                    net_salary_monthly, net_salary_annual, employer_pf_monthly, employer_pf_annual,
                    employer_esi_monthly, employer_esi_annual, gratuity_monthly, gratuity_annual,
                    rates_applied
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
                    $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
                    $33, $34, $35, $36, $37, $38
                )
            `,
                companyId, userId, oldAnnual, newAnnual,
                oldMonthly, newMonthly, hikePercentage,
                hikeAmount, revisionType, effDate, effTo, data.remarks || null, createdBy || null,
                data.monthlyGross, data.annualGross, data.basicMonthly, data.basicAnnual,
                data.hraMonthly, data.hraAnnual, data.otherAllowancesMonthly, data.otherAllowancesAnnual,
                data.employeePfMonthly, data.employeePfAnnual, data.employeeEsiMonthly, data.employeeEsiAnnual,
                data.professionalTaxMonthly, data.professionalTaxAnnual, data.totalDeductionsMonthly, data.totalDeductionsAnnual,
                data.netSalaryMonthly, data.netSalaryAnnual, data.employerPfMonthly, data.employerPfAnnual,
                data.employerEsiMonthly, data.employerEsiAnnual, data.gratuityMonthly, data.gratuityAnnual,
                data.ratesApplied ? JSON.stringify(data.ratesApplied) : null
            ).catch(err => console.error("Error logging salary history:", err));

            // Adjust prior history records to end 1 day prior to this new effective_date
            await prisma.$executeRawUnsafe(`
                UPDATE employee_salary_history
                SET effective_to = ($1::date - INTERVAL '1 day')::date
                WHERE user_id = $2 AND company_id = $3
                  AND effective_date < $1::date
                  AND (effective_to IS NULL OR effective_to >= $1::date);
            `, effDate, userId, companyId).catch(() => {});

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
                    effective_date,
                    effective_to
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
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
                effDate,
                effTo
            );
            result = rows[0];

            // Log initial salary assignment history with COMPLETE breakdown and end date
            await prisma.$executeRawUnsafe(`
                INSERT INTO employee_salary_history (
                    company_id, user_id, previous_annual_ctc, new_annual_ctc,
                    previous_monthly_ctc, new_monthly_ctc, hike_percentage,
                    hike_amount, revision_type, effective_date, effective_to, remarks, created_by,
                    monthly_gross, annual_gross, basic_monthly, basic_annual,
                    hra_monthly, hra_annual, other_allowances_monthly, other_allowances_annual,
                    employee_pf_monthly, employee_pf_annual, employee_esi_monthly, employee_esi_annual,
                    professional_tax_monthly, professional_tax_annual, total_deductions_monthly, total_deductions_annual,
                    net_salary_monthly, net_salary_annual, employer_pf_monthly, employer_pf_annual,
                    employer_esi_monthly, employer_esi_annual, gratuity_monthly, gratuity_annual,
                    rates_applied
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
                    $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
                    $33, $34, $35, $36, $37, $38
                )
            `,
                companyId, userId, 0, Number(data.annualCtc),
                0, Number(data.monthlyCtc), 0,
                0, data.revisionType || 'INITIAL', effDate, effTo, data.remarks || 'Initial Salary Assignment', createdBy || null,
                data.monthlyGross, data.annualGross, data.basicMonthly, data.basicAnnual,
                data.hraMonthly, data.hraAnnual, data.otherAllowancesMonthly, data.otherAllowancesAnnual,
                data.employeePfMonthly, data.employeePfAnnual, data.employeeEsiMonthly, data.employeeEsiAnnual,
                data.professionalTaxMonthly, data.professionalTaxAnnual, data.totalDeductionsMonthly, data.totalDeductionsAnnual,
                data.netSalaryMonthly, data.netSalaryAnnual, data.employerPfMonthly, data.employerPfAnnual,
                data.employerEsiMonthly, data.employerEsiAnnual, data.gratuityMonthly, data.gratuityAnnual,
                data.ratesApplied ? JSON.stringify(data.ratesApplied) : null
            ).catch(err => console.error("Error logging initial salary history:", err));
        }

        return result;
    }

    async getSalaryHistory(companyId, userId) {
        await this.ensureTables();
        return await prisma.$queryRawUnsafe(`
            SELECT h.*,
                   COALESCE(
                       h.effective_to,
                       (
                           SELECT (h2.effective_date - INTERVAL '1 day')::date
                           FROM employee_salary_history h2
                           WHERE h2.user_id = h.user_id AND h2.company_id = h.company_id
                             AND h2.effective_date > h.effective_date
                           ORDER BY h2.effective_date ASC
                           LIMIT 1
                       )
                   ) as computed_effective_to
            FROM employee_salary_history h 
            WHERE h.user_id = $1 AND h.company_id = $2 
            ORDER BY h.effective_date DESC, h.created_at DESC
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
                basic_percentage, employee_pf_rate, employee_esi_rate,
                employer_pf_rate, employer_esi_rate, gratuity_rate, rates_applied,
                payment_status, remarks
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14, $15, $16,
                $17, $18, $19, $20, $21,
                $22, $23, $24, $25, $26, $27, $28,
                COALESCE($29, 'GENERATED'), $30
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
                basic_percentage = EXCLUDED.basic_percentage,
                employee_pf_rate = EXCLUDED.employee_pf_rate,
                employee_esi_rate = EXCLUDED.employee_esi_rate,
                employer_pf_rate = EXCLUDED.employer_pf_rate,
                employer_esi_rate = EXCLUDED.employer_esi_rate,
                gratuity_rate = EXCLUDED.gratuity_rate,
                rates_applied = EXCLUDED.rates_applied,
                payment_status = EXCLUDED.payment_status,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `,
            companyId, slip.userId, slip.salaryStructureId || null, slip.month, slip.year,
            slip.workingDays, slip.paidDays, slip.lossOfPayDays,
            slip.basicEarned, slip.hraEarned, slip.otherAllowancesEarned, slip.grossEarned,
            slip.employeePf, slip.employeeEsi, slip.professionalTax, slip.totalDeductions,
            slip.netPay, slip.employerPf, slip.employerEsi, slip.gratuity, slip.ctcEarned,
            slip.basicPercentage || 50.00, slip.employeePfRate || 12.00, slip.employeeEsiRate || 0.75,
            slip.employerPfRate || 13.00, slip.employerEsiRate || 3.25, slip.gratuityRate || 4.81,
            slip.ratesApplied ? JSON.stringify(slip.ratesApplied) : null,
            slip.paymentStatus || 'GENERATED', slip.remarks || null
        );
        return rows[0];
    }

    async getPayslips(companyId, filters = {}) {
        await this.ensureTables();
        let query = `
            SELECT p.*,
                   u.first_name, u.last_name, u.employee_code, u.official_email, u.joining_date,
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
              AND (u.joining_date IS NULL OR u.joining_date <= (make_date(p.year, p.month, 1) + INTERVAL '1 month' - INTERVAL '1 day')::date)
              AND (u.leaving_date IS NULL OR u.leaving_date >= make_date(p.year, p.month, 1)::date)
              AND (
                  p.year < EXTRACT(YEAR FROM CURRENT_DATE)
                  OR (p.year = EXTRACT(YEAR FROM CURRENT_DATE) AND p.month < EXTRACT(MONTH FROM CURRENT_DATE))
              )
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

    async deletePayslip(id, companyId) {
        await this.ensureTables();
        return await prisma.$executeRawUnsafe(
            `DELETE FROM employee_payslips WHERE id = $1 AND company_id = $2`,
            Number(id), Number(companyId)
        );
    }
}

module.exports = new PayrollRepository();
