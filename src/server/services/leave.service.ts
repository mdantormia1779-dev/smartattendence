import { calculateNetLeaveDays } from "@/lib/datetime";
import { NotFoundError, ValidationError } from "../errors";
import { EmployeeService } from "./employee.service";
import { prisma } from "@/lib/prisma";
import { LeaveStatus, LeaveType } from "@prisma/client";

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
  days?: number;
  status?: string;
}

export interface LeaveQuota {
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  annual: { total: number; used: number; remaining: number };
  maternity: { total: number; used: number; remaining: number };
}

export class LeaveService {
  static async getLeaveRequests(organizationId: string, query?: { employeeId?: string; status?: string }) {
    const where: any = {
      employees: { organizationId },
    };

    if (query?.employeeId) {
      where.OR = [
        { employeeId: query.employeeId },
        { employees: { employeeCode: query.employeeId } },
      ];
    }

    if (query?.status && query.status !== "ALL") {
      where.status = query.status.toUpperCase() as LeaveStatus;
    }

    const records = await prisma.leaves.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        employees: {
          include: { departments: true },
        },
      },
    });

    return records.map((r): LeaveRequestData => {
      const diffTime = Math.abs(r.endDate.getTime() - r.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: r.id,
        organizationId: r.employees.organizationId,
        employeeId: r.employees.employeeCode,
        employeeName: r.employees.fullName,
        department: r.employees.departments?.name || "General",
        type: r.type as any,
        startDate: r.startDate.toISOString().split("T")[0],
        endDate: r.endDate.toISOString().split("T")[0],
        totalDays: diffDays,
        days: diffDays,
        status: r.status,
        reason: r.reason || "Personal Leave",
        managerApproval: r.status === LeaveStatus.APPROVED ? "APPROVED" : r.status === LeaveStatus.REJECTED ? "REJECTED" : "PENDING_MANAGER",
        orgApproval: r.status === LeaveStatus.APPROVED ? "APPROVED" : r.status === LeaveStatus.REJECTED ? "REJECTED" : "PENDING_ORG_ADMIN",
        managerComment: r.managerNote || undefined,
        orgComment: r.orgNote || undefined,
        createdAt: r.createdAt.toISOString().split("T")[0],
      };
    });
  }

  static async getEmployeeQuotas(organizationId: string, employeeId: string): Promise<LeaveQuota> {
    const emp = await prisma.employees.findFirst({
      where: {
        organizationId,
        OR: [{ id: employeeId }, { employeeCode: employeeId }],
      },
    });

    if (!emp) {
      return {
        casual: { total: 10, used: 0, remaining: 10 },
        sick: { total: 14, used: 0, remaining: 14 },
        annual: { total: 20, used: 0, remaining: 20 },
        maternity: { total: 112, used: 0, remaining: 112 },
      };
    }

    const approvedLeaves = await prisma.leaves.findMany({
      where: {
        employeeId: emp.id,
        status: LeaveStatus.APPROVED,
      },
    });

    let casualUsed = 0;
    let sickUsed = 0;
    let annualUsed = 0;
    let maternityUsed = 0;

    for (const l of approvedLeaves) {
      const diffTime = Math.abs(l.endDate.getTime() - l.startDate.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (l.type === LeaveType.CASUAL) casualUsed += days;
      else if (l.type === LeaveType.SICK) sickUsed += days;
      else if (l.type === LeaveType.ANNUAL) annualUsed += days;
      else if (l.type === LeaveType.MATERNITY) maternityUsed += days;
    }

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

    const netDays = calculateNetLeaveDays(data.startDate, data.endDate, {
      workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
      holidays: [],
    });

    if (netDays <= 0) {
      throw new ValidationError("Selected date range contains 0 working days");
    }

    const typeEnum = data.type as LeaveType;

    const newLeave = await prisma.leaves.create({
      data: {
        id: `leave-${Date.now()}`,
        employeeId: employee.id,
        type: typeEnum,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: LeaveStatus.PENDING,
        updatedAt: new Date(),
      },
    });

    return {
      id: newLeave.id,
      organizationId: data.organizationId,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: netDays,
      days: netDays,
      status: "PENDING",
      reason: data.reason,
      attachmentS3Key: data.attachmentS3Key,
      managerApproval: "PENDING_MANAGER",
      orgApproval: "PENDING_ORG_ADMIN",
      createdAt: new Date().toISOString().split("T")[0],
    };
  }

  static async approveByManager(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const statusEnum = decision === "APPROVED" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    const leave = await prisma.leaves.update({
      where: { id },
      data: {
        status: statusEnum,
        managerNote: comment,
        updatedAt: new Date(),
      },
    });
    return leave;
  }

  static async approveByOrgAdmin(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const statusEnum = decision === "APPROVED" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    const leave = await prisma.leaves.update({
      where: { id },
      data: {
        status: statusEnum,
        orgNote: comment,
        updatedAt: new Date(),
      },
    });
    return leave;
  }
}
