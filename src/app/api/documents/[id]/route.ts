import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireAuth(request);

    return apiSuccess({ deleted: true, id }, "Document removed successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
