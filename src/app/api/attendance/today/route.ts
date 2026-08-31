import { NextResponse } from "next/server";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const headerEmail = request.headers.get("x-user-email");
    const headerUserId = request.headers.get("x-user-id");
    const headerEmpId = request.headers.get("x-employee-id");

    const email = (session.email || headerEmail || "").trim().toLowerCase();
    const userId = session.userId || headerUserId;
    const employeeCode = session.employeeId || headerEmpId;

    // 1. Resolve employee
    let employee: any = null;
    if (email) {
      employee = await prisma.employees.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      }).catch(() => null);
    }
    if (!employee && userId && userId !== "user-emp-1") {
      employee = await prisma.employees.findFirst({
        where: { id: userId },
      }).catch(() => null);
    }
    if (!employee && employeeCode) {
      employee = await prisma.employees.findFirst({
        where: { OR: [{ id: employeeCode }, { employeeCode: employeeCode }] },
      }).catch(() => null);
    }

    if (!employee) {
      return NextResponse.json({ success: true, data: null });
    }

    const now = new Date();
    const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const searchStart = new Date(todayDate.getTime() - 24 * 60 * 60 * 1000);
    const searchEnd = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);

    const punch = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: searchStart, lte: searchEnd },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!punch) {
      return NextResponse.json({ success: true, data: null });
    }

    let workedHours = 0;
    if (punch.checkInTime && punch.checkOutTime) {
      const diffMs = new Date(punch.checkOutTime).getTime() - new Date(punch.checkInTime).getTime();
      workedHours = parseFloat((Math.max(0, diffMs) / (1000 * 60 * 60)).toFixed(2));
    }

    return NextResponse.json({
      success: true,
      data: {
        id: punch.id,
        hasPunchedIn: Boolean(punch.checkInTime),
        hasPunchedOut: Boolean(punch.checkOutTime),
        checkInTime: punch.checkInTime
          ? new Date(punch.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : null,
        checkInTimestamp: punch.checkInTime ? new Date(punch.checkInTime).getTime() : null,
        checkOutTime: punch.checkOutTime
          ? new Date(punch.checkOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : null,
        checkOutTimestamp: punch.checkOutTime ? new Date(punch.checkOutTime).getTime() : null,
        status: punch.status,
        workedHours,
        overtimeHours: punch.workedMinutes && punch.workedMinutes > 540 ? parseFloat(((punch.workedMinutes - 540) / 60).toFixed(2)) : 0,
      },
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

