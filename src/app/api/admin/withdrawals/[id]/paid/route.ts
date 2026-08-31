import { requireRole } from "@/server/authorization";
import { processPayoutDecisionAsync } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    const result = await processPayoutDecisionAsync({
      withdrawalId: id,
      decision: "PAID",
    });

    if (!result.success) {
      return apiError(new Error(result.error || "Failed to mark withdrawal as paid"));
    }

    return apiSuccess(result.withdrawal, "Withdrawal disbursed and marked as paid successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

