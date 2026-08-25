import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";
import { ManagerService } from "@/server/services/manager.service";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const list = await ManagerService.getManagers(orgId);
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
    const newManager = await ManagerService.createManager({
      organizationId: orgId,
      ...body,
    });

    return apiSuccess(newManager, "Manager assigned successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
