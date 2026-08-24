import { NextResponse } from "next/server";
import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";
    const employeeId = session.employeeId || "EMP-1042";

    const record = await AttendanceService.getTodayStatus(orgId, employeeId);
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
