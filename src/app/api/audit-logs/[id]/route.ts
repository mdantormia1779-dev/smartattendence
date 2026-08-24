import { getAuditLogs } from "@/lib/audit-logger";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError, NotFoundError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.role === "SUPER_ADMIN" ? undefined : (session.organizationId || "org-1");

    const logs = getAuditLogs(orgId);
    const log = logs.find((l) => l.id === id);
    if (!log) throw new NotFoundError("Audit Log");

    return apiSuccess(log, "Audit log details fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
