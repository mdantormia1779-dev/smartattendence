import { NextResponse } from "next/server";
import { LeaveService } from "@/server/services/leave.service";
import { ApplyLeaveSchema } from "@/server/validators";
import { requireAuth } from "@/server/authorization";
import { handleApiError, ValidationError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);

    // Strict Multi-Tenant Scoping:
    // Non-Super-Admins are strictly locked to their own organizationId
    let orgId = session.organizationId;
    if (session.role === "SUPER_ADMIN") {
      const { searchParams } = new URL(request.url);
      orgId = searchParams.get("organizationId") || request.headers.get("x-organization-id") || "all";
    }

    if (!orgId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || undefined;
    const status = searchParams.get("status") || undefined;

    const leaves = await LeaveService.getLeaveRequests(orgId, { employeeId, status });
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

    let orgId = session.organizationId;
    if (session.role === "SUPER_ADMIN") {
      const body = await request.clone().json().catch(() => ({}));
      orgId = body.organizationId || request.headers.get("x-organization-id") || session.organizationId;
    }

    if (!orgId) {
      throw new ValidationError("Organization ID is required to apply for leave.");
    }

    const body = await request.json();
    const validated = ApplyLeaveSchema.parse(body);

    const targetEmployeeId = validated.employeeId || session.employeeId;
    if (!targetEmployeeId) {
      throw new ValidationError("Employee ID is required to submit a leave request.");
    }

    const newLeave = await LeaveService.applyLeave({
      organizationId: orgId,
      employeeId: targetEmployeeId,
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
