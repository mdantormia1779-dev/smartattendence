import { requireAuth } from "@/server/authorization";
import { getReferralAccountAsync } from "@/lib/referral-engine";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const account = await getReferralAccountAsync(session.userId);

    const commission = (account.commissions || []).find((c) => c.id === id);
    if (!commission) throw new NotFoundError("Commission");


    return apiSuccess(commission, "Commission details fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
