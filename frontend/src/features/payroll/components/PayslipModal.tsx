"use client";

import React, { useEffect } from "react";
import { X, Printer, Download } from "lucide-react";
import { Payslip } from "../types/payroll.types";
import { downloadPayslipPdf } from "../utils/payslipPdf";

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!payslip) return null;

  const handlePrint = () => {
    downloadPayslipPdf(payslip);
  };

  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null || val === "") return "₹0.00";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const monthLabel = MONTH_NAMES[payslip.month] || `Month ${payslip.month}`;
  const empName = `${payslip.first_name || ""} ${payslip.last_name || ""}`.trim() || `Employee #${payslip.user_id}`;
  const logoSrc = payslip.company_logo || "/images/company_logo.png";
  const companyName = payslip.company_name || "SAANVI TECHNOLOGIES";
  const companyAddress = "NO 3/68/2, First Floor,Main road ,NH-66,Saligram,Udupi, Karnataka, 576225";
  const employeeCode = payslip.employee_code || `EMP-${payslip.user_id}`;
  const designation = payslip.designation_name || "—";
  const department = payslip.department_name || "—";
  const joiningDate = payslip.joining_date
    ? new Date(payslip.joining_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
  const uan = payslip.uan_number || payslip.pf_number || "—";
  const bankName = payslip.bank_name || "—";
  const accountNo = payslip.account_number || "—";

  const totalWorkingDays = payslip.working_days || 30;
  const paidDays = payslip.paid_days !== undefined ? payslip.paid_days : totalWorkingDays;
  const lopDays = payslip.loss_of_pay_days || 0;
  const leaveDays = Math.max(0, totalWorkingDays - paidDays - lopDays);

  const basicEarned = payslip.basic_earned || 0;
  const hraEarned = payslip.hra_earned || 0;
  const otherEarned = payslip.other_allowances_earned || 0;
  const grossEarned = payslip.gross_earned || (Number(basicEarned) + Number(hraEarned) + Number(otherEarned));

  const pfDeduction = payslip.employee_pf || 0;
  const ptDeduction = payslip.professional_tax || 0;
  const esiDeduction = payslip.employee_esi || 0;
  const hasEsi = Number(esiDeduction) > 0;
  const totalDeductions = payslip.total_deductions || (Number(pfDeduction) + Number(ptDeduction) + Number(esiDeduction));
  const netPay = payslip.net_pay || (Number(grossEarned) - Number(totalDeductions));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Floating Quick Close Button on Viewport */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-6 z-60 px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl border border-white/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black"
        title="Close (Esc)"
      >
        <X className="w-4 h-4 stroke-[3]" />
        <span>Close View</span>
      </button>

      <div className="bg-white rounded-2xl max-w-4xl w-full h-[92vh] max-h-[92vh] flex flex-col border border-slate-300 shadow-2xl overflow-hidden relative">
        {/* Fixed Header Actions bar */}
        <div className="shrink-0 px-5 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 z-20 shadow-xs">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Payslip View — {monthLabel} {payslip.year} ({empName})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadPayslipPdf(payslip)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Download Payslip as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-800 text-xs font-black inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Close Payslip (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Payslip Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center">
          {/* Quick bar above sheet */}
          <div className="max-w-[840px] w-full mb-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Preview of Official Payslip Document
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close View</span>
            </button>
          </div>

          <div className="bg-white max-w-[840px] w-full border-[3px] border-black shadow-sm">
            {/* 1. Header (Logo + Company Details) */}
            <table className="w-full border-collapse border-b-2 border-black">
              <tbody>
                <tr>
                  <td className="w-[190px] p-3 text-center align-middle">
                    <div className="flex items-center justify-center min-h-[56px]">
                      <img
                        src={logoSrc}
                        alt={companyName}
                        className="max-h-[56px] max-w-[170px] w-auto h-auto object-contain block mx-auto"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                          const fb = document.getElementById("modal-alt-swirl");
                          if (fb) fb.style.display = "block";
                        }}
                      />
                    </div>
                    <div id="modal-alt-swirl" className="hidden font-black text-base text-orange-600 text-center">
                      {companyName}
                    </div>
                  </td>
                  <td className="p-3.5 pl-5 text-left align-middle">
                    <div className="text-lg font-black uppercase tracking-wide text-black leading-tight">
                      {companyName}
                    </div>
                    <div className="text-xs font-medium mt-1 text-black leading-snug">
                      {companyAddress}
                    </div>
                    <div className="text-sm mt-2 text-black">
                      Pay Slip for <strong className="font-extrabold">{monthLabel} {payslip.year}</strong>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 2. Employee Details Block (2 Columns with center line, NO internal horizontal borders) */}
            <table className="w-full border-collapse border-b-2 border-black text-xs sm:text-[13px]">
              <tbody>
                <tr>
                  <td className="w-1/2 align-top p-2.5 px-4">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="py-1 w-[44%] font-medium text-black">Employee ID</td>
                          <td className="py-1 font-bold text-black">{employeeCode}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-black">Employee Name</td>
                          <td className="py-1 font-bold text-black">{empName}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-black">Designation</td>
                          <td className="py-1 font-bold text-black">{designation}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-black">Department</td>
                          <td className="py-1 font-bold text-black">{department}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-black">Date of Joining</td>
                          <td className="py-1 font-bold text-black">{joiningDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="w-1/2 align-top p-2.5 px-4">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="py-1 w-[44%] font-medium text-black">UAN</td>
                          <td className="py-1 font-bold text-black">{uan}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-black">Bank</td>
                          <td className="py-1 font-bold text-black">{bankName}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-black">Account No.</td>
                          <td className="py-1 font-bold text-black">{accountNo}</td>
                        </tr>
                        <tr>
                          <td className="py-1">&nbsp;</td>
                          <td className="py-1">&nbsp;</td>
                        </tr>
                        <tr>
                          <td className="py-1">&nbsp;</td>
                          <td className="py-1">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 3. Blank Spacer Row */}
            <div className="h-3.5 border-b-2 border-black bg-white"></div>

            {/* 4. Main Data Grid: Attendance, Earnings & Deductions */}
            <table className="w-full border-collapse text-xs sm:text-[13px] leading-relaxed">
              <tbody>
                {/* Attendance Rows */}
                <tr>
                  <td className="w-1/4 border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">Gross Salary</td>
                  <td className="w-1/4 border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{formatCurrency(grossEarned)}</td>
                  <td className="w-1/4 border-[1.5px] border-black px-3 py-1.5">&nbsp;</td>
                  <td className="w-1/4 border-[1.5px] border-black px-3 py-1.5">&nbsp;</td>
                </tr>
                <tr>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">Total Working Days</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{totalWorkingDays}</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">Leaves</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{leaveDays}</td>
                </tr>
                <tr>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">LOP Days</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{lopDays}</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">Paid Days</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{paidDays}</td>
                </tr>

                {/* Section Headers */}
                <tr>
                  <th colSpan={2} className="border-y-2 border-x-[1.5px] border-black px-3 py-1.5 text-center font-extrabold text-sm text-black">
                    Earnings
                  </th>
                  <th colSpan={2} className="border-y-2 border-x-[1.5px] border-black px-3 py-1.5 text-center font-extrabold text-sm text-black">
                    Deductions
                  </th>
                </tr>

                {/* Breakdown Rows */}
                <tr>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">Basic</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{formatCurrency(basicEarned)}</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">PF</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{formatCurrency(pfDeduction)}</td>
                </tr>
                <tr>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">HRA</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{formatCurrency(hraEarned)}</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">PT</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{formatCurrency(ptDeduction)}</td>
                </tr>
                <tr>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">Other Allowances</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{formatCurrency(otherEarned)}</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-semibold text-black">{hasEsi ? "ESI" : "\u00A0"}</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-bold text-right text-black">{hasEsi ? formatCurrency(esiDeduction) : "\u00A0"}</td>
                </tr>

                {/* Blank Spacer Row between components and Totals */}
                <tr>
                  <td className="border-[1.5px] border-black px-3 py-1.5">&nbsp;</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5">&nbsp;</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5">&nbsp;</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5">&nbsp;</td>
                </tr>

                {/* Totals */}
                <tr>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-extrabold text-black">Total Earnings</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-extrabold text-right text-black">{formatCurrency(grossEarned)}</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-extrabold text-black">Total Deductions</td>
                  <td className="border-[1.5px] border-black px-3 py-1.5 font-extrabold text-right text-black">{formatCurrency(totalDeductions)}</td>
                </tr>

                {/* Net Salary */}
                <tr>
                  <td colSpan={2} className="border-t-[1.5px] border-black px-3 py-2">&nbsp;</td>
                  <td className="border-t-2 border-[1.5px] border-black px-3 py-2 font-extrabold text-sm text-black">Net Salary</td>
                  <td className="border-t-2 border-[1.5px] border-black px-3 py-2 font-extrabold text-sm text-right text-black">
                    {formatCurrency(netPay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Footer Actions Bar */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between z-20">
          <span className="text-xs text-slate-500 font-medium">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[11px]">Esc</kbd> or click Close to exit
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Close</span>
            </button>
            <button
              onClick={() => downloadPayslipPdf(payslip)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
