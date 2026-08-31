import { NextResponse } from "next/server";
import { requestWithdrawalAsync, getReferralAccountAsync } from "@/lib/referral-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referralAccountId = searchParams.get("referralAccountId") || "user-session";
    const account = await getReferralAccountAsync(referralAccountId);
    return NextResponse.json({ success: true, withdrawals: account.withdrawals || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referralAccountId, amount, paymentMethod, paymentDetails } = body;

    if (!referralAccountId || !amount || !paymentMethod || !paymentDetails) {
      return NextResponse.json(
        { success: false, error: "Missing required withdrawal fields (amount, paymentMethod, paymentDetails)" },
        { status: 400 }
      );
    }

    const result = await requestWithdrawalAsync({
      referralAccountId,
      amount: Number(amount),
      paymentMethod,
      paymentDetails,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Failed to process withdrawal" }, { status: 400 });
    }


    return NextResponse.json({ success: true, withdrawal: result.withdrawal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

