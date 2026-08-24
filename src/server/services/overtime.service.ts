import { calculateOvertime, OT_MULTIPLIERS } from "@/lib/calculations";
import { NotFoundError, ValidationError } from "../errors";
import { EmployeeService } from "./employee.service";

export interface OvertimeEntry {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  type: "REGULAR" | "WEEKEND" | "HOLIDAY" | "EMERGENCY";
  claimedHours: number;
  hourlyRate: number;
  multiplier: number;
  calculatedAmount: number;
  reason: string;
  managerApproval: "PENDING_MANAGER" | "PENDING_ORG_ADMIN" | "APPROVED" | "REJECTED";
  managerComment?: string;
  orgApproval: "PENDING_MANAGER" | "PENDING_ORG_ADMIN" | "APPROVED" | "REJECTED";
  orgComment?: string;
  createdAt: string;
}

let overtimeClaimsStore: OvertimeEntry[] = [
  {
    id: "ot-101",
    organizationId: "org-1",
    employeeId: "EMP-1042",
    employeeName: "Arif Chowdhury",
    department: "Information Technology",
    date: "2026-08-18",
    type: "REGULAR",
    claimedHours: 3.5,
    hourlyRate: 593.75, // 95000 / 160
    multiplier: 1.5,
    calculatedAmount: 3117.19,
    reason: "Production database indexing and performance tuning after hours",
    managerApproval: "APPROVED",
    orgApproval: "PENDING_ORG_ADMIN",
    createdAt: "2026-08-18",
  },
  {
    id: "ot-102",
    organizationId: "org-1",
    employeeId: "EMP-1044",
    employeeName: "Mahmudul Hasan",
    department: "Information Technology",
    date: "2026-08-19",
    type: "WEEKEND",
    claimedHours: 5.0,
    hourlyRate: 375.0, // 60000 / 160
    multiplier: 2.0,
    calculatedAmount: 3750.0,
    reason: "Emergency payment gateway outage hotfix on Saturday",
    managerApproval: "PENDING_MANAGER",
    orgApproval: "PENDING_ORG_ADMIN",
    createdAt: "2026-08-19",
  },
];

export class OvertimeService {
  static async getOvertimeClaims(organizationId: string, query?: { employeeId?: string; status?: string }) {
    let list = overtimeClaimsStore.filter((ot) => ot.organizationId === organizationId);
    if (query?.employeeId) {
      list = list.filter((ot) => ot.employeeId === query.employeeId);
    }
    return list;
  }

  static async submitClaim(data: {
    organizationId: string;
    employeeId: string;
    date: string;
    type?: OvertimeEntry["type"];
    claimedHours: number;
    reason: string;
  }) {
    const employee = await EmployeeService.getEmployeeById(data.employeeId, data.organizationId);
    const otType = data.type || "REGULAR";

    // Canonical formula calculation
    const calc = calculateOvertime({
      basicSalary: employee.basicSalary,
      claimedHours: data.claimedHours,
      otType,
    });

    const newClaim: OvertimeEntry = {
      id: `ot-${Date.now()}`,
      organizationId: data.organizationId,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      date: data.date,
      type: otType,
      claimedHours: data.claimedHours,
      hourlyRate: calc.hourlyBaseRate,
      multiplier: calc.multiplier,
      calculatedAmount: calc.calculatedAmount,
      reason: data.reason,
      managerApproval: "PENDING_MANAGER",
      orgApproval: "PENDING_ORG_ADMIN",
      createdAt: new Date().toISOString().split("T")[0],
    };

    overtimeClaimsStore.unshift(newClaim);
    return newClaim;
  }

  static async approveByManager(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const claim = overtimeClaimsStore.find((ot) => ot.id === id && ot.organizationId === organizationId);
    if (!claim) throw new NotFoundError("Overtime Claim");

    if (claim.managerApproval !== "PENDING_MANAGER") {
      throw new ValidationError(`Claim is not in pending manager state (Current: ${claim.managerApproval})`);
    }

    claim.managerApproval = decision;
    claim.managerComment = comment;
    if (decision === "REJECTED") {
      claim.orgApproval = "REJECTED";
    }
    return claim;
  }

  static async approveByOrgAdmin(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const claim = overtimeClaimsStore.find((ot) => ot.id === id && ot.organizationId === organizationId);
    if (!claim) throw new NotFoundError("Overtime Claim");

    if (claim.managerApproval !== "APPROVED") {
      throw new ValidationError("Precondition Failed: Manager must approve the OT claim before Organization Admin can grant it.");
    }

    claim.orgApproval = decision;
    claim.orgComment = comment;
    return claim;
  }
}
