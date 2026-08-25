import { NextResponse } from "next/server";
import { markNotificationAsRead, markAllNotificationsAsRead, RoleType } from "@/lib/notification-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.all) {
      const count = await markAllNotificationsAsRead({
        userId: body.userId || "user-super-1",
        role: (body.role || "SUPER_ADMIN") as RoleType,
        organizationId: body.organizationId || null,
      });
      return NextResponse.json({ success: true, markedCount: count });
    }

    if (body.id) {
      const ok = await markNotificationAsRead(body.id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: "Missing notification id or all flag" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
