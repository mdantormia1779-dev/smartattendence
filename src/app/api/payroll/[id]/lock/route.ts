import { NextResponse } from "next/server";
import { PayrollService } from "@/server/services/payroll.service";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const locked = await PayrollService.lockBatch(id, orgId, session.fullName);
    return NextResponse.json({ success: true, data: locked });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
