import { NextResponse } from "next/server";
import { getUserNotifications, sendNotification, RoleType } from "@/lib/notification-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-super-1";
    const role = (searchParams.get("role") || "SUPER_ADMIN") as RoleType;
    const organizationId = searchParams.get("organizationId") || null;

    const notifs = getUserNotifications({
      userId,
      role,
      organizationId,
    });

    const unreadCount = notifs.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications: notifs,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = sendNotification({
      senderId: body.senderId || "admin-1",
      senderName: body.senderName || "System Admin",
      senderRole: body.senderRole || "SUPER_ADMIN",
      senderOrgId: body.senderOrgId || null,
      scope: body.scope || "GLOBAL_BROADCAST",
      targetOrgId: body.targetOrgId || null,
      targetRole: body.targetRole || null,
      recipientUserId: body.recipientUserId || null,
      title: body.title,
      message: body.message,
      category: body.category || "SYSTEM",
      type: body.type || "INFO",
      link: body.link,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, notification: result.notification });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
