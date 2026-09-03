import { getUserNotifications, sendNotification, RoleType } from "@/lib/notification-service";
import { getTenantContext } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = getTenantContext(request);

    const headerUserId = request.headers.get("x-user-id");
    const headerEmpId = request.headers.get("x-employee-id");
    const headerOrgId = request.headers.get("x-organization-id");
    const headerRole = request.headers.get("x-user-role");

    const userId = searchParams.get("userId") || headerUserId || headerEmpId || session?.userId || "user-super-1";
    const role = (searchParams.get("role") || headerRole || session?.role || "SUPER_ADMIN") as RoleType;
    const organizationId = searchParams.get("organizationId") || headerOrgId || session?.organizationId || null;

    const notifs = await getUserNotifications({
      userId,
      role,
      organizationId,
    });

    const unreadCount = notifs.filter((n) => !n.isRead).length;

    return apiSuccess(
      {
        notifications: notifs,
        unreadCount,
      },
      "Notifications retrieved successfully",
      undefined,
      200,
      {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      }
    );
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = getTenantContext(request);
    const body = await request.json();

    const senderRole = (session?.role || body.senderRole || "SUPER_ADMIN") as RoleType;
    const senderId = session?.userId || body.senderId || "user-super-1";
    const senderName = session?.fullName || body.senderName || "Super Admin";
    const senderOrgId = session?.organizationId || body.senderOrgId || null;

    const result = await sendNotification({
      senderId,
      senderName,
      senderRole,
      senderOrgId,
      scope: body.scope || "GLOBAL_BROADCAST",
      targetOrgId: body.targetOrgId || null,
      targetRole: body.targetRole || null,
      recipientUserId: body.recipientUserId || null,
      title: body.title,
      message: body.message,
      category: body.category || "SYSTEM",
      type: body.type || "INFO",
      link: body.link,
      dataJson: body.dataJson,
    });

    if (!result.success) {
      return apiError(new Error(result.error || "Failed to dispatch notification"));
    }

    return apiSuccess(result.notification, "Notification dispatched successfully", undefined, 201, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
