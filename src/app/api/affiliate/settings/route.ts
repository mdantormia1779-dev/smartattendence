import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { handleApiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await AffiliateService.getSettings();

    return NextResponse.json({
      success: true,
      data: settings,
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
