import { ShiftService } from "@/server/services/shift.service";
import { requireAuth, requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const shift = await ShiftService.getShiftById(id, orgId);
    return apiSuccess(shift, "Shift fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const body = await request.json();
    const updated = await ShiftService.updateShift(id, orgId, body);
    return apiSuccess(updated, "Shift updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const body = await request.json();
    const updated = await ShiftService.updateShift(id, orgId, body);
    return apiSuccess(updated, "Shift updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const result = await ShiftService.deleteShift(id, orgId);
    return apiSuccess(result, "Shift removed successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
