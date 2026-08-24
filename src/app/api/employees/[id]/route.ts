import { NextResponse } from "next/server";
import { EmployeeService } from "@/server/services/employee.service";
import { requireAuth, requireTenantScope } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const employee = await EmployeeService.getEmployeeById(id, orgId);
    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const updated = await EmployeeService.updateEmployee(id, orgId, body);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const res = await EmployeeService.deleteEmployee(id, orgId);
    return NextResponse.json(res);
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
