import { PayrollService } from "@/server/services/payroll.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const finalized = await PayrollService.lockBatch(id, orgId, session.fullName);
    return apiSuccess(finalized, "Payroll batch locked and finalized successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
