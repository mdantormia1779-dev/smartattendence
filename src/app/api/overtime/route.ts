import { NextResponse } from "next/server";
import { OvertimeService } from "@/server/services/overtime.service";
import { CreateOvertimeClaimSchema } from "@/server/validators";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || undefined;

    const claims = await OvertimeService.getOvertimeClaims(orgId, { employeeId });
    return NextResponse.json({ success: true, data: claims });
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
    const validated = CreateOvertimeClaimSchema.parse(body);

    const newClaim = await OvertimeService.submitClaim({
      organizationId: orgId,
      employeeId: validated.employeeId || session.employeeId || "EMP-1042",
      date: validated.date,
      type: validated.type,
      claimedHours: validated.claimedHours,
      reason: validated.reason,
    });

    return NextResponse.json({ success: true, data: newClaim }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
