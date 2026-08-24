import { PaymentService } from "@/server/services/payment.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.role === "SUPER_ADMIN" ? undefined : (session.organizationId || "org-1");

    const payments = await PaymentService.getPayments(orgId);
    const payment = payments.find((p) => p.id === id);
    if (!payment) throw new NotFoundError("Payment Record");

    return apiSuccess(payment, "Payment record fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
