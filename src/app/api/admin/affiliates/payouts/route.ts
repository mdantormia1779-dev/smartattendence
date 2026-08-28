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

    const payouts = await AffiliateService.adminGetPayouts({ status });

    return NextResponse.json({
      success: true,
      data: {
        payouts,
        metrics: {
          total: payouts.length,
          requested: payouts.filter((p) => p.status === "REQUESTED").length,
          completed: payouts.filter((p) => p.status === "COMPLETED").length,
          rejected: payouts.filter((p) => p.status === "REJECTED").length,
          totalAmountDistributed: payouts
            .filter((p) => p.status === "COMPLETED")
            .reduce((sum, p) => sum + p.amount, 0),
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
