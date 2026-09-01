import { NextResponse } from "next/server";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";
import { prisma } from "@/lib/prisma";
import { formatTimeInTimezone, getLocalDateString, getLocalDateObject } from "@/lib/datetime";
import { AttendanceMethod } from "@prisma/client";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-email, x-user-id, x-employee-id, x-organization-id",
    },
  });
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();

    const { latitude = 0, longitude = 0, verificationMethod = "GPS_GEOFENCE" } = body;
    const headerEmail = request.headers.get("x-user-email");
    const headerUserId = request.headers.get("x-user-id");
    const headerEmpId = request.headers.get("x-employee-id");

    const email = (session.email || headerEmail || "").trim().toLowerCase();
    const userId = session.userId || headerUserId;
    const employeeCode = body.employeeId || session.employeeId || headerEmpId || "";
    const now = new Date();

    // ── 1. Find employee prioritizing unique ID, Email, then scoped Code ──────
    let employee: any = null;

    // 1. Direct ID match (e.g. emp-1788200778953-359 or session.userId)
    const directEmpId = (body.employeeId && body.employeeId.startsWith("emp-") ? body.employeeId : null)
      || (userId && userId.startsWith("emp-") ? userId : null);

    if (directEmpId) {
      employee = await prisma.employees.findUnique({
        where: { id: directEmpId },
      }).catch(() => null);
    }

    // 2. Direct Email match (e.g. employee@gmail.com)
    if (!employee && email && email !== "user@erp.com" && email !== "admin@company.com") {
      employee = await prisma.employees.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      }).catch(() => null);
    }

    // 3. Organization-scoped employee code or employeeId
    if (!employee && body.employeeId) {
      const orgFilter = session.organizationId ? { organizationId: session.organizationId } : {};
      employee = await prisma.employees.findFirst({
        where: {
          ...orgFilter,
          OR: [
            { id: body.employeeId },
            { employeeCode: body.employeeId },
            { email: { equals: body.employeeId, mode: "insensitive" } },
          ],
        },
      }).catch(() => null);
    }

    // 4. Fallback search
    if (!employee && employeeCode) {
      employee = await prisma.employees.findFirst({
        where: {
          OR: [
            { id: employeeCode },
            { employeeCode: employeeCode },
          ],
        },
      }).catch(() => null);
    }


    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: `Employee not found for ID or email provided.`,
        },
        { status: 404 }
      );
    }

    // ── 2. Update today's attendance record ────────────────────────────────────
    let record: any = null;
    let workedHours = 0;

    const methodMap: Record<string, AttendanceMethod> = {
      FACE_RECOGNITION: AttendanceMethod.FACE,
      GPS_GEOFENCE:     AttendanceMethod.GPS,
      BIOMETRIC_DEVICE: AttendanceMethod.FINGERPRINT,
      MANUAL_OVERRIDE:  AttendanceMethod.MANUAL,
    };
    const methodEnum = methodMap[verificationMethod] ?? AttendanceMethod.GPS;
    const orgRecord = employee?.organizationId
      ? await prisma.organizations.findUnique({
          where: { id: employee.organizationId },
          select: { timezone: true },
        }).catch(() => null)
      : null;
    const orgTimezone = orgRecord?.timezone || "Asia/Dhaka";

    const todayDate = getLocalDateObject(now, orgTimezone);
    const todayDateStr = getLocalDateString(now, orgTimezone);

    try {
      const existing = await prisma.attendance.findFirst({
        where: { 
          employeeId: employee.id,
          date: todayDate,
        },
        orderBy: { updatedAt: "desc" },
      });

      let workedMinutes = 0;
      if (existing?.checkInTime) {
        const diffMs = Math.max(0, now.getTime() - new Date(existing.checkInTime).getTime());
        workedMinutes = Math.round(diffMs / (1000 * 60));
        workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      }

      record = await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: todayDate,
          },
        },
        update: {
          checkOutTime: now,
          checkOutLat: latitude !== 0 ? latitude : undefined,
          checkOutLng: longitude !== 0 ? longitude : undefined,
          checkOutMethod: methodEnum,
          workedMinutes: workedMinutes > 0 ? workedMinutes : undefined,
          updatedAt: now,
        },
        create: {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          employeeId: employee.id,
          date: todayDate,
          checkOutTime: now,
          checkOutLat: latitude !== 0 ? latitude : undefined,
          checkOutLng: longitude !== 0 ? longitude : undefined,
          checkOutMethod: methodEnum,
          status: "PRESENT",
          workedMinutes: workedMinutes > 0 ? workedMinutes : undefined,
          updatedAt: now,
        },
      });
    } catch (dbErr: any) {
      console.warn("[check-out] Upsert failed, trying direct update:", dbErr?.message);
      const existing = await prisma.attendance.findFirst({
        where: { 
          employeeId: employee.id,
          date: todayDate,
        },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        record = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            checkOutTime: now,
            checkOutMethod: methodEnum,
            updatedAt: now,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: record?.id ?? `att-out-${Date.now()}`,
        employeeId: employee?.employeeCode ?? employeeCode ?? "EMP-0001",
        employeeName: employee?.fullName ?? "Employee",
        date: todayDateStr,
        checkOutTime: formatTimeInTimezone(now, orgTimezone),
        workedHours,
        status: record?.status || "PRESENT",
      },
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

