import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    return apiSuccess({ id, status: "AVAILABLE", approved: true }, "Commission approved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
