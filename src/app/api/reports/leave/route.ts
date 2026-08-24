import { LeaveService } from "@/server/services/leave.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const leaves = await LeaveService.getLeaveRequests(orgId, {});
    const summary = {
      totalRequests: leaves.length,
      approved: leaves.filter((l) => l.orgApproval === "APPROVED").length,
      pending: leaves.filter((l) => l.orgApproval === "PENDING_ORG_ADMIN" || l.managerApproval === "PENDING_MANAGER").length,
      rejected: leaves.filter((l) => l.orgApproval === "REJECTED").length,
      leaves,
    };

    return apiSuccess(summary, "Leave utilization report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
