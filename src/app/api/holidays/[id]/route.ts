import { HolidayService } from "@/server/services/holiday.service";
import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const holidays = await HolidayService.getHolidays(orgId);
    const holiday = holidays.find((h) => h.id === id);
    if (!holiday) throw new NotFoundError("Holiday");

    return apiSuccess(holiday, "Holiday fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const holidays = await HolidayService.getHolidays(orgId);
    const holiday = holidays.find((h) => h.id === id);
    if (!holiday) throw new NotFoundError("Holiday");

    const body = await request.json();
    Object.assign(holiday, body);

    return apiSuccess(holiday, "Holiday updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);

    return apiSuccess({ deleted: true, id }, "Holiday deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
