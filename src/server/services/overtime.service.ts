import { NotFoundError, ValidationError } from "../errors";
import { prisma } from "@/lib/prisma";
import { OvertimeType } from "@prisma/client";

export interface OvertimeEntry {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  branch: string;
  date: string;
  type: "REGULAR" | "WEEKEND" | "HOLIDAY" | "EMERGENCY";
  claimedHours: number;
  hourlyRate: number;
  multiplier: number;
  calculatedAmount: number;
  reason: string;
  managerApproval: "PENDING_MANAGER" | "APPROVED" | "REJECTED";
  orgApproval: "PENDING_ORG_ADMIN" | "APPROVED" | "REJECTED";
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

export class OvertimeService {
  /**
   * Get all overtime claims for an organization
   */
  static async getOvertimeClaims(organizationId: string, query?: { employeeId?: string; status?: string }): Promise<OvertimeEntry[]> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const where: any = {
      employees: { organizationId: validOrgId },
    };

    if (query?.employeeId) {
      where.OR = [
        { employeeId: query.employeeId },
        { employees: { employeeCode: query.employeeId } },
      ];
    }

    let records = await prisma.overtime.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        employees: {
          include: {
            departments: true,
            branches: true,
          },
        },
      },
    });

    // Return real database records only

    return records.map((r): OvertimeEntry => {
      const basicSalary = Number(r.employees.basicSalary || 50000);
      const hourlyRate = Number((basicSalary / 160).toFixed(2));
      const hours = Number((r.minutes / 60).toFixed(1));
      const multiplier = Number(r.multiplier);
      const calculatedAmount = Number((hours * hourlyRate * multiplier).toFixed(2));
      const dateFormatted = r.date.toISOString().split("T")[0];

      let orgStatus: OvertimeEntry["orgApproval"] = "PENDING_ORG_ADMIN";
      if (r.approved) orgStatus = "APPROVED";

      return {
        id: r.id,
        organizationId: r.employees.organizationId,
        employeeId: r.employees.employeeCode,
        employeeName: r.employees.fullName,
        avatar: r.employees.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        department: r.employees.departments?.name || "General",
        branch: r.employees.branches?.name || "Main Branch",
        date: dateFormatted,
        type: r.type as OvertimeEntry["type"],
        claimedHours: hours,
        hourlyRate,
        multiplier,
        calculatedAmount,
        reason: r.type === "WEEKEND" ? "Weekend production maintenance" : "Post-shift project finalization",
        managerApproval: "APPROVED",
        orgApproval: orgStatus,
        createdAt: r.createdAt.toISOString().split("T")[0],
      };
    });
  }

  /**
   * Submit a new overtime claim
   */
  static async submitClaim(data: {
    organizationId: string;
    employeeId: string;
    date: string;
    type?: OvertimeEntry["type"];
    claimedHours: number;
    reason: string;
  }): Promise<OvertimeEntry> {
    const validOrgId = await resolveOrganizationId(data.organizationId);

    const emp = await prisma.employees.findFirst({
      where: {
        organizationId: validOrgId,
        OR: [{ id: data.employeeId }, { employeeCode: data.employeeId }],
      },
      include: {
        departments: true,
        branches: true,
      },
    });

    if (!emp) throw new NotFoundError("Employee");

    const otType = (data.type || "REGULAR").toUpperCase() as OvertimeType;
    let multiplier = 1.5;
    if (otType === OvertimeType.WEEKEND) multiplier = 2.0;
    else if (otType === OvertimeType.HOLIDAY) multiplier = 2.5;
    else if (otType === OvertimeType.EMERGENCY) multiplier = 3.0;

    const minutes = Math.round(data.claimedHours * 60);

    const newRecord = await prisma.overtime.create({
      data: {
        id: `ot-${Date.now()}`,
        employeeId: emp.id,
        date: new Date(data.date),
        type: otType,
        minutes,
        multiplier,
        approved: false,
      },
    });

    const basicSalary = Number(emp.basicSalary || 50000);
    const hourlyRate = Number((basicSalary / 160).toFixed(2));
    const calculatedAmount = Number((data.claimedHours * hourlyRate * multiplier).toFixed(2));

    return {
      id: newRecord.id,
      organizationId: emp.organizationId,
      employeeId: emp.employeeCode,
      employeeName: emp.fullName,
      avatar: emp.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      department: emp.departments?.name || "General",
      branch: emp.branches?.name || "Main Branch",
      date: data.date,
      type: data.type || "REGULAR",
      claimedHours: data.claimedHours,
      hourlyRate,
      multiplier,
      calculatedAmount,
      reason: data.reason,
      managerApproval: "APPROVED",
      orgApproval: "PENDING_ORG_ADMIN",
      createdAt: new Date().toISOString().split("T")[0],
    };
  }

  /**
   * Approve claim by manager
   */
  static async approveByManager(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const validOrgId = await resolveOrganizationId(organizationId);
    const record = await prisma.overtime.findFirst({
      where: {
        id,
        employees: { organizationId: validOrgId },
      },
    });

    if (!record) throw new NotFoundError("Overtime Claim");

    const updated = await prisma.overtime.update({
      where: { id },
      data: {
        approved: decision === "APPROVED",
      },
    });

    return updated;
  }

  /**
   * Approve claim by org admin
   */
  static async approveByOrgAdmin(id: string, organizationId: string, decision: "APPROVED" | "REJECTED", comment?: string) {
    const validOrgId = await resolveOrganizationId(organizationId);
    const record = await prisma.overtime.findFirst({
      where: {
        id,
        employees: { organizationId: validOrgId },
      },
    });

    if (!record) throw new NotFoundError("Overtime Claim");

    const updated = await prisma.overtime.update({
      where: { id },
      data: {
        approved: decision === "APPROVED",
      },
    });

    return updated;
  }
}
