import { OrganizationService } from "@/server/services/organization.service";
import { EmployeeService } from "@/server/services/employee.service";
import { AttendanceService } from "@/server/services/attendance.service";
import { BranchService } from "@/server/services/branch.service";
import { requireAuth, requireTenantScope } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = requireAuth(request);
    requireTenantScope(session, id);

    const org = await OrganizationService.getOrganizationById(id);
    const branches = await BranchService.getBranches(id);
    const { items: employees } = await EmployeeService.getEmployees(id, { limit: 500 });
    const todayLogs = await AttendanceService.getAttendanceLogs(id, { date: new Date().toISOString().split("T")[0] });

    const presentCount = todayLogs.filter((a) => a.status === "PRESENT").length;
    const lateCount = todayLogs.filter((a) => a.status === "LATE").length;

    const stats = {
      organizationId: id,
      name: org.name,
      totalBranches: branches.length,
      totalEmployees: employees.length,
      todayPresent: presentCount,
      todayLate: lateCount,
      todayAttendanceRate: employees.length > 0 ? Number(((presentCount / employees.length) * 100).toFixed(1)) : 0,
      planTier: org.planTier,
      subscriptionStatus: org.subscriptionStatus,
    };

    return apiSuccess(stats, "Organization stats fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
