import { requireRole } from "@/server/authorization";
import { OrganizationService } from "@/server/services/organization.service";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const updated = await OrganizationService.updateSettings(orgId, {
      subscriptionStatus: "EXPIRED",
    });

    return apiSuccess(updated, "Subscription cancelled successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
