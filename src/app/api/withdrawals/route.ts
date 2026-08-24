import { requireAuth } from "@/server/authorization";
import { getReferralAccount, requestReferralWithdrawal } from "@/lib/referral-engine";
import { RequestWithdrawalSchema } from "@/server/validators";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId);

    return apiSuccess(account.withdrawals, "Withdrawals fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();
    const validated = RequestWithdrawalSchema.parse(body);

    const result = requestReferralWithdrawal({
      referralAccountId: validated.referralAccountId,
      amount: validated.amount,
      paymentMethod: validated.paymentMethod,
      paymentDetails: validated.paymentDetails,
    });

    if (!result.success) {
      return apiError(new Error(result.error || "Failed to process withdrawal request"));
    }

    return apiSuccess(result.withdrawal, "Withdrawal request submitted successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
