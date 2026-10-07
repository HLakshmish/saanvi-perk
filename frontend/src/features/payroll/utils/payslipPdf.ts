import { Payslip } from "../types/payroll.types";

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

export function downloadPayslipPdf(payslip: Payslip) {
  if (!payslip) return;

  const monthLabel = MONTH_NAMES[payslip.month] || `Month ${payslip.month}`;
  const empName =
    `${payslip.first_name || ""} ${payslip.last_name || ""}`.trim() ||
    `Employee_${payslip.user_id}`;
  const fileName = `Payslip_${empName.replace(/\s+/g, "_")}_${monthLabel}_${payslip.year}`;

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

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for this site to download the Payslip PDF.");
    return;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoSrc = payslip.company_logo || (origin ? `${origin}/images/company_logo.png` : "/images/company_logo.png");
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

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${fileName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #000000;
      background: #ffffff;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print-bar {
      max-width: 840px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
    }
    .no-print-bar button {
      padding: 7px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }
    .btn-print {
      background: #0284c7;
      color: #ffffff;
    }
    .btn-close {
      background: #e2e8f0;
      color: #334155;
    }
    .payslip-wrapper {
      max-width: 840px;
      margin: 0 auto;
      border: 3px solid #000000;
      background: #ffffff;
    }
    .main-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      line-height: 1.4;
      color: #000000;
    }
    .main-table td,
    .main-table th {
      color: #000000;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
    }
    .header-logo-box {
      width: 190px;
      padding: 10px 14px;
      text-align: center;
      vertical-align: middle;
    }
    .header-info-box {
      padding: 12px 20px;
      text-align: left;
      vertical-align: middle;
    }
    .company-title {
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
      line-height: 1.2;
    }
    .company-addr {
      font-size: 11.5px;
      font-weight: 500;
      color: #000000;
      margin-top: 5px;
      line-height: 1.35;
    }
    .payslip-period {
      font-size: 13.5px;
      color: #000000;
      margin-top: 8px;
    }
    .thick-border-b {
      border-bottom: 2px solid #000000;
    }
    .grid-cell {
      border: 1.5px solid #000000;
      padding: 5px 12px;
      font-size: 12.5px;
    }
    .cell-label {
      font-weight: 600;
    }
    .cell-value {
      font-weight: 700;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .font-bold {
      font-weight: 700;
    }
    .font-extrabold {
      font-weight: 800;
    }
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      .no-print-bar {
        display: none !important;
      }
      .payslip-wrapper {
        max-width: 100% !important;
        width: 100% !important;
        border: 3px solid #000000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span style="font-size: 12px; font-weight: 600; color: #475569;">
      Payslip Print Preview — ${empName} (${monthLabel} ${payslip.year})
    </span>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      <button class="btn-close" onclick="window.close()">Close Window</button>
    </div>
  </div>

  <div class="payslip-wrapper">
    <!-- 1. Header (Logo + Company Details) -->
    <table class="header-table thick-border-b">
      <tr>
        <td class="header-logo-box">
          <div style="display: flex; align-items: center; justify-content: center; min-height: 56px;">
            <img src="${logoSrc}" alt="${companyName}" style="max-height: 56px; max-width: 170px; width: auto; height: auto; object-fit: contain; display: block; margin: 0 auto;" onerror="this.style.display='none'; document.getElementById('alt-swirl').style.display='block';" />
          </div>
          <div id="alt-swirl" style="display: none; font-size: 16px; font-weight: 800; color: #ea580c; text-align: center;">${companyName}</div>
        </td>
        <td class="header-info-box">
          <div class="company-title">${companyName}</div>
          <div class="company-addr">${companyAddress}</div>
          <div class="payslip-period">Pay Slip for <strong style="font-weight: 800;">${monthLabel} ${payslip.year}</strong></div>
        </td>
      </tr>
    </table>

    <!-- 2. Employee Details Block (2 Columns with center line, NO internal horizontal borders) -->
    <table class="header-table thick-border-b">
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 7px 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 2.5px 0; width: 44%; font-weight: 500; font-size: 12.5px;">Employee ID</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${employeeCode}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-weight: 500; font-size: 12.5px;">Employee Name</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${empName}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-weight: 500; font-size: 12.5px;">Designation</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${designation}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-weight: 500; font-size: 12.5px;">Department</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${department}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-weight: 500; font-size: 12.5px;">Date of Joining</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${joiningDate}</td>
            </tr>
          </table>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 7px 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 2.5px 0; width: 44%; font-weight: 500; font-size: 12.5px;">UAN</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${uan}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-weight: 500; font-size: 12.5px;">Bank</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${bankName}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-weight: 500; font-size: 12.5px;">Account No.</td>
              <td style="padding: 2.5px 0; font-weight: 700; font-size: 12.5px;">${accountNo}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-size: 12.5px;">&nbsp;</td>
              <td style="padding: 2.5px 0; font-size: 12.5px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; font-size: 12.5px;">&nbsp;</td>
              <td style="padding: 2.5px 0; font-size: 12.5px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 3. Blank Spacer Row -->
    <div style="height: 12px; border-bottom: 2px solid #000000; background: #ffffff;"></div>

    <!-- 4. Main Data Grid: Attendance, Earnings & Deductions -->
    <table class="main-table">
      <!-- Attendance Rows -->
      <tr>
        <td class="grid-cell cell-label" style="width: 25%;">Gross Salary</td>
        <td class="grid-cell cell-value text-right" style="width: 25%;">${formatCurrency(grossEarned)}</td>
        <td class="grid-cell" style="width: 25%;">&nbsp;</td>
        <td class="grid-cell" style="width: 25%;">&nbsp;</td>
      </tr>
      <tr>
        <td class="grid-cell cell-label">Total Working Days</td>
        <td class="grid-cell cell-value text-right">${totalWorkingDays}</td>
        <td class="grid-cell cell-label">Leaves</td>
        <td class="grid-cell cell-value text-right">${leaveDays}</td>
      </tr>
      <tr>
        <td class="grid-cell cell-label">LOP Days</td>
        <td class="grid-cell cell-value text-right">${lopDays}</td>
        <td class="grid-cell cell-label">Paid Days</td>
        <td class="grid-cell cell-value text-right">${paidDays}</td>
      </tr>

      <!-- Section Headers -->
      <tr>
        <th colspan="2" class="grid-cell text-center font-extrabold" style="font-size: 13.5px; padding: 7px 10px; border-top: 2px solid #000000; border-bottom: 2px solid #000000;">
          Earnings
        </th>
        <th colspan="2" class="grid-cell text-center font-extrabold" style="font-size: 13.5px; padding: 7px 10px; border-top: 2px solid #000000; border-bottom: 2px solid #000000;">
          Deductions
        </th>
      </tr>

      <!-- Component Rows -->
      <tr>
        <td class="grid-cell cell-label">Basic</td>
        <td class="grid-cell cell-value text-right">${formatCurrency(basicEarned)}</td>
        <td class="grid-cell cell-label">PF</td>
        <td class="grid-cell cell-value text-right">${formatCurrency(pfDeduction)}</td>
      </tr>
      <tr>
        <td class="grid-cell cell-label">HRA</td>
        <td class="grid-cell cell-value text-right">${formatCurrency(hraEarned)}</td>
        <td class="grid-cell cell-label">PT</td>
        <td class="grid-cell cell-value text-right">${formatCurrency(ptDeduction)}</td>
      </tr>
      <tr>
        <td class="grid-cell cell-label">Other Allowances</td>
        <td class="grid-cell cell-value text-right">${formatCurrency(otherEarned)}</td>
        <td class="grid-cell cell-label">${hasEsi ? "ESI" : "&nbsp;"}</td>
        <td class="grid-cell cell-value text-right">${hasEsi ? formatCurrency(esiDeduction) : "&nbsp;"}</td>
      </tr>

      <!-- Blank Spacer Row between components and Totals -->
      <tr>
        <td class="grid-cell">&nbsp;</td>
        <td class="grid-cell">&nbsp;</td>
        <td class="grid-cell">&nbsp;</td>
        <td class="grid-cell">&nbsp;</td>
      </tr>

      <!-- Totals Row -->
      <tr>
        <td class="grid-cell font-extrabold">Total Earnings</td>
        <td class="grid-cell font-extrabold text-right">${formatCurrency(grossEarned)}</td>
        <td class="grid-cell font-extrabold">Total Deductions</td>
        <td class="grid-cell font-extrabold text-right">${formatCurrency(totalDeductions)}</td>
      </tr>

      <!-- Net Salary Row -->
      <tr>
        <td colspan="2" style="border: none; border-top: 1.5px solid #000000;">&nbsp;</td>
        <td class="grid-cell font-extrabold" style="font-size: 13.5px; border-top: 2px solid #000000;">Net Salary</td>
        <td class="grid-cell font-extrabold text-right" style="font-size: 13.5px; border-top: 2px solid #000000;">${formatCurrency(netPay)}</td>
      </tr>
    </table>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
