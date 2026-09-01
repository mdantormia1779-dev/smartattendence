import { NextResponse } from "next/server";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";
import { prisma } from "@/lib/prisma";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-email, x-user-id, x-employee-id, x-organization-id",
    },
  });
}

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const headerEmpId = request.headers.get("x-employee-id");
    const headerEmail = request.headers.get("x-user-email");
    const headerUserId = request.headers.get("x-user-id");

    const email = (session.email || headerEmail || "").trim().toLowerCase();
    const userId = session.userId || headerUserId;
    const employeeCode = session.employeeId || headerEmpId;

    // 1. Fetch real employee details from database prioritizing unique email & userId
    let employee: any = null;

    const includeConfig = {
      branches: true,
      departments: true,
      organizations: true,
      face_profiles: true,
      shift_assignments: {
        include: { shifts: true },
        orderBy: { effectiveFrom: "desc" as const },
        take: 1,
      },
    };

    if (email) {
      employee = await prisma.employees.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        include: includeConfig,
      }).catch(() => null);
    }

    if (!employee && userId && userId !== "user-emp-1") {
      employee = await prisma.employees.findFirst({
        where: { id: userId },
        include: includeConfig,
      }).catch(() => null);
    }

    if (!employee && employeeCode) {
      employee = await prisma.employees.findFirst({
        where: {
          OR: [
            { id: employeeCode },
            { employeeCode: employeeCode },
          ],
        },
        include: includeConfig,
      }).catch(() => null);
    }

    if (employee) {
      const faceDesc = employee.face_profiles?.descriptor as any;

      // 2. Resolve assigned shift (personal assignment first, or branch default)
      let activeShift = employee.shift_assignments?.[0]?.shifts || null;
      if (!activeShift && employee.branchId) {
        activeShift = await prisma.shifts.findFirst({
          where: { branchId: employee.branchId },
          orderBy: { createdAt: "asc" },
        }).catch(() => null);
      }

      const shiftName = activeShift?.name || "Regular Shift";
      const shiftStart = activeShift?.startTime || "09:00 AM";
      const shiftEnd = activeShift?.endTime || "06:00 PM";
      const shiftGracePeriod = activeShift?.gracePeriod ?? 15;
      const shiftLateAfter = activeShift?.lateAfter ?? 30;

      return NextResponse.json({
        success: true,
        data: {
          id: employee.id,
          userId: employee.id,
          employeeId: employee.employeeCode || employee.id,
          employeeCode: employee.employeeCode || employee.id,
          fullName: employee.fullName,
          name: employee.fullName,
          email: employee.email,
          phone: employee.phone || "+880 1700-000000",
          role: session.role || "EMPLOYEE",
          designation: employee.designation || "Employee",
          department: employee.departments?.name || "General",
          departmentId: employee.departmentId,
          branch: employee.branches?.name || "Main Branch",
          branchId: employee.branchId,
          branchLatitude: employee.branches?.latitude ? Number(employee.branches.latitude) : null,
          branchLongitude: employee.branches?.longitude ? Number(employee.branches.longitude) : null,
          geofenceRadius: employee.branches?.geoFenceRadius || 120,
          shift: `${shiftStart} - ${shiftEnd}`,
          shiftName,
          shiftStart,
          shiftEnd,
          shiftGracePeriod,
          shiftLateAfter,
          organizationId: employee.organizationId,
          organizationName: employee.organizations?.name || "Smart Attendance",
          joiningDate: employee.joiningDate ? employee.joiningDate.toISOString() : null,
          status: employee.status,
          profilePicture: employee.profilePicture,
          gender: employee.gender,
          bloodGroup: employee.bloodGroup,
          isFaceEnrolled: Boolean(faceDesc?.vector && Array.isArray(faceDesc.vector)),
          faceDescriptor: faceDesc?.vector || null,
        },
      });
    }

    // Fallback: If no employee found (e.g. admin or initial user)
    return NextResponse.json({
      success: true,
      data: {
        ...session,
        name: session.fullName,
        employeeCode: session.employeeId || "EMP-0001",
        designation: session.role === "ORG_ADMIN" ? "Organization Admin" : "Employee",
        department: "General",
        branch: "Main Branch",
        shift: "09:00 AM - 06:00 PM",
        shiftName: "Regular Shift",
        shiftStart: "09:00 AM",
        shiftEnd: "06:00 PM",
        shiftGracePeriod: 15,
        isFaceEnrolled: false,
      },
    });

  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}


