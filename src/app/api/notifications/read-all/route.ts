import { requireAuth } from "@/server/authorization";
import { markAllNotificationsAsRead } from "@/lib/notification-service";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const count = await markAllNotificationsAsRead({
      userId: session.userId,
      role: session.role,
      organizationId: session.organizationId,
    });
    return apiSuccess({ allRead: true, markedCount: count }, "All notifications marked as read", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
