import { NextResponse } from "next/server";
import { EmployeeService } from "@/server/services/employee.service";
import { CreateEmployeeSchema } from "@/server/validators";
import { requireAuth, requireRole } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = request.headers.get("x-organization-id") || session.organizationId || "org-1";

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || undefined;
    const branchId = searchParams.get("branchId") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = await EmployeeService.getEmployees(orgId, {
      page,
      limit,
      search,
      branchId,
      departmentId,
      status,
    });

    return NextResponse.json({ 
      success: true, 
      data: result, 
      items: result.items, 
      pagination: result.pagination 
    });
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
    const validated = CreateEmployeeSchema.parse(body);

    const newEmp = await EmployeeService.createEmployee({
      organizationId: orgId,
      ...validated,
    });

    return NextResponse.json({ success: true, data: newEmp }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
