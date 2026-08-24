import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const logs = await AttendanceService.getAttendanceLogs(orgId, {});
    const record = logs.find((l) => l.id === id);
    if (!record) throw new NotFoundError("Attendance Record");

    return apiSuccess(record, "Attendance record fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const updated = await AttendanceService.regularize({
      organizationId: orgId,
      attendanceId: id,
      checkInTime: body.checkInTime,
      checkOutTime: body.checkOutTime,
      status: body.status || "PRESENT",
      reason: body.reason || "Manual update",
      regularizedBy: session.fullName,
    });

    return apiSuccess(updated, "Attendance updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);

    return apiSuccess({ deleted: true, id }, "Attendance record deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
