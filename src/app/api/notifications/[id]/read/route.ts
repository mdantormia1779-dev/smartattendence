import { requireAuth } from "@/server/authorization";
import { markNotificationAsRead } from "@/lib/notification-service";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireAuth(request);

    const updated = await markNotificationAsRead(id);
    return apiSuccess({ id, isRead: true, updated }, "Notification marked as read", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
