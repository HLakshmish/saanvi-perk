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
    if (val === undefined || val === null) return "₹0.00";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for this site to download the Payslip PDF.");
    return;
  }

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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11.5px;
      line-height: 1.45;
      padding: 12px;
    }
    .payslip-wrapper {
      max-width: 800px;
      margin: 0 auto;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .company-name {
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .company-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
      font-weight: 500;
    }
    .payslip-badge {
      text-align: right;
    }
    .badge-title {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .badge-status {
      font-size: 11px;
      color: #64748b;
      margin-top: 5px;
    }
    .status-paid {
      color: #059669;
      font-weight: 700;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 18px;
    }
    .info-item {
      font-size: 11px;
    }
    .info-label {
      color: #64748b;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 600;
    }
    .info-val {
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .tables-row {
      display: flex;
      gap: 14px;
      margin-bottom: 18px;
    }
    .col {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }
    .col-header {
      background: #f1f5f9;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #cbd5e1;
    }
    .col-body {
      padding: 10px 12px;
    }
    .table-row {
      display: flex;
      justify-content: space-between;
      padding: 5.5px 0;
      font-size: 11px;
      border-bottom: 1px dashed #e2e8f0;
    }
    .table-row:last-child {
      border-bottom: none;
    }
    .col-footer {
      background: #f8fafc;
      padding: 9px 12px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #cbd5e1;
    }
    .net-salary-card {
      background: #ecfdf5;
      border: 2px solid #a7f3d0;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .net-label {
      font-size: 12px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .net-sub {
      font-size: 10px;
      color: #047857;
      margin-top: 2px;
    }
    .net-amount {
      font-size: 22px;
      font-weight: 900;
      color: #064e3b;
    }
    .benefits-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 22px;
    }
    .benefits-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .benefits-grid {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #334155;
    }
    .footer-signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .sig-box {
      text-align: center;
      width: 170px;
    }
    .sig-line {
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 6px;
    }
    .sig-title {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .disclaimer {
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      margin-top: 20px;
    }
    @media print {
      body { padding: 0; background: none; }
      .payslip-wrapper { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="payslip-wrapper">
    <div class="header">
      <div>
        <div class="company-name">${payslip.company_name || "Company Payslip"}</div>
        <div class="company-sub">${payslip.company_code ? `Company Code: ${payslip.company_code} • ` : ""}Official Monthly Payslip</div>
      </div>
      <div class="payslip-badge">
        <div class="badge-title">Payslip — ${monthLabel} ${payslip.year}</div>
        <div class="badge-status">Status: <span class="status-paid">${payslip.payment_status}</span></div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Employee Name</div>
        <div class="info-val">${empName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Employee ID</div>
        <div class="info-val">${payslip.employee_code || `ID-${payslip.user_id}`}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Designation</div>
        <div class="info-val">${payslip.designation_name || "Employee"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Department</div>
        <div class="info-val">${payslip.department_name || "General"}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Joining Date</div>
        <div class="info-val">${payslip.joining_date ? new Date(payslip.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Bank Name</div>
        <div class="info-val">${payslip.bank_name || "—"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Bank A/C No.</div>
        <div class="info-val">${payslip.account_number || "—"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">UAN / PF No.</div>
        <div class="info-val">${payslip.uan_number || payslip.pf_number || "—"}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Total Days</div>
        <div class="info-val">${payslip.working_days || 30} Days</div>
      </div>
      <div class="info-item">
        <div class="info-label">Paid Days</div>
        <div class="info-val" style="color: #059669;">${payslip.paid_days || 30} Days</div>
      </div>
      <div class="info-item">
        <div class="info-label">LOP Days</div>
        <div class="info-val" style="color: #dc2626;">${payslip.loss_of_pay_days || 0} Days</div>
      </div>
      <div class="info-item">
        <div class="info-label">PAN Number</div>
        <div class="info-val">${payslip.pan_number || "—"}</div>
      </div>
    </div>

    <div class="tables-row">
      <div class="col">
        <div class="col-header">
          <span>Earnings Component</span>
          <span>Amount (INR)</span>
        </div>
        <div class="col-body">
          <div class="table-row">
            <span>Basic Pay (${payslip.basic_percentage || 50}%)</span>
            <span>${formatCurrency(payslip.basic_earned)}</span>
          </div>
          <div class="table-row">
            <span>House Rent Allowance (HRA)</span>
            <span>${formatCurrency(payslip.hra_earned)}</span>
          </div>
          <div class="table-row">
            <span>Other Allowances</span>
            <span>${formatCurrency(payslip.other_allowances_earned)}</span>
          </div>
        </div>
        <div class="col-footer">
          <span>Total Gross Earnings</span>
          <span style="color: #1e3a8a;">${formatCurrency(payslip.gross_earned)}</span>
        </div>
      </div>

      <div class="col">
        <div class="col-header">
          <span>Deductions Component</span>
          <span>Amount (INR)</span>
        </div>
        <div class="col-body">
          <div class="table-row">
            <span>Employee PF (${payslip.employee_pf_rate || 12}%)</span>
            <span style="color: #dc2626;">${formatCurrency(payslip.employee_pf)}</span>
          </div>
          <div class="table-row">
            <span>Employee ESI (${payslip.employee_esi_rate || 0.75}%)</span>
            <span style="color: #dc2626;">${formatCurrency(payslip.employee_esi)}</span>
          </div>
          <div class="table-row">
            <span>Professional Tax</span>
            <span style="color: #dc2626;">${formatCurrency(payslip.professional_tax)}</span>
          </div>
        </div>
        <div class="col-footer">
          <span>Total Deductions</span>
          <span style="color: #991b1b;">${formatCurrency(payslip.total_deductions)}</span>
        </div>
      </div>
    </div>

    <div class="net-salary-card">
      <div>
        <div class="net-label">Net Take-Home Salary</div>
        <div class="net-sub">(Total Gross Earnings - Total Deductions)</div>
      </div>
      <div class="net-amount">${formatCurrency(payslip.net_pay)}</div>
    </div>

    <div class="benefits-box">
      <div class="benefits-title">Employer Contributions (Benefits)</div>
      <div class="benefits-grid">
        <div>Employer PF (${payslip.employer_pf_rate || 13}%): <strong>${formatCurrency(payslip.employer_pf)}</strong></div>
        <div>Employer ESI (${payslip.employer_esi_rate || 3.25}%): <strong>${formatCurrency(payslip.employer_esi)}</strong></div>
        <div>Gratuity (${payslip.gratuity_rate || 4.81}%): <strong>${formatCurrency(payslip.gratuity)}</strong></div>
        <div>CTC Earned: <strong>${formatCurrency(payslip.ctc_earned)}</strong></div>
      </div>
    </div>

    <div class="footer-signatures">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-title">Employee Signature</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-title">Authorized Signatory</div>
      </div>
    </div>

    <div class="disclaimer">
      This is a computer-generated document and does not require a physical signature if verified digitally.
    </div>
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
