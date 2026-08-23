import { NextResponse } from "next/server";
import { recordReferralClick } from "@/lib/referral-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, landingPage } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Referral code is required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = recordReferralClick(code, { ip, userAgent, landingPage });

    if (!result) {
      return NextResponse.json({ success: false, error: "Invalid referral code" }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, tracking: result });

    // Set 30-day referral attribution cookie
    response.cookies.set("ref_code", code, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
