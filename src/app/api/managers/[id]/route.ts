import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

let managersStore: any[] = [
  {
    id: "mgr-1",
    organizationId: "org-1",
    managerId: "EMP-MGR01",
    name: "Tanvir Ahmed",
    email: "tanvir.mgr@vertextech.io",
    designation: "Engineering Lead",
    departmentName: "Information Technology",
    assignedBranches: ["Head Office – Dhaka", "Chittagong Tech Hub"],
    teamCount: 14,
    createdAt: "2026-01-15",
  },
  {
    id: "mgr-2",
    organizationId: "org-1",
    managerId: "EMP-MGR02",
    name: "Ariful Islam",
    email: "ariful.mgr@vertextech.io",
    designation: "Head of Accounts",
    departmentName: "Accounts & Finance",
    assignedBranches: ["Head Office – Dhaka"],
    teamCount: 8,
    createdAt: "2026-01-15",
  },
];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const mgr = managersStore.find((m) => (m.id === id || m.managerId === id) && m.organizationId === orgId);
    if (!mgr) throw new NotFoundError("Manager");

    return apiSuccess(mgr, "Manager details fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const mgr = managersStore.find((m) => (m.id === id || m.managerId === id) && m.organizationId === orgId);
    if (!mgr) throw new NotFoundError("Manager");

    const body = await request.json();
    Object.assign(mgr, body);

    return apiSuccess(mgr, "Manager updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const mgr = managersStore.find((m) => (m.id === id || m.managerId === id) && m.organizationId === orgId);
    if (!mgr) throw new NotFoundError("Manager");

    managersStore = managersStore.filter((m) => m.id !== id && m.managerId !== id);
    return apiSuccess({ deleted: true, id }, "Manager removed successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
