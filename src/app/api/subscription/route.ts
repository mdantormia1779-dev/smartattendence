import { requireAuth } from "@/server/authorization";
import { OrganizationService } from "@/server/services/organization.service";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const org = await OrganizationService.getOrganizationById(orgId);
    const subscriptionInfo = {
      organizationId: org.id,
      organizationName: org.name,
      planId: org.planId,
      planName: org.planName,
      planTier: org.planTier,
      status: org.subscriptionStatus,
      isTrial: org.subscriptionStatus === "TRIAL",
      trialDaysRemaining: 12,
      billingCycle: "Monthly",
      nextBillingDate: "2026-09-01",
      amount: org.planTier === "BUSINESS" ? 149.0 : 39.0,
      limits: {
        maxBranches: org.planTier === "BUSINESS" ? 10 : 2,
        maxEmployees: org.planTier === "BUSINESS" ? 300 : 50,
        usedBranches: org.totalBranches,
        usedEmployees: org.totalEmployees,
      },
    };

    return apiSuccess(subscriptionInfo, "Subscription details fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
