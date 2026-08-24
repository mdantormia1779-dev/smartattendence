import { PayrollService } from "@/server/services/payroll.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const batch = await PayrollService.getBatchById(id, orgId);
    return apiSuccess(batch, "Payroll batch fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
