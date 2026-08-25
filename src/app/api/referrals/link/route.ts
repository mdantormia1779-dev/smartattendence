import { requireAuth } from "@/server/authorization";
import { getReferralAccount } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId, {
      fullName: session.fullName,
      email: session.email,
      role: session.role,
      organizationId: session.organizationId,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const referralLink = `${baseUrl}/signup?ref=${account.referralCode}`;

    return apiSuccess(
      {
        referralCode: account.referralCode,
        referralLink,
        commissionRate: account.customCommissionRate || 20.0,
      },
      "Referral link retrieved successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
