import { NextResponse } from "next/server";
import { DepartmentService } from "@/server/services/department.service";
import { CreateDepartmentSchema } from "@/server/validators";
import { requireAuth, requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const depts = await DepartmentService.getDepartments(orgId);
    return NextResponse.json({ success: true, data: depts });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const validated = CreateDepartmentSchema.parse(body);

    const newDept = await DepartmentService.createDepartment({
      organizationId: orgId,
      ...validated,
    });

    return NextResponse.json({ success: true, data: newDept }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
