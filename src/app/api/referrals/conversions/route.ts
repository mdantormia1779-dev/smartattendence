import { requireAuth } from "@/server/authorization";
import { getReferralAccount } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId);

    const conversions = account.commissions.map((c) => ({
      id: c.id,
      organizationName: c.organizationName,
      planName: c.planName,
      paymentAmount: c.baseAmount,
      commissionAmount: c.commissionAmount,
      status: c.status,
      date: c.createdAt,
    }));

    return apiSuccess(conversions, "Referral conversions fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
