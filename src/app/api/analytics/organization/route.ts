import { EmployeeService } from "@/server/services/employee.service";
import { AttendanceService } from "@/server/services/attendance.service";
import { BranchService } from "@/server/services/branch.service";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orgId = session.organizationId || "org-1";

    const { items: employees } = await EmployeeService.getEmployees(orgId, { limit: 500 });
    const branches = await BranchService.getBranches(orgId);
    const todayLogs = await AttendanceService.getAttendanceLogs(orgId, { date: new Date().toISOString().split("T")[0] });

    const totalStaff = employees.length;
    const present = todayLogs.filter((l) => l.status === "PRESENT").length;
    const late = todayLogs.filter((l) => l.status === "LATE").length;
    const onLeave = todayLogs.filter((l) => l.status === "ON_LEAVE").length;
    const absent = Math.max(0, totalStaff - (present + late + onLeave));

    const stats = {
      totalEmployees: totalStaff,
      totalBranches: branches.length,
      todayPresent: present,
      todayLate: late,
      todayAbsent: absent,
      todayOnLeave: onLeave,
      attendanceRate: totalStaff > 0 ? Number(((present / totalStaff) * 100).toFixed(1)) : 0,
      punctualityRate: (present + late) > 0 ? Number(((present / (present + late)) * 100).toFixed(1)) : 100,
    };

    return apiSuccess(stats, "Organization analytics fetched successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
