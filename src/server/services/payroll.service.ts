import { calculateNetSalary } from "@/lib/calculations";
import { NotFoundError, ValidationError } from "../errors";
import { prisma } from "@/lib/prisma";
import { PayrollStatus } from "@prisma/client";

export interface PayslipItem {
  id: string;
  payrollBatchId: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  designation: string;
  department: string;
  branch: string;
  bankAccount: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  foodAllowance: number;
  bonus: number;
  overtimePay: number;
  taxDeduction: number;
  providentFund: number;
  loanDeduction: number;
  lateDeduction: number;
  absentDeduction: number;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  status: "DRAFT" | "APPROVED" | "LOCKED" | "PAID";
}

export interface PayrollBatchData {
  id: string;
  organizationId: string;
  month: string; // "YYYY-MM"
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPayable: number;
  totalStaffCount: number;
  status: "DRAFT" | "APPROVED" | "LOCKED" | "PAID";
  lockedAt?: string | null;
  lockedBy?: string | null;
  payslips: PayslipItem[];
  createdAt: string;
}

async function resolveOrganizationId(inputOrgId?: string | null): Promise<string> {
  if (inputOrgId && inputOrgId !== "org-1" && inputOrgId !== "default") {
    const directMatch = await prisma.organizations.findUnique({
      where: { id: inputOrgId },
      select: { id: true },
    }).catch(() => null);
    if (directMatch) return directMatch.id;
  }

  const firstOrg = await prisma.organizations.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  }).catch(() => null);

  if (firstOrg) return firstOrg.id;

  return inputOrgId || "org-1";
}

export class PayrollService {
  /**
   * Get all payroll batches grouped by month
   */
  static async getBatches(organizationId: string): Promise<PayrollBatchData[]> {
    const validOrgId = await resolveOrganizationId(organizationId);

    let allSlips = await prisma.payslips.findMany({
      where: {
        employees: { organizationId: validOrgId },
      },
      include: {
        employees: {
          include: {
            departments: true,
            branches: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    // If no payslips exist in DB, auto-generate for the current month
    if (allSlips.length === 0) {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      await this.generateBatch({ organizationId: validOrgId, month: currentMonthStr }).catch(() => {});

      allSlips = await prisma.payslips.findMany({
        where: {
          employees: { organizationId: validOrgId },
        },
        include: {
          employees: {
            include: {
              departments: true,
              branches: true,
            },
          },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      });
    }

    // Group payslips by month-year
    const batchMap = new Map<string, typeof allSlips>();

    for (const slip of allSlips) {
      const key = `${slip.year}-${String(slip.month).padStart(2, "0")}`;
      if (!batchMap.has(key)) {
        batchMap.set(key, []);
      }
      batchMap.get(key)!.push(slip);
    }

    const batches: PayrollBatchData[] = [];

    batchMap.forEach((slips, monthKey) => {
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      let allApproved = true;
      let allPaid = true;

      const items: PayslipItem[] = slips.map((p) => {
        const basic = Number(p.basicSalary);
        const houseRent = Number(p.houseRent);
        const medical = Number(p.medicalAllowance);
        const transport = Number(p.transportAllowance);
        const food = Number(p.foodAllowance);
        const bonus = Number(p.bonus);
        const ot = Number(p.overtimePay);
        const tax = Number(p.tax);
        const pf = Number(p.providentFund);
        const loan = Number(p.loanDeduction);
        const late = Number(p.lateDeduction);
        const absent = Number(p.absentDeduction);
        const net = Number(p.netSalary);

        const gross = basic + houseRent + medical + transport + food + bonus + ot;
        const deductions = tax + pf + loan + late + absent;

        totalGross += gross;
        totalDeductions += deductions;
        totalNet += net;

        if (p.status !== PayrollStatus.APPROVED && p.status !== PayrollStatus.PAID) {
          allApproved = false;
        }
        if (p.status !== PayrollStatus.PAID) {
          allPaid = false;
        }

        const bankStr = (p.employees as any).bankAccount
          ? `${(p.employees as any).bankName || "Bank"} - ${(p.employees as any).bankAccount}`
          : "DBBL - 114.120.982341";

        return {
          id: p.id,
          payrollBatchId: `batch-${monthKey}`,
          employeeId: p.employees.employeeCode,
          employeeName: p.employees.fullName,
          avatar: p.employees.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          designation: p.employees.designation || "Executive",
          department: p.employees.departments?.name || "General",
          branch: p.employees.branches?.name || "Main Branch",
          bankAccount: bankStr,
          basicSalary: basic,
          houseRent,
          medicalAllowance: medical,
          transportAllowance: transport,
          foodAllowance: food,
          bonus,
          overtimePay: ot,
          taxDeduction: tax,
          providentFund: pf,
          loanDeduction: loan,
          lateDeduction: late,
          absentDeduction: absent,
          grossEarnings: gross,
          totalDeductions: deductions,
          netSalary: net,
          status: p.status as PayslipItem["status"],
        };
      });

      let batchStatus: PayrollBatchData["status"] = "DRAFT";
      if (allPaid) batchStatus = "PAID";
      else if (allApproved) batchStatus = "APPROVED";

      batches.push({
        id: `batch-${monthKey}`,
        organizationId: validOrgId,
        month: monthKey,
        totalGrossPay: totalGross,
        totalDeductions,
        totalNetPayable: totalNet,
        totalStaffCount: items.length,
        status: batchStatus,
        payslips: items,
        createdAt: slips[0]?.createdAt.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      });
    });

    return batches;
  }

  /**
   * Get single batch by ID
   */
  static async getBatchById(id: string, organizationId: string): Promise<PayrollBatchData> {
    const batches = await this.getBatches(organizationId);
    const found = batches.find((b) => b.id === id || b.month === id.replace("batch-", ""));
    if (!found) throw new NotFoundError("Payroll Batch");
    return found;
  }

  /**
   * Generate or recalculate payroll batch for a month
   */
  static async generateBatch(data: { organizationId: string; month: string }): Promise<PayrollBatchData> {
    const validOrgId = await resolveOrganizationId(data.organizationId);

    const [yearStr, monthStr] = data.month.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const activeEmployees = await prisma.employees.findMany({
      where: {
        organizationId: validOrgId,
        status: "ACTIVE",
      },
      include: {
        departments: true,
        branches: true,
      },
    });

    if (activeEmployees.length === 0) {
      throw new ValidationError("No active employees found in organization to generate payroll");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    for (const emp of activeEmployees) {
      const basic = Number(emp.basicSalary || 50000);
      const houseRent = Math.round(basic * 0.2);
      const medical = Math.round(basic * 0.08);
      const transport = Math.round(basic * 0.05);
      const food = Math.round(basic * 0.04);
      const tax = Math.round(basic * 0.08);
      const pf = Math.round(basic * 0.05);

      // Check approved overtime for this employee during the target month
      const otRecords = await prisma.overtime.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startDate, lte: endDate },
          approved: true,
        },
      });

      let otAmount = 0;
      const hourlyRate = basic / 160;
      for (const ot of otRecords) {
        const hours = ot.minutes / 60;
        const multiplier = Number(ot.multiplier || 1.5);
        otAmount += hours * hourlyRate * multiplier;
      }
      otAmount = Math.round(otAmount);

      const netCalc = calculateNetSalary({
        basicSalary: basic,
        houseRent,
        medicalAllowance: medical,
        transportAllowance: transport,
        foodAllowance: food,
        taxDeduction: tax,
        providentFund: pf,
        overtimePay: otAmount,
      });

      await prisma.payslips.upsert({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year,
          },
        },
        create: {
          id: `slip-${emp.employeeCode}-${year}-${month}`,
          employeeId: emp.id,
          month,
          year,
          basicSalary: basic,
          houseRent,
          medicalAllowance: medical,
          transportAllowance: transport,
          foodAllowance: food,
          bonus: 0,
          overtimePay: otAmount,
          tax,
          providentFund: pf,
          loanDeduction: 0,
          lateDeduction: 0,
          absentDeduction: 0,
          netSalary: netCalc.netSalary,
          status: PayrollStatus.DRAFT,
          updatedAt: new Date(),
        },
        update: {
          basicSalary: basic,
          houseRent,
          medicalAllowance: medical,
          transportAllowance: transport,
          foodAllowance: food,
          overtimePay: otAmount,
          tax,
          providentFund: pf,
          netSalary: netCalc.netSalary,
          updatedAt: new Date(),
        },
      });
    }

    return this.getBatchById(`batch-${data.month}`, validOrgId);
  }

  /**
   * Approve all payslips in a batch
   */
  static async approveBatch(id: string, organizationId: string) {
    const validOrgId = await resolveOrganizationId(organizationId);
    const monthKey = id.replace("batch-", "");
    const [yearStr, monthStr] = monthKey.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    await prisma.payslips.updateMany({
      where: {
        month,
        year,
        employees: { organizationId: validOrgId },
      },
      data: {
        status: PayrollStatus.APPROVED,
        updatedAt: new Date(),
      },
    });

    return this.getBatchById(id, validOrgId);
  }

  /**
   * Finalize and lock all payslips in a batch
   */
  static async lockBatch(id: string, organizationId: string, lockedBy?: string) {
    const validOrgId = await resolveOrganizationId(organizationId);
    const monthKey = id.replace("batch-", "");
    const [yearStr, monthStr] = monthKey.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    await prisma.payslips.updateMany({
      where: {
        month,
        year,
        employees: { organizationId: validOrgId },
      },
      data: {
        status: PayrollStatus.PAID,
        updatedAt: new Date(),
      },
    });

    return this.getBatchById(id, validOrgId);
  }

  /**
   * Get employee payslips
   */
  static async getEmployeePayslips(organizationId: string, employeeId: string): Promise<PayslipItem[]> {
    const batches = await this.getBatches(organizationId);
    const slips: PayslipItem[] = [];
    batches.forEach((b) => {
      const found = b.payslips.find((p) => p.employeeId === employeeId);
      if (found) slips.push(found);
    });
    return slips;
  }
}
