import { updateNotification, deleteNotification } from "@/lib/notification-service";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateNotification(id, {
      title: body.title,
      message: body.message,
      category: body.category,
      type: body.type,
      link: body.link,
      scope: body.scope,
      targetOrgId: body.targetOrgId,
      targetRole: body.targetRole,
      recipientUserId: body.recipientUserId,
    });

    if (!result.success) {
      return apiError(new NotFoundError("Notification"));
    }

    return apiSuccess(result.notification, "Notification updated successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return PUT(request, { params });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await deleteNotification(id);

    if (!result.success) {
      return apiError(new NotFoundError("Notification"));
    }

    return apiSuccess({ deleted: true, id }, "Notification deleted successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
