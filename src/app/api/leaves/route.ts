import { NextResponse } from "next/server";
import { LeaveService } from "@/server/services/leave.service";
import { ApplyLeaveSchema } from "@/server/validators";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || undefined;

    const leaves = await LeaveService.getLeaveRequests(orgId, { employeeId });
    const quotas = employeeId ? await LeaveService.getEmployeeQuotas(orgId, employeeId) : undefined;

    return NextResponse.json({ success: true, data: leaves, quotas });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = ApplyLeaveSchema.parse(body);

    const newLeave = await LeaveService.applyLeave({
      organizationId: orgId,
      employeeId: validated.employeeId || session.employeeId || "EMP-1042",
      type: validated.type,
      startDate: validated.startDate,
      endDate: validated.endDate,
      reason: validated.reason,
      attachmentS3Key: validated.attachmentS3Key,
    });

    return NextResponse.json({ success: true, data: newLeave }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
