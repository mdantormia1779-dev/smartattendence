import { SubscriptionService } from "@/server/services/subscription.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    const body = await request.json();
    const plan = await SubscriptionService.getPlanById(id);
    Object.assign(plan, body);

    return apiSuccess(plan, "Subscription plan updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    return apiSuccess({ deleted: true, id }, "Subscription plan deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
