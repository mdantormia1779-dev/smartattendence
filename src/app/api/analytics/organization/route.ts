import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    
    // Resolve real organization ID
    let orgId = session.organizationId;
    if (!orgId || orgId === "org-1") {
      const firstOrg = await prisma.organizations.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (firstOrg) {
        orgId = firstOrg.id;
      } else {
        orgId = "org-1";
      }
    }

    // 1. Real Total Employees Count from Database
    const totalStaff = await prisma.employees.count({
      where: { organizationId: orgId },
    });

    // 2. Real Branches Count from Database
    const totalBranches = await prisma.branches.count({
      where: { organizationId: orgId },
    });

    // 3. Real Today's Attendance from Database
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayLogs = await prisma.attendance.findMany({
      where: {
        employees: { organizationId: orgId },
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        employees: true,
      },
    });

    const present = todayLogs.filter((l) => l.status === "PRESENT").length;
    const late = todayLogs.filter((l) => l.status === "LATE" || (l.lateMinutes && l.lateMinutes > 0)).length;

    // 4. Real Approved Leaves Active Today
    const todayLeaves = await prisma.leaves.findMany({
      where: {
        employees: { organizationId: orgId },
        status: "APPROVED",
        startDate: { lte: todayEnd },
        endDate: { gte: todayStart },
      },
    });
    const onLeave = todayLeaves.length;

    // Real absent count
    const absent = Math.max(0, totalStaff - (present + late + onLeave));

    // 5. Real Overtime Hours from Database
    let overtimeHours = 0;
    try {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const otRecords = await prisma.overtime.findMany({
        where: {
          employees: { organizationId: orgId },
          date: { gte: monthStart },
        },
      });
      const totalMinutes = otRecords.reduce((acc, r) => acc + (r.minutes || 0), 0);
      overtimeHours = Number((totalMinutes / 60).toFixed(1));
    } catch {
      overtimeHours = 0;
    }

    // 6. Real Last 7 Days Attendance Trend from Database
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyTrend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStart = new Date(d);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const dayName = daysOfWeek[d.getDay()];
      const dateStr = d.toISOString().split("T")[0];

      const dayLogs = await prisma.attendance.findMany({
        where: {
          employees: { organizationId: orgId },
          date: {
            gte: dStart,
            lte: dEnd,
          },
        },
      });

      const p = dayLogs.filter((l) => l.status === "PRESENT").length;
      const l = dayLogs.filter((l) => l.status === "LATE" || (l.lateMinutes && l.lateMinutes > 0)).length;
      const a = Math.max(0, totalStaff - (p + l));

      weeklyTrend.push({
        day: dayName,
        date: dateStr,
        p,
        l,
        a,
        present: p,
        late: l,
        absent: a,
      });
    }

    const attendanceRate = totalStaff > 0 ? Number(((present / totalStaff) * 100).toFixed(1)) : 0;
    const punctualityRate = (present + late) > 0 ? Number(((present / (present + late)) * 100).toFixed(1)) : 100;

    const stats = {
      organizationId: orgId,
      totalEmployees: totalStaff,
      totalBranches,
      todayPresent: present,
      todayLate: late,
      todayAbsent: absent,
      todayOnLeave: onLeave,
      overtimeHours,
      attendanceRate,
      punctualityRate,
      weeklyTrend,
    };

    return apiSuccess(stats, "Organization analytics fetched successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
