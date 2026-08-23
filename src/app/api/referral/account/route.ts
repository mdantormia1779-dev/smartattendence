import { NextResponse } from "next/server";
import { getOrCreateReferralAccount, getCommissions, getWithdrawals } from "@/lib/referral-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-emp-1";
    const userName = searchParams.get("name") || "Arif Chowdhury";
    const userEmail = searchParams.get("email") || "arif.c@vertextech.io";
    const role = searchParams.get("role") || "EMPLOYEE";
    const organizationId = searchParams.get("organizationId") || "org-1";

    const account = getOrCreateReferralAccount({
      id: userId,
      name: userName,
      email: userEmail,
      role,
      organizationId,
    });

    const commissions = getCommissions(account.id);
    const withdrawals = getWithdrawals(account.id);

    return NextResponse.json({
      success: true,
      account,
      commissions,
      withdrawals,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
