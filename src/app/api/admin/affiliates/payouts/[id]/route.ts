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
    const decision = (body.decision || "").toUpperCase();

    if (decision !== "COMPLETED" && decision !== "REJECTED") {
      throw new ValidationError("Decision must be either 'COMPLETED' or 'REJECTED'.");
    }

    const result = await AffiliateService.adminProcessPayout(
      id,
      decision as "COMPLETED" | "REJECTED",
      body.transactionId,
      body.rejectionReason
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Payout request has been marked as ${decision}.`,
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
