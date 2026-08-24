import { NextResponse } from "next/server";
import { AttendanceService } from "@/server/services/attendance.service";
import { RegularizeAttendanceSchema } from "@/server/validators";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = RegularizeAttendanceSchema.parse(body);

    const updated = await AttendanceService.regularize({
      organizationId: orgId,
      attendanceId: validated.attendanceId,
      checkInTime: validated.checkInTime,
      checkOutTime: validated.checkOutTime,
      status: validated.status,
      reason: validated.reason,
      regularizedBy: session.fullName,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
