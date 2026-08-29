import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const { id } = await params;

    const result = await AffiliateService.adminDeleteAffiliate(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Affiliate partner "${result.fullName}" has been successfully deleted.`,
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
