import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const logs = await AttendanceService.getAttendanceLogs(orgId, { employeeId: id });
    return apiSuccess(logs, "Employee attendance history fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
