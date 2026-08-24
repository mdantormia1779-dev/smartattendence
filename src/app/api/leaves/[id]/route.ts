import { LeaveService } from "@/server/services/leave.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const leaves = await LeaveService.getLeaveRequests(orgId, {});
    const leave = leaves.find((l) => l.id === id);
    if (!leave) throw new NotFoundError("Leave Request");

    return apiSuccess(leave, "Leave request fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const leaves = await LeaveService.getLeaveRequests(orgId, {});
    const leave = leaves.find((l) => l.id === id);
    if (!leave) throw new NotFoundError("Leave Request");

    const body = await request.json();
    Object.assign(leave, body);

    return apiSuccess(leave, "Leave request updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
