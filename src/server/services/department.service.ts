import { ConflictError, NotFoundError } from "../errors";
import { prisma } from "@/lib/prisma";

export interface DepartmentData {
  id: string;
  organizationId: string;
  branchId?: string;
  branchName?: string;
  name: string;
  code: string;
  description?: string;
  head?: string;
  headOfDept?: string;
  headPhone?: string;
  headEmail?: string;
  status?: "Active" | "Inactive";
  totalMembers: number;
  membersCount?: number;
  employeeCount?: number;
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

export class DepartmentService {
  static async getDepartments(organizationId: string): Promise<DepartmentData[]> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const records = await prisma.departments.findMany({
      where: { organizationId: validOrgId },
      orderBy: { createdAt: "asc" },
      include: {
        branches: true,
        _count: {
          select: { employees: true },
        },
        managers: {
          take: 1,
        },
      },
    });

    return records.map((d, index): DepartmentData => {
      const codeGenerated = `DEPT-${d.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "GEN"}${String(index + 1).padStart(2, "0")}`;
      const manager = d.managers[0];
      return {
        id: d.id,
        organizationId: d.organizationId,
        branchId: d.branchId || undefined,
        branchName: d.branches?.name || "All Branches",
        name: d.name,
        code: codeGenerated,
        description: `Core organizational unit for ${d.name} operations and workforce management.`,
        head: manager?.name || "Unassigned Head",
        headOfDept: manager?.name || undefined,
        headPhone: manager?.phone || "+880 1700-000000",
        headEmail: manager?.email || "head@vertextech.io",
        status: "Active",
        totalMembers: d._count.employees,
        membersCount: d._count.employees,
        employeeCount: d._count.employees,
        createdAt: d.createdAt.toISOString().split("T")[0],
      };
    });
  }

  static async getDepartmentById(id: string, organizationId: string): Promise<DepartmentData> {
    const dept = await prisma.departments.findUnique({
      where: { id },
      include: {
        branches: true,
        _count: { select: { employees: true } },
        managers: { take: 1 },
      },
    });

    if (!dept) throw new NotFoundError("Department");

    const manager = dept.managers[0];
    return {
      id: dept.id,
      organizationId: dept.organizationId,
      branchId: dept.branchId || undefined,
      branchName: dept.branches?.name || "All Branches",
      name: dept.name,
      code: `DEPT-${dept.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "GEN"}01`,
      description: `Core organizational unit for ${dept.name} operations and workforce management.`,
      head: manager?.name || "Unassigned Head",
      headOfDept: manager?.name || undefined,
      headPhone: manager?.phone || "+880 1700-000000",
      headEmail: manager?.email || "head@vertextech.io",
      status: "Active",
      totalMembers: dept._count.employees,
      membersCount: dept._count.employees,
      employeeCount: dept._count.employees,
      createdAt: dept.createdAt.toISOString().split("T")[0],
    };
  }

  static async createDepartment(data: {
    organizationId: string;
    name: string;
    branchId?: string | null;
    code?: string;
    headOfDept?: string | null;
    headPhone?: string | null;
    headEmail?: string | null;
    description?: string | null;
    status?: string | null;
  }): Promise<DepartmentData> {
    const validOrgId = await resolveOrganizationId(data.organizationId);

    const existing = await prisma.departments.findFirst({
      where: {
        organizationId: validOrgId,
        name: { equals: data.name.trim(), mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ConflictError(`Department with name '${data.name}' already exists in your organization`);
    }

    const newDept = await prisma.departments.create({
      data: {
        id: `dept-${Date.now()}`,
        organizationId: validOrgId,
        branchId: data.branchId || null,
        name: data.name.trim(),
      },
      include: {
        branches: true,
      },
    });

    return {
      id: newDept.id,
      organizationId: newDept.organizationId,
      branchId: newDept.branchId || undefined,
      branchName: newDept.branches?.name || "All Branches",
      name: newDept.name,
      code: data.code || `DEPT-${newDept.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "GEN"}01`,
      description: data.description || `Core organizational unit for ${newDept.name}.`,
      head: data.headOfDept || "Unassigned Head",
      headOfDept: data.headOfDept || undefined,
      headPhone: data.headPhone || "+880 1700-000000",
      headEmail: data.headEmail || "head@vertextech.io",
      status: data.status === "INACTIVE" ? "Inactive" : "Active",
      totalMembers: 0,
      membersCount: 0,
      employeeCount: 0,
      createdAt: newDept.createdAt.toISOString().split("T")[0],
    };
  }

  static async updateDepartment(
    id: string,
    organizationId: string,
    updates: Partial<DepartmentData> & { head?: string }
  ) {
    const updated = await prisma.departments.update({
      where: { id },
      data: {
        ...(updates.name ? { name: updates.name.trim() } : {}),
        ...(updates.branchId !== undefined ? { branchId: updates.branchId || null } : {}),
      },
      include: {
        branches: true,
        _count: { select: { employees: true } },
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      branchId: updated.branchId || undefined,
      branchName: updated.branches?.name || "All Branches",
      name: updated.name,
      code: updates.code || `DEPT-${updated.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "GEN"}01`,
      description: updates.description || `Core organizational unit for ${updated.name}.`,
      head: updates.head || updates.headOfDept || "Unassigned Head",
      headOfDept: updates.headOfDept || updates.head || undefined,
      headPhone: updates.headPhone || "+880 1700-000000",
      headEmail: updates.headEmail || "head@vertextech.io",
      status: updates.status === "Inactive" ? "Inactive" : "Active",
      totalMembers: updated._count.employees,
      membersCount: updated._count.employees,
      employeeCount: updated._count.employees,
      createdAt: updated.createdAt.toISOString().split("T")[0],
    };
  }

  static async deleteDepartment(id: string, organizationId: string) {
    const dept = await prisma.departments.findUnique({
      where: { id },
    });
    if (!dept) throw new NotFoundError("Department");

    await prisma.departments.delete({
      where: { id },
    });

    return { success: true, deletedDepartment: dept };
  }
}
