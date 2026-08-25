import { HolidayService } from "@/server/services/holiday.service";
import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const holiday = await HolidayService.getHolidayById(id, orgId);
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

    const body = await request.json();
    const updated = await HolidayService.updateHoliday(id, orgId, body);

    return apiSuccess(updated, "Holiday updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const res = await HolidayService.deleteHoliday(id, orgId);
    return apiSuccess(res, "Holiday deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
