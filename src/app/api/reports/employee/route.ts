import { EmployeeService } from "@/server/services/employee.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { items: employees, pagination } = await EmployeeService.getEmployees(orgId, { limit: 500 });
    const summary = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "Active").length,
      onLeave: employees.filter((e) => e.status === "On Leave").length,
      employees,
    };

    return apiSuccess(summary, "Employee headcount report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
