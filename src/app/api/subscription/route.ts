import { requireAuth } from "@/server/authorization";
import { OrganizationService } from "@/server/services/organization.service";
import { SubscriptionService } from "@/server/services/subscription.service";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const [org, planInfo] = await Promise.all([
      OrganizationService.getOrganizationById(orgId).catch(() => null),
      SubscriptionService.getOrganizationPlan(orgId),
    ]);

    const isEnterprise =
      planInfo.plan.type === "ENTERPRISE" ||
      (planInfo.plan as any).tier === "ENTERPRISE" ||
      planInfo.plan.name?.toUpperCase().includes("ENTERPRISE");

    const subscriptionInfo = {
      organizationId: org?.id || orgId,
      organizationName: org?.name || "Organization",
      planId: planInfo.plan.id,
      planName: planInfo.plan.name,
      planTier: planInfo.plan.type,
      status: planInfo.status,
      isTrial: planInfo.isTrial,
      daysRemaining: planInfo.daysRemaining,
      trialDaysRemaining: planInfo.trialDaysRemaining ?? planInfo.daysRemaining,
      isExpired: planInfo.isExpired,
      billingCycle: planInfo.plan.billingCycle,
      startDate: planInfo.startDate,
      endDate: planInfo.endDate,
      amount: planInfo.plan.price,
      limits: {
        maxBranches: isEnterprise ? null : planInfo.limits.maxBranches,
        maxManagers: isEnterprise ? null : planInfo.limits.maxManagers,
        maxEmployees: isEnterprise ? null : planInfo.limits.maxEmployees,
        usedBranches: planInfo.usage.branches,
        usedManagers: planInfo.usage.managers,
        usedEmployees: planInfo.usage.employees,
      },
      features: {
        faceRecognition: planInfo.limits.faceRecognition,
        gpsVerification: planInfo.limits.gpsVerification,
        fingerprint: planInfo.limits.fingerprint,
        payroll: planInfo.limits.payroll,
        analytics: planInfo.limits.analytics,
        apiAccess: planInfo.limits.apiAccess,
        whiteLabel: planInfo.limits.whiteLabel,
        customDomain: planInfo.limits.customDomain,
        prioritySupport: planInfo.limits.prioritySupport,
      },
    };

    return apiSuccess(subscriptionInfo, "Subscription details fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
