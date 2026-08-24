import { PayrollService } from "@/server/services/payroll.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const batches = await PayrollService.getBatches(orgId);
    const totalDisbursed = batches.filter((b) => b.status === "PAID").reduce((s, b) => s + b.totalNetPayable, 0);

    const summary = {
      totalBatches: batches.length,
      totalDisbursed,
      batches,
    };

    return apiSuccess(summary, "Payroll disbursement report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
