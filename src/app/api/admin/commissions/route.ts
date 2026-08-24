import { requireRole } from "@/server/authorization";
import { getAdminReferralOverview } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const overview = getAdminReferralOverview();

    return apiSuccess(overview.recentCommissions, "Admin commissions list fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
