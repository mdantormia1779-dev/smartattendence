import { NextResponse } from "next/server";
import { LeaveService } from "@/server/services/leave.service";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"]);
    const orgId = session.role === "SUPER_ADMIN" ? "all" : (session.organizationId || "");

    const body = await request.json();
    const decision = body.decision || "APPROVED";
    const comment = body.comment || body.orgNote || body.managerNote;

    let result;
    if (session.role === "MANAGER") {
      result = await LeaveService.approveByManager(id, orgId, decision, comment);
    } else {
      result = await LeaveService.approveByOrgAdmin(id, orgId, decision, comment);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
