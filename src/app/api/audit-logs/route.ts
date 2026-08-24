import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/audit-logger";
import { requireRole, requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.role === "SUPER_ADMIN" ? undefined : (session.organizationId || "org-1");

    const logs = getAuditLogs(orgId);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
