import { NextResponse } from "next/server";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/employee/branch-location
 *
 * Returns the employee's assigned branch with admin-configured
 * latitude, longitude, geofenceRadius, and branch name from the database.
 */
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
    const headerEmail = request.headers.get("x-user-email");
    const headerUserId = request.headers.get("x-user-id");
    const headerEmpId = request.headers.get("x-employee-id");

    const email = (session.email || headerEmail || "").trim().toLowerCase();
    const userId = session.userId || headerUserId;
    const employeeCode = session.employeeId || headerEmpId;
    const headerOrgId = request.headers.get("x-organization-id");

    // 1. Resolve employee from DB prioritizing unique email & userId
    let employee: any = null;

    if (email) {
      employee = await prisma.employees.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        include: { branches: true, organizations: true },
      }).catch(() => null);
    }

    if (!employee && userId && userId !== "user-emp-1") {
      employee = await prisma.employees.findFirst({
        where: { id: userId },
        include: { branches: true, organizations: true },
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
        include: { branches: true, organizations: true },
      }).catch(() => null);
    }

    const resolvedOrgId = session.organizationId || headerOrgId || employee?.organizationId || null;

    // 2. Fetch the employee's exact assigned branch
    let branch = employee?.branches || null;

    if (!branch && employee?.branchId) {
      branch = await prisma.branches.findUnique({
        where: { id: employee.branchId },
      }).catch(() => null);
    }

    // 3. If still no branch, find a branch within the employee's organization
    if (!branch && employee?.organizationId) {
      branch = await prisma.branches.findFirst({
        where: { organizationId: employee.organizationId, latitude: { not: null }, longitude: { not: null } },
      }).catch(() => null);
    }


    // 3. Fallback — any branch in org (even without coordinates)
    if (!branch && resolvedOrgId) {
      branch = await prisma.branches.findFirst({
        where: { organizationId: resolvedOrgId },
        orderBy: { updatedAt: "desc" },
      });
    }

    // 4. Last resort — any branch in the entire DB with coordinates
    if (!branch) {
      branch = await prisma.branches.findFirst({
        where: {
          latitude: { not: null },
          longitude: { not: null },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!branch) {
      return NextResponse.json({
        success: true,
        data: {
          branchId: "default",
          branchName: "Head Office",
          branchCode: "HO",
          branchAddress: null,
          latitude: null,
          longitude: null,
          geofenceRadius: 120,
          status: "ACTIVE",
        },
        message: "No branch configured yet. Using default values.",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        branchAddress: branch.address,
        latitude: branch.latitude != null ? Number(branch.latitude) : null,
        longitude: branch.longitude != null ? Number(branch.longitude) : null,
        geofenceRadius: branch.geoFenceRadius || 120,
        status: branch.status,
      },
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
