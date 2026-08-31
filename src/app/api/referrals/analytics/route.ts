import { requireAuth } from "@/server/authorization";
import { getReferralAccountAsync } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = await getReferralAccountAsync(session.userId, {
      fullName: session.fullName,
      email: session.email,
      role: session.role,
      organizationId: session.organizationId,
    });

    const totalConversions = account.totalPaidCustomers || 0;
    const conversionRate = account.totalClicks > 0
      ? Number(((totalConversions / account.totalClicks) * 100).toFixed(1))
      : 0;

    return apiSuccess(
      {
        totalClicks: account.totalClicks,
        totalRegistrations: account.totalRegistrations,
        totalConversions,
        conversionRate,
        totalRevenue: account.totalRevenue,
        availableBalance: account.availableBalance,
        pendingBalance: account.pendingCommission,
        lifetimePaid: account.paidCommission || account.lifetimePaid,
      },
      "Referral analytics fetched successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}

