import { OvertimeService } from "@/server/services/overtime.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const claims = await OvertimeService.getOvertimeClaims(orgId, {});
    const claim = claims.find((c) => c.id === id);
    if (!claim) throw new NotFoundError("Overtime Claim");

    return apiSuccess(claim, "Overtime claim fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
