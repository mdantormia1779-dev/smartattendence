import { OrganizationService } from "@/server/services/organization.service";
import { PaymentService } from "@/server/services/payment.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const orgs = await OrganizationService.getAllOrganizations();
    const payments = await PaymentService.getPayments();

    const totalRevenue = payments.filter((p) => p.status === "APPROVED").reduce((s, p) => s + p.amount, 0);
    const totalEmployees = orgs.reduce((s, o) => s + o.totalEmployees, 0);
    const totalBranches = orgs.reduce((s, o) => s + o.totalBranches, 0);

    const stats = {
      totalOrganizations: orgs.length,
      activeSubscriptions: orgs.filter((o) => o.subscriptionStatus === "ACTIVE").length,
      totalBranches,
      totalEmployees,
      totalRevenue,
      mrr: 1890.0,
      arr: 22680.0,
      growthRate: 14.8,
      churnRate: 0.6,
    };

    return apiSuccess(stats, "Super Admin analytics fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
