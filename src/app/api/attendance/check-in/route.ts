import { NextResponse } from "next/server";
import { AttendanceService } from "@/server/services/attendance.service";
import { CheckInSchema } from "@/server/validators";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = CheckInSchema.parse(body);

    const record = await AttendanceService.checkIn({
      organizationId: orgId,
      employeeId: validated.employeeId || session.employeeId || "EMP-1042",
      latitude: validated.latitude,
      longitude: validated.longitude,
      verificationMethod: validated.verificationMethod,
      faceVector: validated.faceVector,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
