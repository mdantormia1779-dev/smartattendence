import { requireAuth } from "@/server/authorization";
import { getReferralAccount } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId);

    return apiSuccess(account.commissions, "Commissions fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
