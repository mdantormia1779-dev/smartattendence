import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { handleApiError, ValidationError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("email") || searchParams.get("id") || searchParams.get("code");

    if (!identifier) {
      // Fallback: Check authorization header or query
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        if (token.includes("@")) {
          const data = await AffiliateService.getAffiliatePortalData(token);
          return NextResponse.json({ success: true, data });
        }
      }
      throw new ValidationError("Affiliate email or referral code identifier is required.");
    }

    const data = await AffiliateService.getAffiliatePortalData(identifier);

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
