import { requireRole } from "@/server/authorization";
import { processPayoutDecision } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    const body = await request.json();
    const result = processPayoutDecision({
      withdrawalId: id,
      decision: "REJECTED",
      rejectionReason: body.rejectionReason || "Declined by administrator",
    });

    if (!result.success) {
      return apiError(new Error(result.error || "Failed to reject withdrawal"));
    }

    return apiSuccess(result.withdrawal, "Withdrawal rejected successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
