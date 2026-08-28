import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
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

export async function PUT(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();

    const updated = await AffiliateService.updateSettings({
      oneTimeBonus: body.oneTimeBonus !== undefined ? Number(body.oneTimeBonus) : undefined,
      recurringPercentage: body.recurringPercentage !== undefined ? Number(body.recurringPercentage) : undefined,
      minimumPayoutThreshold: body.minimumPayoutThreshold !== undefined ? Number(body.minimumPayoutThreshold) : undefined,
      cookieDays: body.cookieDays !== undefined ? Number(body.cookieDays) : undefined,
      autoApprovePayouts: body.autoApprovePayouts !== undefined ? Boolean(body.autoApprovePayouts) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Affiliate program commission rates & settings updated successfully.",
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
