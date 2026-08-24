import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    return apiSuccess(session, "Session retrieved successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
