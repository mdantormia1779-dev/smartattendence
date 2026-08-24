import { PaymentService } from "@/server/services/payment.service";
import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.role === "SUPER_ADMIN" ? undefined : (session.organizationId || undefined);

    const payments = await PaymentService.getPayments(orgId);
    const payment = payments.find((p) => p.id === id);
    if (!payment) throw new NotFoundError("Payment Record");

    return apiSuccess(payment, "Payment record fetched successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();
    const status = (body.status || "APPROVED").toUpperCase() as "APPROVED" | "REJECTED" | "REFUNDED";

    const updated = await PaymentService.updatePaymentStatus(id, status, session.fullName);
    return apiSuccess(updated, `Payment status updated to ${status} successfully`, undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
