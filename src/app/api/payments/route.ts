import { PaymentService } from "@/server/services/payment.service";
import { getTenantContext } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    const session = getTenantContext(request);
    const orgId = session?.role === "SUPER_ADMIN" ? undefined : (session?.organizationId || undefined);

    const payments = await PaymentService.getPayments(orgId);
    return apiSuccess(payments, "Payment requests fetched successfully", undefined, 200, {
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
    const body = await request.json();
    const {
      organization,
      organizationName,
      planName,
      amount,
      billingCycle,
      transactionId,
      senderNumber,
      provider,
      couponCode,
      referralCode,
    } = body;

    const orgName = organizationName || organization || "Organization";
    const amountNum =
      typeof amount === "number"
        ? amount
        : parseFloat(String(amount || 0).replace(/[^0-9.]/g, "")) || 0;

    const newPayment = await PaymentService.createPayment({
      organizationName: orgName,
      planName: planName || "Business Plan",
      amount: amountNum,
      billingCycle: billingCycle || "Monthly",
      transactionId: transactionId || `TXN-${Date.now()}`,
      senderNumber: senderNumber || "+880 1700-000000",
      provider: provider || "bKash",
      couponCode: couponCode || null,
      referralCode: referralCode || couponCode || null,
    });

    return apiSuccess(newPayment, "Payment submitted for verification successfully", undefined, 201, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
