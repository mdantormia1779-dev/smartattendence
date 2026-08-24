import { PayrollService } from "@/server/services/payroll.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const batch = await PayrollService.getBatchById(id, orgId);
    batch.status = "APPROVED";
    batch.payslips.forEach((p) => (p.status = "APPROVED"));

    return apiSuccess(batch, "Payroll batch approved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
