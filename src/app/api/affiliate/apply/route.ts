import { NextResponse } from "next/server";
import { AffiliateService } from "@/server/services/affiliate.service";
import { handleApiError, ValidationError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.email || !body.phone || !body.paymentDetails) {
      throw new ValidationError("Please fill in all required fields: Full Name, Email, Phone, and Payout Account Details.");
    }

    const application = await AffiliateService.apply({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      nidNumber: body.nidNumber,
      nidDocumentUrl: body.nidDocumentUrl,
      paymentMethod: body.paymentMethod || "BKASH",
      paymentDetails: body.paymentDetails,
      userId: body.userId,
    });

    return NextResponse.json({
      success: true,
      data: application,
      message: "Your affiliate application has been submitted successfully and is under review.",
    }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
