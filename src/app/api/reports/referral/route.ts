import { requireAuth } from "@/server/authorization";
import { getAdminReferralOverview } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const overview = getAdminReferralOverview();

    return apiSuccess(overview, "Referral program report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
