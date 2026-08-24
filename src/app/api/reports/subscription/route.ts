import { OrganizationService } from "@/server/services/organization.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const orgs = await OrganizationService.getAllOrganizations();

    const planBreakdown = {
      FREE: orgs.filter((o) => o.planTier === "FREE").length,
      STARTER: orgs.filter((o) => o.planTier === "STARTER").length,
      BUSINESS: orgs.filter((o) => o.planTier === "BUSINESS").length,
      ENTERPRISE: orgs.filter((o) => o.planTier === "ENTERPRISE").length,
    };

    return apiSuccess({ totalSubscriptions: orgs.length, planBreakdown, organizations: orgs }, "Subscription report fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
