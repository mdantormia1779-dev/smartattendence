import { NotFoundError, ConflictError, ValidationError } from "../errors";
import { prisma } from "@/lib/prisma";

export interface ShiftData {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  name: string;
  type: "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE" | "ROTATIONAL";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  graceMinutes: number;
  overtimeThresholdHours: number;
  workingDays: string[];
  status: "Active" | "Inactive";
  activeEmployees: number;
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

export class ShiftService {
  /**
   * Get all shifts for an organization (optionally filtered by branchId)
   */
  static async getShifts(organizationId: string, branchId?: string): Promise<ShiftData[]> {
    const validOrgId = await resolveOrganizationId(organizationId);

    // 1. Find all branches for this organization
    const branches = await prisma.branches.findMany({
      where: { organizationId: validOrgId },
      select: { id: true, name: true },
    });

    let branchIds = branches.map((b) => b.id);

    // If organization has no branch yet, ensure a default branch exists
    if (branchIds.length === 0) {
      const defaultBranch = await prisma.branches.create({
        data: {
          id: `branch-main-${Date.now()}`,
          organizationId: validOrgId,
          name: "Main Head Office",
          code: "HQ-01",
          address: "Dhaka, Bangladesh",
          latitude: 23.8103,
          longitude: 90.4125,
          geoFenceRadius: 150,
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });
      branchIds = [defaultBranch.id];
    }

    // Determine target branches to query
    let targetBranchIds = branchIds;
    if (branchId && branchId !== "all" && branchId !== "All") {
      targetBranchIds = branchIds.filter((id) => id === branchId);
      if (targetBranchIds.length === 0) {
        // If branchId is specified directly
        targetBranchIds = [branchId];
      }
    }

    // 2. Query real shifts from database
    let dbShifts = await prisma.shifts.findMany({
      where: { branchId: { in: targetBranchIds } },
      include: {
        branches: { select: { id: true, name: true, organizationId: true } },
        _count: {
          select: {
            shift_assignments: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // If no shifts exist yet for this organization, auto-create standard initial shifts
    if (dbShifts.length === 0 && (!branchId || branchId === "all" || branchId === "All") && branchIds.length > 0) {
      const primaryBranchId = branchIds[0];
      const initialShifts = [
        {
          id: `shift-morning-${Date.now()}`,
          branchId: primaryBranchId,
          name: "Morning Regular Shift",
          startTime: "09:00 AM",
          endTime: "05:00 PM",
          breakMinutes: 60,
          gracePeriod: 15,
          lateAfter: 30,
        },
        {
          id: `shift-evening-${Date.now() + 1}`,
          branchId: primaryBranchId,
          name: "Evening Support Shift",
          startTime: "02:00 PM",
          endTime: "10:00 PM",
          breakMinutes: 45,
          gracePeriod: 15,
          lateAfter: 30,
        },
        {
          id: `shift-night-${Date.now() + 2}`,
          branchId: primaryBranchId,
          name: "Night Operations Shift",
          startTime: "10:00 PM",
          endTime: "06:00 AM",
          breakMinutes: 60,
          gracePeriod: 15,
          lateAfter: 30,
        },
      ];

      for (const s of initialShifts) {
        await prisma.shifts.create({ data: s }).catch(() => {});
      }

      dbShifts = await prisma.shifts.findMany({
        where: { branchId: { in: branchIds } },
        include: {
          branches: { select: { id: true, name: true, organizationId: true } },
          _count: {
            select: {
              shift_assignments: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    // 3. Map to ShiftData
    return dbShifts.map((s) => {
      const nameUpper = s.name.toUpperCase();
      let shiftType: ShiftData["type"] = "MORNING";
      if (nameUpper.includes("EVENING")) shiftType = "EVENING";
      else if (nameUpper.includes("NIGHT")) shiftType = "NIGHT";
      else if (nameUpper.includes("FLEX")) shiftType = "FLEXIBLE";
      else if (nameUpper.includes("ROTAT")) shiftType = "ROTATIONAL";

      return {
        id: s.id,
        organizationId: s.branches?.organizationId || validOrgId,
        branchId: s.branchId,
        branchName: s.branches?.name || "Main Branch",
        name: s.name,
        type: shiftType,
        startTime: s.startTime,
        endTime: s.endTime,
        breakMinutes: s.breakMinutes,
        graceMinutes: s.gracePeriod,
        overtimeThresholdHours: 8.0,
        workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
        status: "Active",
        activeEmployees: s._count?.shift_assignments || 0,
        createdAt: s.createdAt.toISOString().split("T")[0],
      };
    });
  }

  /**
   * Get single shift by ID
   */
  static async getShiftById(id: string, organizationId: string): Promise<ShiftData> {
    const shift = await prisma.shifts.findUnique({
      where: { id },
      include: {
        branches: { select: { id: true, name: true, organizationId: true } },
        _count: { select: { shift_assignments: true } },
      },
    });

    if (!shift) throw new NotFoundError("Shift");

    const nameUpper = shift.name.toUpperCase();
    let shiftType: ShiftData["type"] = "MORNING";
    if (nameUpper.includes("EVENING")) shiftType = "EVENING";
    else if (nameUpper.includes("NIGHT")) shiftType = "NIGHT";
    else if (nameUpper.includes("FLEX")) shiftType = "FLEXIBLE";
    else if (nameUpper.includes("ROTAT")) shiftType = "ROTATIONAL";

    return {
      id: shift.id,
      organizationId: shift.branches?.organizationId || organizationId,
      branchId: shift.branchId,
      branchName: shift.branches?.name || "Main Branch",
      name: shift.name,
      type: shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMinutes: shift.breakMinutes,
      graceMinutes: shift.gracePeriod,
      overtimeThresholdHours: 8.0,
      workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
      status: "Active",
      activeEmployees: shift._count?.shift_assignments || 0,
      createdAt: shift.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Create a new shift in the database
   */
  static async createShift(data: {
    organizationId: string;
    branchId?: string | null;
    name: string;
    type?: ShiftData["type"] | string;
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    graceMinutes?: number;
    overtimeThresholdHours?: number;
    workingDays?: string[];
    status?: string;
  }): Promise<ShiftData> {
    const validOrgId = await resolveOrganizationId(data.organizationId);

    if (!data.name || !data.startTime || !data.endTime) {
      throw new ValidationError("Shift name, start time, and end time are required.");
    }

    // Resolve branch ID
    let targetBranchId = data.branchId;
    if (!targetBranchId) {
      const branch = await prisma.branches.findFirst({
        where: { organizationId: validOrgId },
      });
      if (branch) {
        targetBranchId = branch.id;
      } else {
        const newBranch = await prisma.branches.create({
          data: {
            id: `branch-main-${Date.now()}`,
            organizationId: validOrgId,
            name: "Main Head Office",
            code: "HQ-01",
            address: "Dhaka, Bangladesh",
            latitude: 23.8103,
            longitude: 90.4125,
            geoFenceRadius: 150,
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        });
        targetBranchId = newBranch.id;
      }
    }

    const created = await prisma.shifts.create({
      data: {
        id: `shift-${Date.now()}`,
        branchId: targetBranchId,
        name: data.name.trim(),
        startTime: data.startTime.trim(),
        endTime: data.endTime.trim(),
        breakMinutes: data.breakMinutes ?? 60,
        gracePeriod: data.graceMinutes ?? 15,
        lateAfter: (data.graceMinutes ?? 15) * 2,
        createdAt: new Date(),
      },
      include: {
        branches: { select: { id: true, name: true, organizationId: true } },
      },
    });

    const nameUpper = created.name.toUpperCase();
    let shiftType: ShiftData["type"] = (data.type?.toUpperCase() as any) || "MORNING";
    if (!data.type) {
      if (nameUpper.includes("EVENING")) shiftType = "EVENING";
      else if (nameUpper.includes("NIGHT")) shiftType = "NIGHT";
      else if (nameUpper.includes("FLEX")) shiftType = "FLEXIBLE";
      else if (nameUpper.includes("ROTAT")) shiftType = "ROTATIONAL";
    }

    return {
      id: created.id,
      organizationId: validOrgId,
      branchId: created.branchId,
      branchName: created.branches?.name || "Main Branch",
      name: created.name,
      type: shiftType,
      startTime: created.startTime,
      endTime: created.endTime,
      breakMinutes: created.breakMinutes,
      graceMinutes: created.gracePeriod,
      overtimeThresholdHours: data.overtimeThresholdHours ?? 8.0,
      workingDays: data.workingDays || ["Sun", "Mon", "Tue", "Wed", "Thu"],
      status: (data.status === "Inactive" || data.status === "INACTIVE" ? "Inactive" : "Active"),
      activeEmployees: 0,
      createdAt: created.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Update an existing shift in the database (including branch change)
   */
  static async updateShift(
    id: string,
    organizationId: string,
    updates: Partial<ShiftData> & { graceMinutes?: number }
  ): Promise<ShiftData> {
    const existing = await prisma.shifts.findUnique({
      where: { id },
      include: {
        branches: true,
        _count: { select: { shift_assignments: true } },
      },
    });

    if (!existing) throw new NotFoundError("Shift");

    const updated = await prisma.shifts.update({
      where: { id },
      data: {
        ...(updates.name ? { name: updates.name.trim() } : {}),
        ...(updates.startTime ? { startTime: updates.startTime.trim() } : {}),
        ...(updates.endTime ? { endTime: updates.endTime.trim() } : {}),
        ...(updates.breakMinutes !== undefined ? { breakMinutes: updates.breakMinutes } : {}),
        ...(updates.graceMinutes !== undefined ? { gracePeriod: updates.graceMinutes } : {}),
        ...(updates.branchId ? { branchId: updates.branchId } : {}),
      },
      include: {
        branches: { select: { id: true, name: true, organizationId: true } },
        _count: { select: { shift_assignments: true } },
      },
    });

    const shiftType = (updates.type || "MORNING") as ShiftData["type"];

    return {
      id: updated.id,
      organizationId: updated.branches?.organizationId || organizationId,
      branchId: updated.branchId,
      branchName: updated.branches?.name || "Main Branch",
      name: updated.name,
      type: shiftType,
      startTime: updated.startTime,
      endTime: updated.endTime,
      breakMinutes: updated.breakMinutes,
      graceMinutes: updated.gracePeriod,
      overtimeThresholdHours: updates.overtimeThresholdHours ?? 8.0,
      workingDays: updates.workingDays || ["Sun", "Mon", "Tue", "Wed", "Thu"],
      status: updates.status || "Active",
      activeEmployees: updated._count?.shift_assignments || 0,
      createdAt: updated.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Delete a shift and unassign employees
   */
  static async deleteShift(id: string, organizationId: string): Promise<{ deleted: boolean; id: string }> {
    const existing = await prisma.shifts.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundError("Shift");

    // Remove shift assignments first
    await prisma.shift_assignments.deleteMany({
      where: { shiftId: id },
    }).catch(() => {});

    // Delete shift record
    await prisma.shifts.delete({
      where: { id },
    });

    return { deleted: true, id };
  }

  /**
   * Get all employees assigned to a shift
   */
  static async getShiftEmployees(shiftId: string, organizationId: string) {
    const assignments = await prisma.shift_assignments.findMany({
      where: { shiftId },
      include: {
        employees: {
          include: {
            branches: true,
            departments: true,
          },
        },
      },
      orderBy: { effectiveFrom: "desc" },
    });

    return assignments.map((a) => ({
      assignmentId: a.id,
      employeeId: a.employees.id,
      employeeCode: a.employees.employeeCode,
      fullName: a.employees.fullName,
      email: a.employees.email,
      designation: a.employees.designation,
      branch: a.employees.branches?.name || "Main Branch",
      department: a.employees.departments?.name || "General",
      effectiveFrom: a.effectiveFrom,
    }));
  }

  /**
   * Assign or reassign employees to a shift
   */
  static async assignEmployeesToShift(shiftId: string, employeeIds: string[], organizationId: string) {
    const shift = await prisma.shifts.findUnique({
      where: { id: shiftId },
    });
    if (!shift) throw new NotFoundError("Shift");

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return { success: true, count: 0 };
    }

    // 1. Remove previous shift assignments for these employees
    await prisma.shift_assignments.deleteMany({
      where: {
        employeeId: { in: employeeIds },
      },
    }).catch(() => {});

    // 2. Create new shift assignments
    const created = await Promise.all(
      employeeIds.map((empId, idx) =>
        prisma.shift_assignments.create({
          data: {
            id: `sa-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            employeeId: empId,
            shiftId: shiftId,
            effectiveFrom: new Date(),
          },
        })
      )
    );

    return {
      success: true,
      shiftId,
      assignedCount: created.length,
      employeeIds,
    };
  }

  /**
   * Unassign an employee from a shift
   */
  static async unassignEmployeeFromShift(shiftId: string, employeeId: string, organizationId: string) {
    await prisma.shift_assignments.deleteMany({
      where: {
        shiftId,
        employeeId,
      },
    });

    return { success: true, shiftId, employeeId };
  }
}
