import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const logs = await AttendanceService.getAttendanceLogs(orgId, {});
    const summary = {
      totalRecords: logs.length,
      present: logs.filter((l) => l.status === "PRESENT").length,
      late: logs.filter((l) => l.status === "LATE").length,
      absent: logs.filter((l) => l.status === "ABSENT").length,
      records: logs,
    };

    return apiSuccess(summary, "Attendance report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
