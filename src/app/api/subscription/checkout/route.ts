import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const checkoutSession = {
      checkoutId: `chk_${Date.now()}`,
      organizationId: orgId,
      planTier: body.planTier || "BUSINESS",
      billingCycle: body.billingCycle || "Monthly",
      amount: body.billingCycle === "Yearly" ? 1490.0 : 149.0,
      currency: "USD",
      paymentGatewayUrl: `https://checkout.stripe.com/pay/cs_test_${Date.now()}`,
      status: "INITIATED",
    };

    return apiSuccess(checkoutSession, "Checkout session created successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
