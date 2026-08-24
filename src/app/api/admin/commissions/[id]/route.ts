import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();

    return apiSuccess({ id, ...body, updated: true }, "Commission updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
