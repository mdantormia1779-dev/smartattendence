import { NextResponse } from "next/server";
import { requireAuth } from "@/server/authorization";
import { EmployeeService } from "@/server/services/employee.service";
import { AttendanceService } from "@/server/services/attendance.service";
import { OrganizationService } from "@/server/services/organization.service";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);

    if (session.role === "SUPER_ADMIN") {
      const orgs = await OrganizationService.getAllOrganizations();
      const totalEmployees = orgs.reduce((s, o) => s + o.totalEmployees, 0);
      const totalBranches = orgs.reduce((s, o) => s + o.totalBranches, 0);

      return NextResponse.json({
        success: true,
        data: {
          totalOrganizations: orgs.length,
          totalBranches,
          totalEmployees,
          activeSubscriptions: orgs.filter((o) => o.subscriptionStatus === "ACTIVE").length,
          mrr: 1890.0,
          arr: 22680.0,
          churnRate: 0.8,
        },
      });
    }

    const orgId = session.organizationId || "org-1";
    const { items: employees } = await EmployeeService.getEmployees(orgId, { limit: 500 });
    const todayLogs = await AttendanceService.getAttendanceLogs(orgId, { date: new Date().toISOString().split("T")[0] });

    const totalStaff = employees.length;
    const presentCount = todayLogs.filter((a) => a.status === "PRESENT").length;
    const lateCount = todayLogs.filter((a) => a.status === "LATE").length;
    const onLeaveCount = todayLogs.filter((a) => a.status === "ON_LEAVE").length;
    const absentCount = Math.max(0, totalStaff - (presentCount + lateCount + onLeaveCount));

    return NextResponse.json({
      success: true,
      data: {
        totalStaff,
        presentCount,
        lateCount,
        onLeaveCount,
        absentCount,
        punctualityRate: Number((((presentCount) / (totalStaff || 1)) * 100).toFixed(1)),
      },
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
