import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "./subscription.service";

export interface ManagerData {
  id: string;
  organizationId: string;
  managerId: string;
  name: string;
  profilePic?: string;
  email: string;
  phone: string;
  designation: string;
  branchId?: string;
  assignedBranch: string;
  departmentId?: string;
  department: string;
  status: "Active" | "Inactive";
  teamCount: number;
  createdAt: string;
}

async function resolveOrganizationId(rawOrgId?: string): Promise<string> {
  if (rawOrgId) {
    const org = await prisma.organizations.findUnique({ where: { id: rawOrgId } });
    if (org) return org.id;
  }
  const firstOrg = await prisma.organizations.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (firstOrg) return firstOrg.id;

  const newOrg = await prisma.organizations.create({
    data: {
      id: `org-${Date.now()}`,
      name: "My Organization",
      slug: `org-${Date.now()}`,
      email: "admin@organization.com",
      updatedAt: new Date(),
    },
  });
  return newOrg.id;
}

export class ManagerService {
  static async getManagers(organizationId: string): Promise<ManagerData[]> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const records = await prisma.managers.findMany({
      where: { organizationId: validOrgId },
      orderBy: { createdAt: "desc" },
      include: {
        branches: true,
        departments: true,
        _count: {
          select: {
            employees: true,
            leaves: true,
          },
        },
      },
    });

    return records.map((m, idx): ManagerData => ({
      id: m.id,
      organizationId: m.organizationId,
      managerId: `MGR-${m.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || String(idx + 1).padStart(3, "0")}`,
      name: m.name,
      profilePic: m.profilePicture || undefined,
      email: m.email,
      phone: m.phone || "+880 1800-000000",
      designation: m.designation || "Lead Manager",
      branchId: m.branchId || undefined,
      assignedBranch: m.branches?.name || "Main Head Office",
      departmentId: m.departmentId || undefined,
      department: m.departments?.name || "General Operations",
      status: "Active",
      teamCount: m._count.employees,
      createdAt: m.createdAt.toISOString().split("T")[0],
    }));
  }

  static async getManagerById(id: string, organizationId: string): Promise<ManagerData> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const m = await prisma.managers.findFirst({
      where: {
        id,
        organizationId: validOrgId,
      },
      include: {
        branches: true,
        departments: true,
        _count: {
          select: {
            employees: true,
            leaves: true,
          },
        },
      },
    });

    if (!m) throw new NotFoundError("Manager");

    return {
      id: m.id,
      organizationId: m.organizationId,
      managerId: `MGR-${m.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "001"}`,
      name: m.name,
      profilePic: m.profilePicture || undefined,
      email: m.email,
      phone: m.phone || "+880 1800-000000",
      designation: m.designation || "Lead Manager",
      branchId: m.branchId || undefined,
      assignedBranch: m.branches?.name || "Main Head Office",
      departmentId: m.departmentId || undefined,
      department: m.departments?.name || "General Operations",
      status: "Active",
      teamCount: m._count.employees,
      createdAt: m.createdAt.toISOString().split("T")[0],
    };
  }

  static async createManager(data: {
    organizationId: string;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    designation?: string;
    branchId?: string | null;
    assignedBranch?: string | null;
    departmentId?: string | null;
    department?: string | null;
    profilePic?: string | null;
    status?: string | null;
  }): Promise<ManagerData> {
    const validOrgId = await resolveOrganizationId(data.organizationId);

    if (!data.name || !data.email) {
      throw new ValidationError("Name and Email are required");
    }

    const cleanEmail = data.email.trim().toLowerCase();

    // Check duplicate
    const existing = await prisma.managers.findFirst({
      where: {
        organizationId: validOrgId,
        email: cleanEmail,
      },
    });

    if (existing) {
      throw new ConflictError(`Manager with email '${cleanEmail}' already exists in your organization`);
    }

    // Enforce Subscription Quota for Managers
    await SubscriptionService.assertCanAddManager(validOrgId);

    // Resolve branch ID if string name passed
    let branchId = data.branchId || null;
    if (!branchId && data.assignedBranch) {
      const b = await prisma.branches.findFirst({
        where: {
          organizationId: validOrgId,
          name: { equals: data.assignedBranch.trim(), mode: "insensitive" },
        },
      });
      if (b) branchId = b.id;
    }

    // Resolve department ID if string name passed
    let departmentId = data.departmentId || null;
    if (!departmentId && data.department) {
      const d = await prisma.departments.findFirst({
        where: {
          organizationId: validOrgId,
          name: { equals: data.department.trim(), mode: "insensitive" },
        },
      });
      if (d) departmentId = d.id;
    }

    const managerId = `mgr-${Date.now()}`;
    const defaultPassword = data.password || "manager123";

    const newManager = await prisma.managers.create({
      data: {
        id: managerId,
        organizationId: validOrgId,
        branchId: branchId,
        departmentId: departmentId,
        name: data.name.trim(),
        email: cleanEmail,
        password: defaultPassword,
        phone: data.phone?.trim() || null,
        designation: data.designation?.trim() || "Lead Manager",
        profilePicture: data.profilePic || null,
        updatedAt: new Date(),
      },
      include: {
        branches: true,
        departments: true,
      },
    });

    return {
      id: newManager.id,
      organizationId: newManager.organizationId,
      managerId: `MGR-${newManager.id.slice(-4).toUpperCase()}`,
      name: newManager.name,
      profilePic: newManager.profilePicture || undefined,
      email: newManager.email,
      phone: newManager.phone || "+880 1800-000000",
      designation: newManager.designation || "Lead Manager",
      branchId: newManager.branchId || undefined,
      assignedBranch: newManager.branches?.name || data.assignedBranch || "Main Head Office",
      departmentId: newManager.departmentId || undefined,
      department: newManager.departments?.name || data.department || "General Operations",
      status: "Active",
      teamCount: 0,
      createdAt: newManager.createdAt.toISOString().split("T")[0],
    };
  }

  static async updateManager(
    id: string,
    organizationId: string,
    updates: Partial<ManagerData> & { password?: string; profilePic?: string; assignedBranch?: string; department?: string }
  ): Promise<ManagerData> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const existing = await prisma.managers.findFirst({
      where: { id, organizationId: validOrgId },
    });
    if (!existing) throw new NotFoundError("Manager");

    // Resolve branch
    let branchId = updates.branchId;
    if (branchId === undefined && updates.assignedBranch) {
      const b = await prisma.branches.findFirst({
        where: {
          organizationId: validOrgId,
          name: { equals: updates.assignedBranch.trim(), mode: "insensitive" },
        },
      });
      if (b) branchId = b.id;
    }

    // Resolve department
    let departmentId = updates.departmentId;
    if (departmentId === undefined && updates.department) {
      const d = await prisma.departments.findFirst({
        where: {
          organizationId: validOrgId,
          name: { equals: updates.department.trim(), mode: "insensitive" },
        },
      });
      if (d) departmentId = d.id;
    }

    const updated = await prisma.managers.update({
      where: { id },
      data: {
        ...(updates.name ? { name: updates.name.trim() } : {}),
        ...(updates.email ? { email: updates.email.trim().toLowerCase() } : {}),
        ...(updates.phone ? { phone: updates.phone.trim() } : {}),
        ...(updates.designation ? { designation: updates.designation.trim() } : {}),
        ...(updates.password ? { password: updates.password } : {}),
        ...(updates.profilePic !== undefined ? { profilePicture: updates.profilePic || null } : {}),
        ...(branchId !== undefined ? { branchId } : {}),
        ...(departmentId !== undefined ? { departmentId } : {}),
        updatedAt: new Date(),
      },
      include: {
        branches: true,
        departments: true,
        _count: {
          select: { employees: true },
        },
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      managerId: `MGR-${updated.id.slice(-4).toUpperCase()}`,
      name: updated.name,
      profilePic: updated.profilePicture || undefined,
      email: updated.email,
      phone: updated.phone || "+880 1800-000000",
      designation: updated.designation || "Lead Manager",
      branchId: updated.branchId || undefined,
      assignedBranch: updated.branches?.name || updates.assignedBranch || "Main Head Office",
      departmentId: updated.departmentId || undefined,
      department: updated.departments?.name || updates.department || "General Operations",
      status: "Active",
      teamCount: updated._count.employees,
      createdAt: updated.createdAt.toISOString().split("T")[0],
    };
  }

  static async deleteManager(id: string, organizationId: string) {
    const validOrgId = await resolveOrganizationId(organizationId);

    const existing = await prisma.managers.findFirst({
      where: { id, organizationId: validOrgId },
    });
    if (!existing) throw new NotFoundError("Manager");

    // Unassign manager from employees first
    await prisma.employees.updateMany({
      where: { managerId: id },
      data: { managerId: null },
    });

    await prisma.managers.delete({
      where: { id },
    });

    return { success: true, deletedId: id };
  }
}
