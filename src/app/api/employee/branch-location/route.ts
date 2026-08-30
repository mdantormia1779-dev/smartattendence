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
export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const employeeId = session.employeeId || request.headers.get("x-employee-id");
    const organizationId = session.organizationId || request.headers.get("x-organization-id");

    // 1. Find employee
    let employee = null;
    if (employeeId) {
      employee = await prisma.employees.findFirst({
        where: {
          AND: [
            organizationId ? { organizationId } : {},
            {
              OR: [
                { id: employeeId },
                { employeeCode: employeeId },
              ],
            },
          ],
        },
        include: {
          branches: true,
        },
      });
    }

    const orgId = employee?.organizationId || organizationId || "org-1";

    // 2. Resolve assigned or latest active branch with coordinates
    let branch = employee?.branches || null;

    if (!branch && employee?.branchId) {
      branch = await prisma.branches.findUnique({
        where: { id: employee.branchId },
      });
    }

    // If branch is missing or has null coordinates, fetch the latest active branch for this org
    if (!branch || branch.latitude == null || branch.longitude == null) {
      const orgBranch = await prisma.branches.findFirst({
        where: {
          organizationId: orgId,
          status: "ACTIVE",
          latitude: { not: null },
          longitude: { not: null },
        },
        orderBy: { updatedAt: "desc" },
      });
      if (orgBranch) {
        branch = orgBranch;
      }
    }

    // Fallback: any branch in org
    if (!branch) {
      branch = await prisma.branches.findFirst({
        where: { organizationId: orgId },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, message: "No branch configured for this organization." },
        { status: 404 }
      );
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
