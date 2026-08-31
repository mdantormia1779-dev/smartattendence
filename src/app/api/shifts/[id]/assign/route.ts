import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";
import { ShiftService } from "@/server/services/shift.service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const employees = await ShiftService.getShiftEmployees(id, orgId);
    return apiSuccess(employees, "Shift employees fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const body = await request.json();
    let employeeIds: string[] = [];
    if (Array.isArray(body.employeeIds)) {
      employeeIds = body.employeeIds;
    } else if (body.employeeId) {
      employeeIds = [body.employeeId];
    }

    const result = await ShiftService.assignEmployeesToShift(id, employeeIds, orgId);

    return apiSuccess(
      result,
      "Shift assigned successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
