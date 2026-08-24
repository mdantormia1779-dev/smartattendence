import { requireAuth } from "@/server/authorization";
import { markNotificationAsRead } from "@/lib/notification-service";
import { apiSuccess, apiError } from "@/server/errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireAuth(request);

    const updated = markNotificationAsRead(id);
    return apiSuccess({ id, isRead: true, updated }, "Notification marked as read");
  } catch (error: any) {
    return apiError(error);
  }
}
