import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/authorization";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const autoPrint = url.searchParams.get("print") === "true";

    // 1. Fetch payslip from database with employee & organization relations
    let payslip = await prisma.payslips.findUnique({
      where: { id },
      include: {
        employees: {
          include: {
            departments: true,
            branches: true,
            organizations: true,
          },
        },
      },
    });

    // Fallback: search by employeeId or employeeCode if ID prefix format was passed
    if (!payslip) {
      payslip = await prisma.payslips.findFirst({
        where: {
          OR: [
            { employeeId: id },
            { employees: { employeeCode: id } },
          ],
        },
        include: {
          employees: {
            include: {
              departments: true,
              branches: true,
              organizations: true,
            },
          },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      });
    }

    if (!payslip) {
      return new NextResponse(
        `<html><body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Payslip Record Not Found</h2>
          <p>The requested payslip ID (${id}) does not exist in the database.</p>
        </body></html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const emp = payslip.employees;
    const orgName = emp.organizations?.name || "Smart Attendance Systems Ltd.";
    const branchName = emp.branches?.name || "Main Branch";
    const deptName = emp.departments?.name || "Operations";
    const monthName = new Date(payslip.year, payslip.month - 1).toLocaleString("en-US", { month: "long" });
    const billingPeriod = `${monthName} ${payslip.year}`;

    const basicSalary = Number(payslip.basicSalary || 0);
    const houseRent = Number(payslip.houseRent || 0);
    const medical = Number(payslip.medicalAllowance || 0);
    const transport = Number(payslip.transportAllowance || 0);
    const food = Number(payslip.foodAllowance || 0);
    const bonus = Number(payslip.bonus || 0);
    const overtime = Number(payslip.overtimePay || 0);

    const tax = Number(payslip.tax || 0);
    const pf = Number(payslip.providentFund || 0);
    const loan = Number(payslip.loanDeduction || 0);
    const late = Number(payslip.lateDeduction || 0);
    const absent = Number(payslip.absentDeduction || 0);

    const grossEarnings = basicSalary + houseRent + medical + transport + food + bonus + overtime;
    const totalDeductions = tax + pf + loan + late + absent;
    const netSalary = Number(payslip.netSalary || grossEarnings - totalDeductions);

    const issueDate = payslip.createdAt ? payslip.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payslip - ${emp.fullName} (${billingPeriod})</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      background-color: #f5f5f4;
      padding: 30px 15px;
      font-size: 13px;
      line-height: 1.5;
    }
    .payslip-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e7e5e4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #00B050;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .company-title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.5px;
    }
    .company-sub {
      color: #78716c;
      font-size: 12px;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      background-color: #ecfdf5;
      color: #00B050;
      font-weight: 700;
      font-size: 11px;
      border-radius: 20px;
      border: 1px solid #a7f3d0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-title {
      font-size: 16px;
      font-weight: 800;
      color: #00B050;
      text-align: right;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta {
      font-size: 12px;
      color: #78716c;
      text-align: right;
    }
    .employee-card {
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 25px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 30px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    .info-label {
      color: #78716c;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .info-val {
      font-weight: 700;
      color: #1c1917;
    }
    .financial-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      margin-bottom: 25px;
    }
    .finance-box {
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      overflow: hidden;
    }
    .finance-header {
      padding: 10px 16px;
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .earnings-header {
      background: #f0fdf4;
      color: #166534;
      border-bottom: 1px solid #bbf7d0;
    }
    .deductions-header {
      background: #fff1f2;
      color: #9f1239;
      border-bottom: 1px solid #fecdd3;
    }
    .finance-list {
      padding: 12px 16px;
    }
    .finance-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #f5f5f4;
      font-size: 12px;
    }
    .finance-item:last-child {
      border-bottom: none;
    }
    .finance-total {
      background: #fafaf9;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      font-weight: 800;
      border-top: 1px solid #e7e5e4;
      font-size: 13px;
    }
    .net-salary-banner {
      background: linear-gradient(135deg, #00B050 0%, #00873d 100%);
      color: #ffffff;
      padding: 20px 24px;
      border-radius: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      box-shadow: 0 4px 15px rgba(0, 176, 80, 0.25);
    }
    .net-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }
    .net-sub {
      font-size: 11px;
      opacity: 0.75;
      margin-top: 2px;
    }
    .net-amount {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e7e5e4;
    }
    .sign-line {
      border-top: 1px dashed #a8a29e;
      margin-top: 40px;
      padding-top: 8px;
      font-size: 11px;
      color: #78716c;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
    }
    .actions {
      margin-top: 25px;
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    .btn {
      padding: 10px 22px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-print {
      background: #00B050;
      color: white;
    }
    .btn-print:hover {
      background: #009b46;
    }
    .btn-close {
      background: #e7e5e4;
      color: #44403c;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .payslip-container {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
      }
      .actions {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <div class="header">
      <div>
        <div class="company-title">${orgName}</div>
        <div class="company-sub">${branchName} · Workplace Workforce & Payroll Management</div>
      </div>
      <div>
        <div class="doc-title">Official Salary Payslip</div>
        <div class="doc-meta">Period: <strong>${billingPeriod}</strong></div>
      </div>
    </div>

    <div class="employee-card">
      <div class="info-row">
        <span class="info-label">Employee Name</span>
        <span class="info-val">${emp.fullName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Employee ID</span>
        <span class="info-val">${emp.employeeCode}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Designation</span>
        <span class="info-val">${emp.designation || "Executive Staff"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Department</span>
        <span class="info-val">${deptName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Status</span>
        <span class="badge">${payslip.status}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Disbursement Date</span>
        <span class="info-val">${issueDate}</span>
      </div>
    </div>

    <div class="financial-grid">
      <!-- Earnings -->
      <div class="finance-box">
        <div class="finance-header earnings-header">Earnings & Allowances</div>
        <div class="finance-list">
          <div class="finance-item">
            <span>Basic Salary</span>
            <strong>৳${basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="finance-item">
            <span>House Rent Allowance (20%)</span>
            <strong>৳${houseRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="finance-item">
            <span>Medical Allowance (8%)</span>
            <strong>৳${medical.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="finance-item">
            <span>Conveyance Allowance (5%)</span>
            <strong>৳${transport.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="finance-item">
            <span>Food Allowance (4%)</span>
            <strong>৳${food.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          ${bonus > 0 ? `
          <div class="finance-item">
            <span>Performance Bonus</span>
            <strong>৳${bonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>` : ""}
          ${overtime > 0 ? `
          <div class="finance-item" style="color: #00B050;">
            <span>Approved Overtime Pay</span>
            <strong>৳${overtime.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>` : ""}
        </div>
        <div class="finance-total">
          <span>Gross Earnings</span>
          <span style="color: #00B050;">৳${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <!-- Deductions -->
      <div class="finance-box">
        <div class="finance-header deductions-header">Statutory Deductions</div>
        <div class="finance-list">
          <div class="finance-item">
            <span>Advance Income Tax (AIT)</span>
            <strong>৳${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="finance-item">
            <span>Provident Fund Contribution (EPF)</span>
            <strong>৳${pf.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          ${loan > 0 ? `
          <div class="finance-item">
            <span>Company Loan Recovery</span>
            <strong>৳${loan.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>` : ""}
          ${late > 0 ? `
          <div class="finance-item">
            <span>Late Arrival Penalty</span>
            <strong>৳${late.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>` : ""}
          ${absent > 0 ? `
          <div class="finance-item">
            <span>Unapproved Absence Deduction</span>
            <strong>৳${absent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>` : ""}
        </div>
        <div class="finance-total">
          <span>Total Deductions</span>
          <span style="color: #e11d48;">-৳${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>

    <div class="net-salary-banner">
      <div>
        <div class="net-title">Net Take-Home Pay</div>
        <div class="net-sub">Transferred via Bank EFT / Disbursement Account</div>
      </div>
      <div class="net-amount">
        ৳${netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>

    <div class="signatures">
      <div>
        <div class="sign-line">Employee Signature & Acknowledgement</div>
      </div>
      <div>
        <div class="sign-line">Authorized Signatory / Finance Department</div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-print" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
      <button class="btn btn-close" onclick="window.close()">
        ✕ Close Window
      </button>
    </div>
  </div>

  ${autoPrint ? `<script>window.onload = function() { window.print(); }</script>` : ""}
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="Payslip_${emp.employeeCode}_${payslip.month}_${payslip.year}.html"`,
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error generating payslip: ${error.message}`, { status: 500 });
  }
}
