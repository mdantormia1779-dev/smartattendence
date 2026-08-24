import { NextResponse } from "next/server";
import { PayrollService } from "@/server/services/payroll.service";
import { requireRole, requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const batches = await PayrollService.getBatches(orgId);
    return NextResponse.json({ success: true, data: batches });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
