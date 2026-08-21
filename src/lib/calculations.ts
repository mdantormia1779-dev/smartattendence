/**
 * Core Shared Calculation Engine
 * 
 * Standardizes Overtime and Net Salary calculations across all 4 portals
 * (Super Admin, Organization Admin, Manager, Employee, and Reports).
 */

export interface OvertimeCalculationInput {
  basicSalary: number;
  claimedHours: number;
  otType: "REGULAR" | "WEEKEND" | "HOLIDAY" | "EMERGENCY" | "Regular OT" | "Weekend OT" | "Holiday OT" | "Emergency OT";
  monthlyStandardHours?: number; // default: 160
  customMultiplier?: number;
}

export interface OvertimeCalculationResult {
  hourlyBaseRate: number;
  multiplier: number;
  claimedHours: number;
  calculatedAmount: number;
}

export interface NetSalaryCalculationInput {
  basicSalary: number;
  houseRent?: number;
  medicalAllowance?: number;
  transportAllowance?: number;
  foodAllowance?: number;
  bonus?: number;
  overtimePay?: number;
  taxDeduction?: number;
  providentFund?: number;
  loanDeduction?: number;
  lateDeduction?: number;
  absentDeduction?: number;
}

export interface NetSalaryCalculationResult {
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
}

/**
 * Multiplier dictionary for Overtime types
 */
export const OT_MULTIPLIERS: Record<string, number> = {
  REGULAR: 1.5,
  "Regular OT": 1.5,
  WEEKEND: 2.0,
  "Weekend OT": 2.0,
  HOLIDAY: 2.5,
  "Holiday OT": 2.5,
  EMERGENCY: 3.0,
  "Emergency OT": 3.0,
};

/**
 * Computes Overtime Rate and total payout:
 * OT Rate = (Monthly Basic Salary ÷ 160 Hours) × Multiplier
 */
export function calculateOvertime(input: OvertimeCalculationInput): OvertimeCalculationResult {
  const standardHours = input.monthlyStandardHours && input.monthlyStandardHours > 0 ? input.monthlyStandardHours : 160;
  const hourlyBaseRate = Number((input.basicSalary / standardHours).toFixed(4));
  const multiplier = input.customMultiplier || OT_MULTIPLIERS[input.otType] || 1.5;
  const calculatedAmount = Number((hourlyBaseRate * multiplier * Math.max(0, input.claimedHours)).toFixed(2));

  return {
    hourlyBaseRate,
    multiplier,
    claimedHours: input.claimedHours,
    calculatedAmount,
  };
}

/**
 * Computes Net Salary:
 * Net Salary = (Basic + House + Med + Trans + Food + Bonus + OT) - (Tax + PF + Loan + Late + Absent Deductions)
 */
export function calculateNetSalary(input: NetSalaryCalculationInput): NetSalaryCalculationResult {
  const basic = Math.max(0, input.basicSalary || 0);
  const house = Math.max(0, input.houseRent || 0);
  const medical = Math.max(0, input.medicalAllowance || 0);
  const transport = Math.max(0, input.transportAllowance || 0);
  const food = Math.max(0, input.foodAllowance || 0);
  const bonus = Math.max(0, input.bonus || 0);
  const overtime = Math.max(0, input.overtimePay || 0);

  const grossEarnings = Number((basic + house + medical + transport + food + bonus + overtime).toFixed(2));

  const tax = Math.max(0, input.taxDeduction || 0);
  const pf = Math.max(0, input.providentFund || 0);
  const loan = Math.max(0, input.loanDeduction || 0);
  const late = Math.max(0, input.lateDeduction || 0);
  const absent = Math.max(0, input.absentDeduction || 0);

  const totalDeductions = Number((tax + pf + loan + late + absent).toFixed(2));
  const netSalary = Number(Math.max(0, grossEarnings - totalDeductions).toFixed(2));

  return {
    grossEarnings,
    totalDeductions,
    netSalary,
  };
}
