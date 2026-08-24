import { NextResponse } from "next/server";
import { SubscriptionService } from "@/server/services/subscription.service";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET() {
  try {
    const settings = await SubscriptionService.getTrialSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function PATCH(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();

    const updated = await SubscriptionService.updateTrialSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
