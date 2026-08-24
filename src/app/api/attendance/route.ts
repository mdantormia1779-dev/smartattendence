import { NextResponse } from "next/server";
import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const employeeId = searchParams.get("employeeId") || undefined;

    const logs = await AttendanceService.getAttendanceLogs(orgId, {
      date,
      employeeId,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
