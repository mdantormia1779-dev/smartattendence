import { requireAuth } from "@/server/authorization";
import { getReferralAccount } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId);

    return apiSuccess(
      {
        walletId: `wal-${account.id}`,
        userId: session.userId,
        currency: "USD",
        availableBalance: account.availableBalance,
        pendingBalance: account.pendingBalance,
        lifetimeEarnings: account.totalRevenue,
        lifetimePaid: account.lifetimePaid,
      },
      "Wallet details fetched successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
