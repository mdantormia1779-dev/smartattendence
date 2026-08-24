import { requireAuth } from "@/server/authorization";
import { markNotificationAsRead } from "@/lib/notification-service";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    markNotificationAsRead("all");
    return apiSuccess({ allRead: true }, "All notifications marked as read");
  } catch (error: any) {
    return apiError(error);
  }
}
