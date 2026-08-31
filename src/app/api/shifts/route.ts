import { NextResponse } from "next/server";
import { ShiftService } from "@/server/services/shift.service";
import { CreateShiftSchema } from "@/server/validators";
import { requireAuth, requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || request.headers.get("x-organization-id") || session.organizationId || "org-1";
    const branchId = searchParams.get("branchId") || undefined;

    const shifts = await ShiftService.getShifts(orgId, branchId);
    return NextResponse.json({ success: true, data: shifts });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const body = await request.json();
    const validated = CreateShiftSchema.parse(body);

    const newShift = await ShiftService.createShift({
      organizationId: orgId,
      branchId: body.branchId || validated.branchId,
      ...validated,
    });

    return NextResponse.json({ success: true, data: newShift }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
