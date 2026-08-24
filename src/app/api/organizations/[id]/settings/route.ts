import { OrganizationService } from "@/server/services/organization.service";
import { UpdateOrgSettingsSchema } from "@/server/validators";
import { requireAuth, requireTenantScope } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    requireTenantScope(session, id);

    const body = await request.json();
    const validated = UpdateOrgSettingsSchema.parse(body);

    const updated = await OrganizationService.updateSettings(id, validated);
    return apiSuccess(updated, "Organization settings updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
