import { OvertimeService } from "@/server/services/overtime.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    let result;
    if (session.role === "MANAGER") {
      result = await OvertimeService.approveByManager(id, orgId, "REJECTED", body.comment || "Rejected by manager");
    } else {
      result = await OvertimeService.approveByOrgAdmin(id, orgId, "REJECTED", body.comment || "Rejected by admin");
    }

    return apiSuccess(result, "Overtime claim rejected");
  } catch (error: any) {
    return apiError(error);
  }
}
