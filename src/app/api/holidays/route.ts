import { NextResponse } from "next/server";
import { HolidayService } from "@/server/services/holiday.service";
import { requireAuth, requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const holidays = await HolidayService.getHolidays(orgId);
    return NextResponse.json({ success: true, data: holidays });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const newHoliday = await HolidayService.createHoliday({
      organizationId: orgId,
      ...body,
    });

    return NextResponse.json({ success: true, data: newHoliday }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
