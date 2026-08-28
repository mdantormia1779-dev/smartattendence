import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { requireRole } from "@/server/authorization";
import { handleApiError, ValidationError } from "@/server/errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const { id } = await params;

    const body = await request.json();
    const reason = body.reason || "NID and verification requirements could not be validated.";

    const result = await AffiliateService.adminRejectAffiliate(id, reason);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Affiliate application for ${result.fullName} has been rejected.`,
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
