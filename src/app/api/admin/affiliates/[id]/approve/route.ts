import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const { id } = await params;

    let customCode: string | undefined;
    try {
      const body = await request.json();
      customCode = body.referralCode;
    } catch {}

    const result = await AffiliateService.adminApproveAffiliate(id, customCode);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Affiliate ${result.fullName} approved successfully. Referral link: ${result.referralLink}`,
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(request, props);
}
