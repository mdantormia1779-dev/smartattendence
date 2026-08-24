import { NextResponse } from "next/server";
import { AttendanceService } from "@/server/services/attendance.service";
import { CheckOutSchema } from "@/server/validators";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = CheckOutSchema.parse(body);

    const record = await AttendanceService.checkOut({
      organizationId: orgId,
      employeeId: validated.employeeId || session.employeeId || "EMP-1042",
      latitude: validated.latitude,
      longitude: validated.longitude,
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
