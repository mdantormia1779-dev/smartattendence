import { calculateNetLeaveDays } from "@/lib/datetime";
import { NotFoundError, ValidationError } from "../errors";
import { EmployeeService } from "./employee.service";

export interface LeaveRequestData {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: "CASUAL" | "SICK" | "ANNUAL" | "MATERNITY" | "UNPAID";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentS3Key?: string;
  managerApproval: "PENDING_MANAGER" | "PENDING_ORG_ADMIN" | "APPROVED" | "REJECTED";
  managerComment?: string;
  orgApproval: "PENDING_MANAGER" | "PENDING_ORG_ADMIN" | "APPROVED" | "REJECTED";
  orgComment?: string;
  createdAt: string;
}

export interface LeaveQuota {
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  annual: { total: number; used: number; remaining: number };
  maternity: { total: number; used: number; remaining: number };
}

let leaveRequestsStore: LeaveRequestData[] = [
  {
    id: "leave-101",
    organizationId: "org-1",
    employeeId: "EMP-1042",
    employeeName: "Arif Chowdhury",
    department: "Information Technology",
    type: "ANNUAL",
    startDate: "2026-08-25",
    endDate: "2026-08-28",
    totalDays: 4,
    reason: "Family vacation & personal travel",
    managerApproval: "APPROVED",
    orgApproval: "APPROVED",
    createdAt: "2026-08-15",
  },
  {
    id: "leave-102",
    organizationId: "org-1",
    employeeId: "EMP-1043",
    employeeName: "Nusrat Jahan",
    department: "Accounts & Finance",
    type: "SICK",
    startDate: "2026-08-20",
    endDate: "2026-08-21",
    totalDays: 2,
    reason: "Viral fever and physician recommended rest",
    managerApproval: "PENDING_MANAGER",
    orgApproval: "PENDING_ORG_ADMIN",
    createdAt: "2026-08-19",
  },
];

export class LeaveService {
  static async getLeaveRequests(organizationId: string, query?: { employeeId?: string; status?: string }) {
    let list = leaveRequestsStore.filter((l) => l.organizationId === organizationId);
    if (query?.employeeId) {
      list = list.filter((l) => l.employeeId === query.employeeId);
    }
    return list;
  }

  static async getEmployeeQuotas(organizationId: string, employeeId: string): Promise<LeaveQuota> {
    const empRequests = leaveRequestsStore.filter(
      (l) => l.organizationId === organizationId && l.employeeId === employeeId && l.orgApproval === "APPROVED"
    );

    const casualUsed = empRequests.filter((r) => r.type === "CASUAL").reduce((s, r) => s + r.totalDays, 0);
    const sickUsed = empRequests.filter((r) => r.type === "SICK").reduce((s, r) => s + r.totalDays, 0);
    const annualUsed = empRequests.filter((r) => r.type === "ANNUAL").reduce((s, r) => s + r.totalDays, 0);
    const maternityUsed = empRequests.filter((r) => r.type === "MATERNITY").reduce((s, r) => s + r.totalDays, 0);

    return {
      casual: { total: 10, used: casualUsed, remaining: Math.max(0, 10 - casualUsed) },
      sick: { total: 14, used: sickUsed, remaining: Math.max(0, 14 - sickUsed) },
      annual: { total: 20, used: annualUsed, remaining: Math.max(0, 20 - annualUsed) },
      maternity: { total: 112, used: maternityUsed, remaining: Math.max(0, 112 - maternityUsed) },
    };
  }

  static async applyLeave(data: {
    organizationId: string;
    employeeId: string;
    type: LeaveRequestData["type"];
    startDate: string;
    endDate: string;
    reason: string;
    attachmentS3Key?: string;
  }) {
    const employee = await EmployeeService.getEmployeeById(data.employeeId, data.organizationId);

    // Calculate net working days excluding weekends & company holidays
    const netDays = calculateNetLeaveDays(data.startDate, data.endDate, {
      workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
      holidays: [],
    });

    if (netDays <= 0) {
      throw new ValidationError("Selected date range contains 0 working days");
    }

    // Quota validation
    const quotas = await this.getEmployeeQuotas(data.organizationId, data.employeeId);
    const typeKey = data.type.toLowerCase() as keyof LeaveQuota;
    if (quotas[typeKey] && netDays > quotas[typeKey].remaining) {
      throw new ValidationError(
        `Insufficient ${data.type} leave balance. Requested: ${netDays} days, Remaining: ${quotas[typeKey].remaining} days.`
      );
    }

    const newLeave: LeaveRequestData = {
      id: `leave-${Date.now()}`,
      organizationId: data.organizationId,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: netDays,
      reason: data.reason,
      attachmentS3Key: data.attachmentS3Key,
      managerApproval: "PENDING_MANAGER",
      orgApproval: "PENDING_ORG_ADMIN",
      createdAt: new Date().toISOString().split("T")[0],
    };

    leaveRequestsStore.unshift(newLeave);
    return newLeave;
  }

  static async approveByManager(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const leave = leaveRequestsStore.find((l) => l.id === id && l.organizationId === organizationId);
    if (!leave) throw new NotFoundError("Leave Request");

    leave.managerApproval = decision;
    leave.managerComment = comment;
    if (decision === "REJECTED") {
      leave.orgApproval = "REJECTED";
    }
    return leave;
  }

  static async approveByOrgAdmin(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const leave = leaveRequestsStore.find((l) => l.id === id && l.organizationId === organizationId);
    if (!leave) throw new NotFoundError("Leave Request");

    if (leave.managerApproval !== "APPROVED") {
      throw new ValidationError("Precondition Failed: Manager approval required before Organization Admin final approval.");
    }

    leave.orgApproval = decision;
    leave.orgComment = comment;
    return leave;
  }
}
