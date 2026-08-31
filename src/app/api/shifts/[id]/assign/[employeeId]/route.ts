import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";
import { ShiftService } from "@/server/services/shift.service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { id, employeeId } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const res = await ShiftService.unassignEmployeeFromShift(id, employeeId, orgId);

    return apiSuccess(
      res,
      "Employee unassigned from shift successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
