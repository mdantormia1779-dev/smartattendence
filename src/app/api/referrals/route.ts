import { requireAuth } from "@/server/authorization";
import { getReferralAccount } from "@/lib/referral-engine";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const account = getReferralAccount(session.userId, {
      fullName: session.fullName,
      email: session.email,
      role: session.role,
      organizationId: session.organizationId,
    });

    return apiSuccess(account, "Referral account fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();

    const account = getReferralAccount(session.userId, {
      fullName: session.fullName,
      email: session.email,
      role: session.role,
      organizationId: session.organizationId,
      customCode: body.customCode,
    });

    return apiSuccess(account, "Referral account initialized successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
