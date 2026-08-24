import { requireRole } from "@/server/authorization";
import { OrganizationService } from "@/server/services/organization.service";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const updated = await OrganizationService.updateSettings(orgId, {
      planTier: body.planTier || "ENTERPRISE",
      planName: `${body.planTier || "ENTERPRISE"} Plan`,
    });

    return apiSuccess(updated, `Successfully upgraded subscription to ${body.planTier || "ENTERPRISE"}`);
  } catch (error: any) {
    return apiError(error);
  }
}
