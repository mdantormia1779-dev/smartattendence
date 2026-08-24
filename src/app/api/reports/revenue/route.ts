import { PaymentService } from "@/server/services/payment.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const payments = await PaymentService.getPayments();

    const totalRevenue = payments.filter((p) => p.status === "APPROVED").reduce((s, p) => s + p.amount, 0);
    const summary = {
      totalRevenue,
      mrr: totalRevenue,
      arr: totalRevenue * 12,
      paymentsCount: payments.length,
      payments,
    };

    return apiSuccess(summary, "Platform revenue report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
