import { SubscriptionService } from "@/server/services/subscription.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const plan = await SubscriptionService.getPlanById(id);
    return apiSuccess(plan, "Subscription plan retrieved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    const body = await request.json();
    const updated = await SubscriptionService.updatePlan(id, body);

    return apiSuccess(updated, "Subscription plan updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    requireRole(request, ["SUPER_ADMIN"]);

    const result = await SubscriptionService.deletePlan(id);
    return apiSuccess(result, "Subscription plan deleted successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
