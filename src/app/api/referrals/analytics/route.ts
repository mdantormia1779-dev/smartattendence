import { requireAuth } from "@/server/authorization";
import { getReferralAccount } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId);

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
        pendingBalance: account.pendingBalance,
        lifetimePaid: account.lifetimePaid,
      },
      "Referral analytics fetched successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
