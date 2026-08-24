import { LeaveService } from "@/server/services/leave.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const leaves = await LeaveService.getLeaveRequests(orgId, {});
    const leave = leaves.find((l) => l.id === id);
    if (!leave) throw new NotFoundError("Leave Request");

    leave.managerApproval = "REJECTED";
    leave.orgApproval = "REJECTED";
    leave.orgComment = "Cancelled by user";

    return apiSuccess(leave, "Leave request cancelled successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
