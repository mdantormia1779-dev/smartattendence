import { SubscriptionService } from "@/server/services/subscription.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const plans = await SubscriptionService.getPlans();
    return apiSuccess(plans, "Subscription plans retrieved successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();
    const created = await SubscriptionService.createPlan(body);
    return apiSuccess(created, "Subscription plan created successfully", undefined, 201, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
