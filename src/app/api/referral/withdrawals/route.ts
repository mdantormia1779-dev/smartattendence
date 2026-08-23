import { NextResponse } from "next/server";
import { requestWithdrawal, getWithdrawals } from "@/lib/referral-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referralAccountId = searchParams.get("referralAccountId") || undefined;
    const list = getWithdrawals(referralAccountId);
    return NextResponse.json({ success: true, withdrawals: list });
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

    const result = requestWithdrawal({
      referralAccountId,
      amount: Number(amount),
      paymentMethod,
      paymentDetails,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, withdrawal: result.withdrawal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
