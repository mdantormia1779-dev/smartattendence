import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { id, employeeId } = await params;
    requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);

    return apiSuccess(
      { shiftId: id, employeeId, unassigned: true },
      "Employee unassigned from shift successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
