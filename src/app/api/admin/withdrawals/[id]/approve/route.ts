import { requireRole } from "@/server/authorization";
import { processPayoutDecisionAsync } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    const body = await request.json();
    const result = await processPayoutDecisionAsync({
      withdrawalId: id,
      decision: "APPROVED",
      adminNotes: body.adminNotes,
    });

    if (!result.success) {
      return apiError(new Error(result.error || "Failed to approve withdrawal"));
    }

    return apiSuccess(result.withdrawal, "Withdrawal approved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

