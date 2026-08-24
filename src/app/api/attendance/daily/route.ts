import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const logs = await AttendanceService.getAttendanceLogs(orgId, { date });
    return apiSuccess(logs, `Daily attendance report for ${date}`);
  } catch (error: any) {
    return apiError(error);
  }
}
