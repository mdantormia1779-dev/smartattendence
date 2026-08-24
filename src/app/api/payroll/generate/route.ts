import { NextResponse } from "next/server";
import { PayrollService } from "@/server/services/payroll.service";
import { GeneratePayrollSchema } from "@/server/validators";
import { requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = GeneratePayrollSchema.parse(body);

    const batch = await PayrollService.generateBatch({
      organizationId: orgId,
      month: validated.month,
    });

    return NextResponse.json({ success: true, data: batch }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
