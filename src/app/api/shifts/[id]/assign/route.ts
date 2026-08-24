import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);

    const body = await request.json();
    const employeeIds = body.employeeIds || [body.employeeId];

    return apiSuccess(
      { shiftId: id, assignedEmployees: employeeIds, count: employeeIds.length },
      "Shift assigned successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
