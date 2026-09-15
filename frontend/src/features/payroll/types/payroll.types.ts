export interface PayrollSettings {
  id?: number;
  companyId?: number;
  basicPercentage: number;
  hraPercentage: number;
  otherAllowancesPercentage: number;
  employeePfRate: number;
  employeeEsiRate: number;
  professionalTax: number;
  employerPfRate: number;
  employerEsiRate: number;
  gratuityRate: number;
  statutoryPfWageLimit: number;
  usePfWageCeiling: boolean;
  statutoryEsiGrossLimit: number;
  updatedAt?: string;
}

export interface SalaryBreakupMonthly {
  ctc: number;
  grossSalary: number;
  basicPay: number;
  hra: number;
  otherAllowances: number;
  employeePf: number;
  employeeEsi: number;
  professionalTax: number;
  totalDeductions: number;
  netSalary: number;
  employerPf: number;
  employerEsi: number;
  gratuity: number;
  totalEmployerContribution: number;
}

export interface SalaryBreakupAnnual {
  ctc: number;
  grossSalary: number;
  basicPay: number;
  hra: number;
  otherAllowances: number;
  employeePf: number;
  employeeEsi: number;
  professionalTax: number;
  totalDeductions: number;
  netSalary: number;
  employerPf: number;
  employerEsi: number;
  gratuity: number;
  totalEmployerContribution: number;
}

export interface SalaryBreakupResult {
  ratesApplied: {
    basicPercentage: number;
    employeePfRate: number;
    employeeEsiRate: number;
    professionalTax: number;
    employerPfRate: number;
    employerEsiRate: number;
    gratuityRate: number;
    statutoryPfWageLimit: number;
    usePfWageCeiling: boolean;
  };
  monthly: SalaryBreakupMonthly;
  annual: SalaryBreakupAnnual;
}

export interface CalculateSalaryInput {
  annualCtc?: number;
  monthlyCtc?: number;
  monthlyGross?: number;
  basicAmount?: number;
}

export interface EmployeeSalaryStructure {
  id?: number;
  company_id?: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  official_email?: string;
  designation_name?: string;
  department_name?: string;
  annual_ctc: number | string;
  monthly_ctc: number | string;
  monthly_gross: number | string;
  annual_gross: number | string;
  basic_monthly: number | string;
  basic_annual: number | string;
  hra_monthly: number | string;
  hra_annual: number | string;
  other_allowances_monthly: number | string;
  other_allowances_annual: number | string;
  employee_pf_monthly: number | string;
  employee_pf_annual: number | string;
  employee_esi_monthly: number | string;
  employee_esi_annual: number | string;
  professional_tax_monthly: number | string;
  professional_tax_annual: number | string;
  total_deductions_monthly: number | string;
  total_deductions_annual: number | string;
  net_salary_monthly: number | string;
  net_salary_annual: number | string;
  employer_pf_monthly: number | string;
  employer_pf_annual: number | string;
  employer_esi_monthly: number | string;
  employer_esi_annual: number | string;
  gratuity_monthly: number | string;
  gratuity_annual: number | string;
  status?: string;
  effective_date?: string;
  updated_at?: string;
}

export interface Payslip {
  id: number;
  company_id: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  official_email?: string;
  joining_date?: string;
  designation_name?: string;
  department_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  uan_number?: string;
  pf_number?: string;
  esi_number?: string;
  pan_number?: string;
  company_name?: string;
  company_code?: string;
  month: number;
  year: number;
  working_days: number;
  paid_days: number;
  loss_of_pay_days: number;
  basic_earned: number | string;
  hra_earned: number | string;
  other_allowances_earned: number | string;
  gross_earned: number | string;
  employee_pf: number | string;
  employee_esi: number | string;
  professional_tax: number | string;
  total_deductions: number | string;
  net_pay: number | string;
  employer_pf: number | string;
  employer_esi: number | string;
  gratuity: number | string;
  ctc_earned: number | string;
  payment_status: "GENERATED" | "PAID" | "ON_HOLD";
  payment_date?: string;
  remarks?: string;
  created_at: string;
}
