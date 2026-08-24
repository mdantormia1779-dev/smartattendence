import { LeaveService } from "@/server/services/leave.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const leaves = await LeaveService.getLeaveRequests(orgId, { employeeId: id });
    const quotas = await LeaveService.getEmployeeQuotas(orgId, id);

    return apiSuccess({ requests: leaves, quotas }, "Employee leave balance & requests fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
