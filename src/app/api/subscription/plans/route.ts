import { NextResponse } from "next/server";
import { SubscriptionService } from "@/server/services/subscription.service";
import { handleApiError } from "@/server/errors";

export async function GET() {
  try {
    const plans = await SubscriptionService.getPlans();
    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
