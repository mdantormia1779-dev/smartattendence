import { LeaveService } from "@/server/services/leave.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = session.role === "SUPER_ADMIN" ? "all" : (session.organizationId || "");

    const body = await request.json();
    let result;
    if (session.role === "MANAGER") {
      result = await LeaveService.approveByManager(id, orgId, "REJECTED", body.comment || body.reason || "Rejected by manager");
    } else {
      result = await LeaveService.approveByOrgAdmin(id, orgId, "REJECTED", body.comment || body.reason || "Rejected by admin");
    }

    return apiSuccess(result, "Leave request rejected");
  } catch (error: any) {
    return apiError(error);
  }
}
