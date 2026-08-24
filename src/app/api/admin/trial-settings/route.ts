import { SubscriptionService } from "@/server/services/subscription.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const settings = await SubscriptionService.getTrialSettings();
    return apiSuccess(settings, "Trial settings fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();

    const updated = await SubscriptionService.updateTrialSettings(body);
    return apiSuccess(updated, "Trial settings updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
