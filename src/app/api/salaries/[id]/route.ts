import { EmployeeService } from "@/server/services/employee.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const employee = await EmployeeService.getEmployeeById(id, orgId);
    const salaryData = {
      id: `sal-${employee.employeeId}`,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      designation: employee.designation,
      basicSalary: employee.basicSalary,
      salaryGrade: employee.salaryGrade,
      salaryType: employee.salaryType,
      bankAccountNumber: employee.bankAccountNumber,
      bankName: employee.bankName,
    };

    return apiSuccess(salaryData, "Salary details fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireRole(request, ["SUPER_ADMIN", "ORG_ADMIN"]);
    const orgId = session.organizationId || "org-1";

    const body = await request.json();
    const updated = await EmployeeService.updateEmployee(id, orgId, body);

    return apiSuccess(updated, "Salary structure updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
