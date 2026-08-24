import { NextResponse } from "next/server";
import { PaymentService } from "@/server/services/payment.service";
import { handleApiError, ValidationError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-webhook-signature");
    const body = await request.json();

    const { event, data } = body;

    // Idempotent webhook event processor
    if (event === "payment.succeeded" && data) {
      await PaymentService.createPayment({
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        planName: data.planName,
        amount: data.amount,
        billingCycle: data.billingCycle || "Monthly",
        transactionId: data.transactionId,
        senderNumber: data.senderNumber,
        referralCode: data.referralCode,
      });

      // Auto-approve verified gateway payments
      const payments = await PaymentService.getPayments();
      const created = payments.find((p) => p.transactionId === data.transactionId);
      if (created) {
        await PaymentService.updatePaymentStatus(created.id, "APPROVED", "Gateway Webhook Auto-Verification");
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
