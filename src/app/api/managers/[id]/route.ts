import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";
import { ManagerService } from "@/server/services/manager.service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const mgr = await ManagerService.getManagerById(id, orgId);
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

    const body = await request.json();
    const updated = await ManagerService.updateManager(id, orgId, body);

    return apiSuccess(updated, "Manager updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const res = await ManagerService.deleteManager(id, orgId);
    return apiSuccess(res, "Manager removed successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
