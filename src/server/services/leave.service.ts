import { calculateNetLeaveDays } from "@/lib/datetime";
import { NotFoundError, UnauthorizedError, ValidationError } from "../errors";
import { prisma } from "@/lib/prisma";
import { LeaveStatus, LeaveType } from "@prisma/client";

export interface LeaveRequestData {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  branch: string;
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
  /**
   * Get all company leave requests with strict multi-tenant scoping
   */
  static async getLeaveRequests(organizationId: string, query?: { employeeId?: string; status?: string }): Promise<LeaveRequestData[]> {
    if (!organizationId) return [];

    const where: any = {};
    if (organizationId !== "all") {
      where.employees = {
        organizationId: organizationId,
      };
    }

    if (query?.employeeId) {
      where.OR = [
        { employeeId: query.employeeId },
        { employees: { employeeCode: query.employeeId } },
      ];
    }

    if (query?.status && query.status !== "ALL" && query.status !== "All") {
      where.status = query.status.toUpperCase() as LeaveStatus;
    }

    const records = await prisma.leaves.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        employees: {
          include: { 
            departments: true,
            branches: true,
          },
        },
      },
    });

    return records.map((r): LeaveRequestData => {
      const diffTime = Math.abs(r.endDate.getTime() - r.startDate.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

      return {
        id: r.id,
        organizationId: r.employees.organizationId,
        employeeId: r.employees.employeeCode,
        employeeName: r.employees.fullName,
        avatar: r.employees.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        department: r.employees.departments?.name || "General",
        branch: r.employees.branches?.name || "Main Branch",
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

  /**
   * Get employee leave quota balances within organization
   */
  static async getEmployeeQuotas(organizationId: string, employeeId: string): Promise<LeaveQuota> {
    if (!organizationId || !employeeId) {
      return {
        casual: { total: 14, used: 0, remaining: 14 },
        sick: { total: 14, used: 0, remaining: 14 },
        annual: { total: 20, used: 0, remaining: 20 },
        maternity: { total: 112, used: 0, remaining: 112 },
      };
    }

    const whereEmp: any = {
      OR: [{ id: employeeId }, { employeeCode: employeeId }],
    };
    if (organizationId !== "all") {
      whereEmp.organizationId = organizationId;
    }

    const emp = await prisma.employees.findFirst({
      where: whereEmp,
    });

    if (!emp) {
      return {
        casual: { total: 14, used: 0, remaining: 14 },
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
      const diff = Math.abs(l.endDate.getTime() - l.startDate.getTime());
      const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);

      if (l.type === LeaveType.CASUAL) casualUsed += days;
      else if (l.type === LeaveType.SICK) sickUsed += days;
      else if (l.type === LeaveType.ANNUAL) annualUsed += days;
      else if (l.type === LeaveType.MATERNITY) maternityUsed += days;
    }

    return {
      casual: { total: 14, used: casualUsed, remaining: Math.max(0, 14 - casualUsed) },
      sick: { total: 14, used: sickUsed, remaining: Math.max(0, 14 - sickUsed) },
      annual: { total: 20, used: annualUsed, remaining: Math.max(0, 20 - annualUsed) },
      maternity: { total: 112, used: maternityUsed, remaining: Math.max(0, 112 - maternityUsed) },
    };
  }

  /**
   * Apply Leave Application strictly scoped to employee's organization
   */
  static async applyLeave(data: {
    organizationId: string;
    employeeId: string;
    type: LeaveRequestData["type"];
    startDate: string;
    endDate: string;
    reason: string;
    attachmentS3Key?: string;
  }) {
    if (!data.organizationId) {
      throw new ValidationError("Organization ID is required to apply for leave.");
    }

    const whereEmp: any = {
      OR: [
        { id: data.employeeId },
        { employeeCode: data.employeeId },
        { email: data.employeeId },
      ],
    };
    if (data.organizationId !== "all") {
      whereEmp.organizationId = data.organizationId;
    }

    const employee = await prisma.employees.findFirst({
      where: whereEmp,
      include: {
        departments: true,
        branches: true,
      },
    });

    if (!employee) {
      throw new NotFoundError(`Employee with ID '${data.employeeId}' not found in your organization.`);
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const rawDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    let netDays = rawDays;
    try {
      const calculated = calculateNetLeaveDays(data.startDate, data.endDate, {
        workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
        holidays: [],
      });
      if (calculated > 0) netDays = calculated;
    } catch {
      netDays = rawDays;
    }

    const typeEnum = data.type as LeaveType;

    const newLeave = await prisma.leaves.create({
      data: {
        id: `leave-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employeeId: employee.id,
        type: typeEnum,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason || "Personal Leave",
        status: LeaveStatus.PENDING,
        updatedAt: new Date(),
      },
    });

    return {
      id: newLeave.id,
      organizationId: employee.organizationId,
      employeeId: employee.employeeCode,
      employeeName: employee.fullName,
      department: employee.departments?.name || "General",
      branch: employee.branches?.name || "Main Branch",
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

  /**
   * Approve or reject by manager
   */
  static async approveByManager(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const existing = await prisma.leaves.findUnique({
      where: { id },
      include: { employees: true },
    });

    if (!existing) {
      throw new NotFoundError("Leave Request");
    }

    if (organizationId && organizationId !== "all" && existing.employees.organizationId !== organizationId) {
      throw new UnauthorizedError("You are not authorized to manage leaves for another organization.");
    }

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

  /**
   * Approve or reject by org admin
   */
  static async approveByOrgAdmin(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const existing = await prisma.leaves.findUnique({
      where: { id },
      include: { employees: true },
    });

    if (!existing) {
      throw new NotFoundError("Leave Request");
    }

    if (organizationId && organizationId !== "all" && existing.employees.organizationId !== organizationId) {
      throw new UnauthorizedError("You are not authorized to manage leaves for another organization.");
    }

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
