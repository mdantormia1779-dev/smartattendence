import { requireAuth } from "@/server/authorization";
import { getReferralAccount, requestReferralWithdrawal } from "@/lib/referral-engine";
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

    return apiSuccess(account.withdrawals, "Withdrawals fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();

    const account = getReferralAccount(session.userId, {
      fullName: session.fullName,
      email: session.email,
      role: session.role,
      organizationId: session.organizationId,
    });

    const referralAccountId = body.referralAccountId || account.id;
    const amount = Number(body.amount);
    const paymentMethod = body.paymentMethod || body.payoutMethod || "bKash";
    const paymentDetails = body.paymentDetails || body.payoutDetails || "";

    if (!amount || isNaN(amount) || amount < 50) {
      throw new Error("Minimum withdrawal amount is $50.00");
    }
    if (!paymentDetails.trim()) {
      throw new Error("Payment details are required");
    }

    const result = requestReferralWithdrawal({
      referralAccountId,
      amount,
      paymentMethod,
      paymentDetails,
    });

    if (!result.success) {
      return apiError(new Error(result.error || "Failed to process withdrawal request"));
    }

    return apiSuccess(result.withdrawal, "Withdrawal request submitted successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
