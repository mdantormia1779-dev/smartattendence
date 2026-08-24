import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

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

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const list = managersStore.filter((m) => m.organizationId === orgId);
    return apiSuccess(list, "Managers fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const newManager = {
      id: `mgr-${Date.now()}`,
      organizationId: orgId,
      managerId: body.managerId || `EMP-MGR${Math.floor(10 + Math.random() * 90)}`,
      name: body.name,
      email: body.email,
      designation: body.designation || "Manager",
      departmentName: body.departmentName || "General",
      assignedBranches: body.assignedBranches || ["Head Office – Dhaka"],
      teamCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    managersStore.push(newManager);
    return apiSuccess(newManager, "Manager assigned successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
