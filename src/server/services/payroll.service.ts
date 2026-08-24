import { calculateNetSalary } from "@/lib/calculations";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { EmployeeService } from "./employee.service";

export interface PayslipItem {
  id: string;
  payrollBatchId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  foodAllowance: number;
  bonus: number;
  overtimePay: number;
  taxDeduction: number;
  providentFund: number;
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

let payrollBatchesStore: PayrollBatchData[] = [
  {
    id: "batch-2026-07",
    organizationId: "org-1",
    month: "2026-07",
    totalGrossPay: 295000,
    totalDeductions: 28500,
    totalNetPayable: 266500,
    totalStaffCount: 3,
    status: "PAID",
    lockedAt: "2026-08-01",
    lockedBy: "Sarah Rahman",
    payslips: [
      {
        id: "slip-101",
        payrollBatchId: "batch-2026-07",
        employeeId: "EMP-1042",
        employeeName: "Arif Chowdhury",
        designation: "Senior Software Engineer",
        department: "Information Technology",
        basicSalary: 95000,
        houseRent: 20000,
        medicalAllowance: 8000,
        transportAllowance: 5000,
        foodAllowance: 4000,
        bonus: 0,
        overtimePay: 4500,
        taxDeduction: 7500,
        providentFund: 4750,
        lateDeduction: 0,
        absentDeduction: 0,
        grossEarnings: 136500,
        totalDeductions: 12250,
        netSalary: 124250,
        status: "PAID",
      },
    ],
    createdAt: "2026-07-31",
  },
];

export class PayrollService {
  static async getBatches(organizationId: string) {
    return payrollBatchesStore.filter((b) => b.organizationId === organizationId);
  }

  static async getBatchById(id: string, organizationId: string) {
    const batch = payrollBatchesStore.find((b) => b.id === id && b.organizationId === organizationId);
    if (!batch) throw new NotFoundError("Payroll Batch");
    return batch;
  }

  static async generateBatch(data: { organizationId: string; month: string }) {
    const existing = payrollBatchesStore.find((b) => b.organizationId === data.organizationId && b.month === data.month);
    if (existing) {
      throw new ConflictError(`Payroll batch for month '${data.month}' already exists (Status: ${existing.status})`);
    }

    const { items: employees } = await EmployeeService.getEmployees(data.organizationId, { limit: 500 });
    const batchId = `batch-${data.month}-${Date.now()}`;

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const payslips: PayslipItem[] = employees.map((emp) => {
      const basic = emp.basicSalary || 50000;
      const houseRent = Math.round(basic * 0.2);
      const medicalAllowance = Math.round(basic * 0.08);
      const transportAllowance = Math.round(basic * 0.05);
      const foodAllowance = Math.round(basic * 0.04);
      const taxDeduction = Math.round(basic * 0.08);
      const providentFund = Math.round(basic * 0.05);

      const netCalc = calculateNetSalary({
        basicSalary: basic,
        houseRent,
        medicalAllowance,
        transportAllowance,
        foodAllowance,
        taxDeduction,
        providentFund,
      });

      totalGross += netCalc.grossEarnings;
      totalDeductions += netCalc.totalDeductions;
      totalNet += netCalc.netSalary;

      return {
        id: `slip-${emp.employeeId}-${Date.now()}`,
        payrollBatchId: batchId,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        designation: emp.designation,
        department: emp.department,
        basicSalary: basic,
        houseRent,
        medicalAllowance,
        transportAllowance,
        foodAllowance,
        bonus: 0,
        overtimePay: 0,
        taxDeduction,
        providentFund,
        lateDeduction: 0,
        absentDeduction: 0,
        grossEarnings: netCalc.grossEarnings,
        totalDeductions: netCalc.totalDeductions,
        netSalary: netCalc.netSalary,
        status: "DRAFT",
      };
    });

    const newBatch: PayrollBatchData = {
      id: batchId,
      organizationId: data.organizationId,
      month: data.month,
      totalGrossPay: totalGross,
      totalDeductions: totalDeductions,
      totalNetPayable: totalNet,
      totalStaffCount: payslips.length,
      status: "DRAFT",
      payslips,
      createdAt: new Date().toISOString().split("T")[0],
    };

    payrollBatchesStore.unshift(newBatch);
    return newBatch;
  }

  static async lockBatch(id: string, organizationId: string, lockedBy: string) {
    const batch = await this.getBatchById(id, organizationId);
    if (batch.status === "LOCKED" || batch.status === "PAID") {
      throw new ValidationError(`Batch is already ${batch.status}. It is completely immutable.`);
    }

    batch.status = "LOCKED";
    batch.lockedAt = new Date().toISOString();
    batch.lockedBy = lockedBy;
    batch.payslips.forEach((p) => (p.status = "LOCKED"));

    return batch;
  }

  static async getEmployeePayslips(organizationId: string, employeeId: string) {
    const slips: PayslipItem[] = [];
    payrollBatchesStore
      .filter((b) => b.organizationId === organizationId)
      .forEach((b) => {
        const found = b.payslips.find((p) => p.employeeId === employeeId);
        if (found) slips.push(found);
      });
    return slips;
  }
}
