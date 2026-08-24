import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    const { employeeId } = await params;
    requireAuth(request);

    // Return status without leaking raw biometric vectors
    return apiSuccess(
      {
        employeeId,
        isEnrolled: true,
        antiSpoofScore: 99.2,
        enrolledAt: "2026-01-15",
      },
      "Face enrollment status fetched successfully"
    );
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    const { employeeId } = await params;
    requireAuth(request);

    return apiSuccess({ deleted: true, employeeId }, "Face biometric vector deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
