import { EmployeeService } from "@/server/services/employee.service";
import { requireRole, requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const { items: employees } = await EmployeeService.getEmployees(orgId, { limit: 500 });
    const salaryList = employees.map((e) => ({
      id: `sal-${e.employeeId}`,
      employeeId: e.employeeId,
      employeeName: e.name,
      designation: e.designation,
      department: e.department,
      basicSalary: e.basicSalary,
      salaryGrade: e.salaryGrade,
      salaryType: e.salaryType,
      bankAccountNumber: e.bankAccountNumber,
      bankName: e.bankName,
    }));

    return apiSuccess(salaryList, "Salaries fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const updated = await EmployeeService.updateEmployee(body.employeeId, orgId, {
      basicSalary: body.basicSalary,
      salaryGrade: body.salaryGrade,
      salaryType: body.salaryType,
      bankAccountNumber: body.bankAccountNumber,
      bankName: body.bankName,
    });

    return apiSuccess(updated, "Salary structure assigned successfully", undefined, 201);
  } catch (error: any) {
    return apiError(error);
  }
}
