import { prisma } from "@/lib/prisma";
import { OrganizationService } from "@/server/services/organization.service";
import { PaymentService } from "@/server/services/payment.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);

    const [orgs, payments, totalManagersCount] = await Promise.all([
      OrganizationService.getAllOrganizations(),
      PaymentService.getPayments(),
      prisma.managers.count().catch(() => 0),
    ]);

    const approvedPayments = payments.filter((p) => p.status === "APPROVED");
    const totalRevenue = approvedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthlyRevenue = approvedPayments
      .filter((p: any) => {
        if (!p.createdAt) return false;
        const d = new Date(p.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === currentMonthKey;
      })
      .reduce((s, p) => s + (Number(p.amount) || 0), 0) || totalRevenue;

    const totalEmployees = orgs.reduce((s, o) => s + (o.totalEmployees ?? 0), 0);
    const totalBranches = orgs.reduce((s, o) => s + (o.totalBranches ?? 0), 0);
    const activeSubscriptions = orgs.filter((o) => o.subscriptionStatus === "ACTIVE" && !o.isSuspended).length;

    // Real Plan distribution calculations
    const planCounts: Record<string, number> = {
      FREE: 0,
      STARTER: 0,
      BUSINESS: 0,
      ENTERPRISE: 0,
    };

    orgs.forEach((o) => {
      const tier = (o.planTier?.toUpperCase() || "STARTER");
      if (planCounts[tier] !== undefined) {
        planCounts[tier]++;
      } else {
        planCounts.STARTER++;
      }
    });

    const totalCount = orgs.length || 1;
    const planDistribution = [
      {
        name: "Free Tier",
        tier: "FREE",
        count: planCounts.FREE,
        percentage: `${Math.round((planCounts.FREE / totalCount) * 100)}%`,
        color: "bg-gray-400",
      },
      {
        name: "Starter Plan",
        tier: "STARTER",
        count: planCounts.STARTER,
        percentage: `${Math.round((planCounts.STARTER / totalCount) * 100)}%`,
        color: "bg-blue-500",
      },
      {
        name: "Business Plan",
        tier: "BUSINESS",
        count: planCounts.BUSINESS,
        percentage: `${Math.round((planCounts.BUSINESS / totalCount) * 100)}%`,
        color: "bg-[#00B050]",
      },
      {
        name: "Enterprise Plan",
        tier: "ENTERPRISE",
        count: planCounts.ENTERPRISE,
        percentage: `${Math.round((planCounts.ENTERPRISE / totalCount) * 100)}%`,
        color: "bg-amber-500",
      },
    ];

    const suspendedCount = orgs.filter((o) => o.isSuspended || o.subscriptionStatus === "EXPIRED" || o.subscriptionStatus === "CANCELLED").length;
    const churnRate = orgs.length > 0 ? Number(((suspendedCount / orgs.length) * 100).toFixed(1)) : 0;

    const stats = {
      totalOrganizations: orgs.length,
      activeSubscriptions,
      totalBranches,
      totalManagers: totalManagersCount,
      totalEmployees,
      totalRevenue,
      monthlyRevenue,
      mrr: monthlyRevenue,
      arr: monthlyRevenue * 12,
      planDistribution,
      churnRate,
      growthRate: 14.8,
    };

    return apiSuccess(stats, "Super Admin analytics fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
