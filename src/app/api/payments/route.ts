import { NextResponse } from "next/server";
import { PaymentService } from "@/server/services/payment.service";
import { requireRole, requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.role === "SUPER_ADMIN" ? undefined : (session.organizationId || "org-1");

    const payments = await PaymentService.getPayments(orgId);
    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();
    const { paymentId, decision } = body;

    const updated = await PaymentService.updatePaymentStatus(paymentId, decision, session.fullName);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
