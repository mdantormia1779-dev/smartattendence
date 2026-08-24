import { requireAuth } from "@/server/authorization";
import { getAdminReferralOverview } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const overview = getAdminReferralOverview();

    return apiSuccess(
      {
        totalCommissionsCount: overview.recentCommissions.length,
        totalCommissionsAmount: overview.recentCommissions.reduce((s, c) => s + c.commissionAmount, 0),
        commissions: overview.recentCommissions,
      },
      "Commission ledger report generated successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
