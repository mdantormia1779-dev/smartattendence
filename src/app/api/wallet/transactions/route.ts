import { requireAuth } from "@/server/authorization";
import { getReferralAccountAsync } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = await getReferralAccountAsync(session.userId);

    const txs = (account.withdrawals || []).map((w) => ({
      id: `tx-${w.id}`,
      type: "WITHDRAWAL",
      amount: w.amount,
      paymentMethod: w.paymentMethod,
      status: w.status,
      date: w.requestedAt,
    }));

    return apiSuccess(txs, "Wallet transactions fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

