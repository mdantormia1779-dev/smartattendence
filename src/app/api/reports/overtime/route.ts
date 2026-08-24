import { OvertimeService } from "@/server/services/overtime.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const claims = await OvertimeService.getOvertimeClaims(orgId, {});
    const totalHours = claims.reduce((s, c) => s + c.claimedHours, 0);
    const totalPayout = claims.reduce((s, c) => s + c.calculatedAmount, 0);

    const summary = {
      totalClaims: claims.length,
      totalHours,
      totalPayout,
      claims,
    };

    return apiSuccess(summary, "Overtime summary report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
