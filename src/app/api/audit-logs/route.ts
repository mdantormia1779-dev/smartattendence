import { getAuditLogs } from "@/lib/audit-logger";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.role === "SUPER_ADMIN" ? undefined : (session.organizationId || undefined);

    const logs = await getAuditLogs(orgId);
    return apiSuccess(logs, "Audit logs retrieved successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
