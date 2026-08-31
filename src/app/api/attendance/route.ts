import { NextResponse } from "next/server";
import { AttendanceService } from "@/server/services/attendance.service";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const employeeId = searchParams.get("employeeId") || undefined;
    const queryOrgId = searchParams.get("organizationId");

    const headerOrgId = request.headers.get("x-organization-id");
    const headerEmail = request.headers.get("x-user-email") || session.email;
    const headerUserId = request.headers.get("x-user-id") || session.userId;
    const headerEmpId = request.headers.get("x-employee-id") || session.employeeId;

    let targetOrgId = queryOrgId || headerOrgId || session.organizationId;

    if (!targetOrgId || targetOrgId === "org-1" || targetOrgId === "default") {
      // 1. Try finding by org admin
      if (headerUserId) {
        const orgAdmin = await prisma.org_admins.findUnique({
          where: { id: headerUserId },
          select: { organizationId: true },
        }).catch(() => null);
        if (orgAdmin?.organizationId) targetOrgId = orgAdmin.organizationId;
      }

      // 2. Try finding by organization owner
      if (!targetOrgId && headerEmail) {
        const orgByOwner = await prisma.organizations.findFirst({
          where: { email: { equals: headerEmail, mode: "insensitive" } },
          select: { id: true },
        }).catch(() => null);
        if (orgByOwner?.id) targetOrgId = orgByOwner.id;
      }

      // 3. Try finding by employee
      if (!targetOrgId && (headerEmail || employeeId || headerEmpId)) {
        const emp = await prisma.employees.findFirst({
          where: {
            OR: [
              ...(headerEmail ? [{ email: { equals: headerEmail, mode: "insensitive" as const } }] : []),
              ...(employeeId ? [{ id: employeeId }, { employeeCode: employeeId }] : []),
              ...(headerEmpId ? [{ id: headerEmpId }, { employeeCode: headerEmpId }] : []),
            ],
          },
          select: { organizationId: true },
        }).catch(() => null);

        if (emp?.organizationId) {
          targetOrgId = emp.organizationId;
        }
      }
    }

    const logs = await AttendanceService.getAttendanceLogs(targetOrgId || "org-1", {
      date,
      employeeId,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

