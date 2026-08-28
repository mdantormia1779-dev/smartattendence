import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { handleApiError, ValidationError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.affiliateId || !body.amount || !body.accountDetails) {
      throw new ValidationError("Affiliate ID, payout amount, and payout account details are required.");
    }

    const numAmount = Number(body.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new ValidationError("Invalid payout amount specified.");
    }

    const result = await AffiliateService.requestPayout({
      affiliateId: body.affiliateId,
      amount: numAmount,
      payoutMethod: body.payoutMethod || "BKASH",
      accountDetails: body.accountDetails,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Withdrawal request of ${numAmount} BDT submitted successfully. Our finance team will process the payout shortly.`,
    }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
