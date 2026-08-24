import { requireAuth } from "@/server/authorization";
import { getReferralAccount } from "@/lib/referral-engine";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId);

    const withdrawal = account.withdrawals.find((w) => w.id === id);
    if (!withdrawal) throw new NotFoundError("Withdrawal");

    return apiSuccess(withdrawal, "Withdrawal fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
