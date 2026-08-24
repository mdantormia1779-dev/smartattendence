import { SubscriptionService } from "@/server/services/subscription.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET() {
  try {
    const plans = await SubscriptionService.getPlans();
    return apiSuccess(plans, "Subscription plans retrieved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();
    const created = await SubscriptionService.createPlan(body);
    return apiSuccess(created, "Subscription plan created successfully", 201);
  } catch (error: any) {
    return apiError(error);
  }
}
