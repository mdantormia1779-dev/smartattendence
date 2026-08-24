import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const logs = await AttendanceService.getAttendanceLogs(orgId, {});
    return apiSuccess(logs, "Monthly attendance logs fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
