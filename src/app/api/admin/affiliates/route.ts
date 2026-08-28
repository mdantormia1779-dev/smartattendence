import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const affiliates = await AffiliateService.adminGetAffiliates({ status, search });
    const settings = await AffiliateService.getSettings();

    return NextResponse.json({
      success: true,
      data: {
        affiliates,
        settings,
        metrics: {
          total: affiliates.length,
          pending: affiliates.filter((a) => a.status === "PENDING").length,
          approved: affiliates.filter((a) => a.status === "APPROVED").length,
          rejected: affiliates.filter((a) => a.status === "REJECTED").length,
          totalEarnedSum: affiliates.reduce((sum, a) => sum + a.totalEarned, 0),
          totalBalanceSum: affiliates.reduce((sum, a) => sum + a.balance, 0),
        },
      },
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
