import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { prisma } from "@/lib/prisma";
import { OrgStatus } from "@prisma/client";
import { SubscriptionService } from "./subscription.service";

export interface BranchData {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number; // in meters (20-1000)
  status: "Active" | "Inactive";
  assignedManager?: string;
  totalEmployees: number;
  employeesCount?: number;
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

export class BranchService {
  static async getBranches(organizationId: string): Promise<BranchData[]> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const branches = await prisma.branches.findMany({
      where: { organizationId: validOrgId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
        managers: {
          take: 1,
        },
      },
    });

    return branches.map((b): BranchData => ({
      id: b.id,
      organizationId: b.organizationId,
      name: b.name,
      code: b.code,
      address: b.address || "Main Address",
      phone: b.phone || "+880 1700-000000",
      latitude: Number(b.latitude) || 23.8103,
      longitude: Number(b.longitude) || 90.4125,
      geofenceRadius: b.geoFenceRadius || 120,
      status: b.status === OrgStatus.ACTIVE ? "Active" : "Inactive",
      assignedManager: b.managers[0]?.name || undefined,
      totalEmployees: b._count.employees,
      employeesCount: b._count.employees,
      createdAt: b.createdAt.toISOString().split("T")[0],
    }));
  }

  static async getBranchById(id: string, organizationId: string): Promise<BranchData> {
    const validOrgId = await resolveOrganizationId(organizationId);

    const branch = await prisma.branches.findFirst({
      where: {
        id,
        organizationId: validOrgId,
      },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
        managers: {
          take: 1,
        },
      },
    });

    if (!branch) {
      // Try searching just by id if organization matches
      const fallback = await prisma.branches.findUnique({
        where: { id },
        include: {
          _count: { select: { employees: true } },
          managers: { take: 1 },
        },
      });
      if (fallback) {
        return {
          id: fallback.id,
          organizationId: fallback.organizationId,
          name: fallback.name,
          code: fallback.code,
          address: fallback.address || "Main Address",
          phone: fallback.phone || "+880 1700-000000",
          latitude: Number(fallback.latitude) || 23.8103,
          longitude: Number(fallback.longitude) || 90.4125,
          geofenceRadius: fallback.geoFenceRadius || 120,
          status: fallback.status === OrgStatus.ACTIVE ? "Active" : "Inactive",
          assignedManager: fallback.managers[0]?.name || undefined,
          totalEmployees: fallback._count.employees,
          employeesCount: fallback._count.employees,
          createdAt: fallback.createdAt.toISOString().split("T")[0],
        };
      }
      throw new NotFoundError("Branch");
    }

    return {
      id: branch.id,
      organizationId: branch.organizationId,
      name: branch.name,
      code: branch.code,
      address: branch.address || "Main Address",
      phone: branch.phone || "+880 1700-000000",
      latitude: Number(branch.latitude) || 23.8103,
      longitude: Number(branch.longitude) || 90.4125,
      geofenceRadius: branch.geoFenceRadius || 120,
      status: branch.status === OrgStatus.ACTIVE ? "Active" : "Inactive",
      assignedManager: branch.managers[0]?.name || undefined,
      totalEmployees: branch._count.employees,
      employeesCount: branch._count.employees,
      createdAt: branch.createdAt.toISOString().split("T")[0],
    };
  }

  static async createBranch(data: {
    organizationId: string;
    name: string;
    code: string;
    address: string;
    phone?: string;
    latitude: number;
    longitude: number;
    geofenceRadius?: number;
    status?: string;
  }): Promise<BranchData> {
    if (data.latitude < -90 || data.latitude > 90) {
      throw new ValidationError("Latitude must be between -90 and 90 degrees");
    }
    if (data.longitude < -180 || data.longitude > 180) {
      throw new ValidationError("Longitude must be between -180 and 180 degrees");
    }
    const radius = data.geofenceRadius || 120;
    if (radius < 20 || radius > 1000) {
      throw new ValidationError("Geofence radius must be between 20 and 1000 meters");
    }

    const validOrgId = await resolveOrganizationId(data.organizationId);

    const existing = await prisma.branches.findFirst({
      where: {
        organizationId: validOrgId,
        code: data.code.toUpperCase(),
      },
    });

    if (existing) {
      throw new ConflictError(`Branch with code '${data.code}' already exists in your organization`);
    }

    // Enforce Subscription Quota for Branches
    await SubscriptionService.assertCanAddBranch(validOrgId);

    const statusEnum = data.status?.toUpperCase() === "INACTIVE" ? OrgStatus.SUSPENDED : OrgStatus.ACTIVE;

    const newBranch = await prisma.branches.create({
      data: {
        id: `branch-${Date.now()}`,
        organizationId: validOrgId,
        name: data.name,
        code: data.code.toUpperCase(),
        address: data.address,
        phone: data.phone || null,
        latitude: data.latitude,
        longitude: data.longitude,
        geoFenceRadius: radius,
        status: statusEnum,
        updatedAt: new Date(),
      },
    });

    return {
      id: newBranch.id,
      organizationId: newBranch.organizationId,
      name: newBranch.name,
      code: newBranch.code,
      address: newBranch.address || "Main Address",
      phone: newBranch.phone || "+880 1700-000000",
      latitude: Number(newBranch.latitude) || 23.8103,
      longitude: Number(newBranch.longitude) || 90.4125,
      geofenceRadius: newBranch.geoFenceRadius || 120,
      status: newBranch.status === OrgStatus.ACTIVE ? "Active" : "Inactive",
      totalEmployees: 0,
      employeesCount: 0,
      createdAt: newBranch.createdAt.toISOString().split("T")[0],
    };
  }

  static async updateBranch(id: string, organizationId: string, updates: Partial<BranchData>) {
    if (updates.latitude !== undefined && (updates.latitude < -90 || updates.latitude > 90)) {
      throw new ValidationError("Latitude must be between -90 and 90");
    }
    if (updates.longitude !== undefined && (updates.longitude < -180 || updates.longitude > 180)) {
      throw new ValidationError("Longitude must be between -180 and 180");
    }
    if (updates.geofenceRadius !== undefined && (updates.geofenceRadius < 20 || updates.geofenceRadius > 1000)) {
      throw new ValidationError("Geofence radius must be between 20 and 1000 meters");
    }

    const statusEnum = updates.status?.toUpperCase() === "INACTIVE" ? OrgStatus.SUSPENDED : OrgStatus.ACTIVE;

    const updated = await prisma.branches.update({
      where: { id },
      data: {
        name: updates.name,
        code: updates.code?.toUpperCase(),
        address: updates.address,
        phone: updates.phone,
        latitude: updates.latitude,
        longitude: updates.longitude,
        geoFenceRadius: updates.geofenceRadius,
        status: statusEnum,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      name: updated.name,
      code: updated.code,
      address: updated.address || "Main Address",
      phone: updated.phone || "+880 1700-000000",
      latitude: Number(updated.latitude) || 23.8103,
      longitude: Number(updated.longitude) || 90.4125,
      geofenceRadius: updated.geoFenceRadius || 120,
      status: updated.status === OrgStatus.ACTIVE ? "Active" : "Inactive",
      totalEmployees: updated._count.employees,
      employeesCount: updated._count.employees,
      createdAt: updated.createdAt.toISOString().split("T")[0],
    };
  }

  static async deleteBranch(id: string, organizationId: string) {
    const branch = await prisma.branches.findUnique({
      where: { id },
    });
    if (!branch) throw new NotFoundError("Branch");

    await prisma.branches.delete({
      where: { id },
    });

    return { success: true, deletedBranch: branch };
  }
}
