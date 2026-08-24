import { OrganizationService } from "@/server/services/organization.service";
import { UpdateOrgSettingsSchema } from "@/server/validators";
import { requireAuth, requireTenantScope, requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    requireTenantScope(session, id);

    const org = await OrganizationService.getOrganizationById(id);
    return apiSuccess(org, "Organization retrieved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    requireTenantScope(session, id);

    const body = await request.json();
    const validated = UpdateOrgSettingsSchema.parse(body);

    const updated = await OrganizationService.updateSettings(id, validated);
    return apiSuccess(updated, "Organization updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    const deleted = await OrganizationService.deleteOrganization(id);
    return apiSuccess({ success: true, id }, "Organization deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
