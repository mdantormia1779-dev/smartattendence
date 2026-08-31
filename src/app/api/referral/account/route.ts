import { NextResponse } from "next/server";
import { getOrCreateReferralAccountAsync } from "@/lib/referral-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-emp-1";
    const userName = searchParams.get("name") || "Affiliate Partner";
    const userEmail = searchParams.get("email") || `${userId}@erp.com`;
    const role = searchParams.get("role") || "EMPLOYEE";
    const organizationId = searchParams.get("organizationId") || undefined;

    const account = await getOrCreateReferralAccountAsync({
      id: userId,
      name: userName,
      email: userEmail,
      role,
      organizationId,
    });

    return NextResponse.json({
      success: true,
      account,
      commissions: account.commissions || [],
      withdrawals: account.withdrawals || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

