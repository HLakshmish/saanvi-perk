"use client";

import React from "react";
import { X, Printer, Download, Building2, User, Calendar, CheckCircle2 } from "lucide-react";
import { Payslip } from "../types/payroll.types";

interface PayslipModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, onClose }) => {
  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null) return "₹0.00";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const monthLabel = MONTH_NAMES[payslip.month] || `Month ${payslip.month}`;
  const empName = `${payslip.first_name || ""} ${payslip.last_name || ""}`.trim() || `Employee #${payslip.user_id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 print:shadow-none print:border-none print:my-0 print:max-w-none">
        {/* Actions bar (Hidden in print) */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Payslip Preview — {monthLabel} {payslip.year}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Formal Payslip Container */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 print:p-6" id="printable-payslip">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {payslip.company_name || "SAANVI PERK TECH"}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Company Code: {payslip.company_code || "SAANVI"} • Official Payslip
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded-md bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider">
                Payslip for {monthLabel} {payslip.year}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Status: <span className="font-bold text-emerald-600">{payslip.payment_status}</span>
              </div>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Employee Name</div>
              <div className="font-bold text-slate-900 mt-0.5">{empName}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Employee ID</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.employee_code || `ID-${payslip.user_id}`}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Designation</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.designation_name || "Associate"}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Department</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.department_name || "Operations"}</div>
            </div>

            <div>
              <div className="text-slate-400 font-medium text-[11px]">Bank Name</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.bank_name || "HDFC Bank"}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Bank A/C No.</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.account_number || "••••••••1234"}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">UAN / PF No.</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.uan_number || payslip.pf_number || "101239847291"}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">PAN / ESI No.</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.pan_number || "ABCDE1234F"}</div>
            </div>

            <div>
              <div className="text-slate-400 font-medium text-[11px]">Total Days</div>
              <div className="font-bold text-slate-900 mt-0.5">{payslip.working_days || 30} Days</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Paid Days</div>
              <div className="font-bold text-emerald-700 mt-0.5">{payslip.paid_days || 30} Days</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">LOP Days</div>
              <div className="font-bold text-rose-600 mt-0.5">{payslip.loss_of_pay_days || 0} Days</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Payment Date</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {payslip.payment_date
                  ? new Date(payslip.payment_date).toLocaleDateString("en-IN")
                  : "End of Month"}
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Split Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 flex justify-between">
                <span>Earnings</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Pay + DA + RA (50%)</span>
                  <span className="font-semibold">{formatCurrency(payslip.basic_earned)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">House Rent Allowance (HRA)</span>
                  <span className="font-semibold">{formatCurrency(payslip.hra_earned)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Other Allowances</span>
                  <span className="font-semibold">{formatCurrency(payslip.other_allowances_earned)}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-extrabold text-xs uppercase tracking-wider text-indigo-900 border-t border-slate-200 flex justify-between">
                <span>Total Gross Earnings</span>
                <span className="text-sm font-black">{formatCurrency(payslip.gross_earned)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 flex justify-between">
                <span>Deductions</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Employee EPF (12%)</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(payslip.employee_pf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Employee ESI (0.75%)</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(payslip.employee_esi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Professional Tax (PT)</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(payslip.professional_tax)}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-extrabold text-xs uppercase tracking-wider text-rose-900 border-t border-slate-200 flex justify-between">
                <span>Total Deductions</span>
                <span className="text-sm font-black">{formatCurrency(payslip.total_deductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Highlight Banner */}
          <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Net Take-Home Salary Transferred
              </span>
              <div className="text-xs text-emerald-700 mt-0.5">
                (Total Gross Earnings - Total Deductions)
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-900">{formatCurrency(payslip.net_pay)}</div>
            </div>
          </div>

          {/* Employer Contributions Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
              Employer&apos;s Contributions (Benefits)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex justify-between sm:block">
                <span className="text-slate-500">Employer PF (13%):</span>
                <span className="font-semibold text-slate-900 ml-1">{formatCurrency(payslip.employer_pf)}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-500">Employer ESI (3.25%):</span>
                <span className="font-semibold text-slate-900 ml-1">{formatCurrency(payslip.employer_esi)}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-500">Gratuity (4.81%):</span>
                <span className="font-semibold text-slate-900 ml-1">{formatCurrency(payslip.gratuity)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="border-t border-slate-300 pt-2 font-bold text-slate-700">
                Employer / Authorized Signatory
              </div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-2 font-bold text-slate-700">
                Employee Signature
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400">
            This is a computer generated payslip and does not require a physical seal if authorized digitally.
          </div>
        </div>
      </div>
    </div>
  );
};
