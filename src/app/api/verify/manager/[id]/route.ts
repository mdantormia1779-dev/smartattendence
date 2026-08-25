import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Manager ID is required" },
        { status: 400 }
      );
    }

    const manager: any = await prisma.managers.findFirst({
      where: {
        OR: [
          { id: id },
          { id: { contains: id } },
        ],
      },
      include: {
        organizations: true,
        branches: true,
        departments: true,
        employees: {
          select: {
            id: true,
            fullName: true,
            designation: true,
          },
        },
      },
    });

    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager record not found or invalid QR code" },
        { status: 404 }
      );
    }

    // Sanitized public verification payload
    const verificationData = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      id: manager.id,
      managerCode: `MGR-${manager.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}`,
      fullName: manager.name,
      email: manager.email,
      phone: manager.phone || "+880 1800-000000",
      designation: manager.designation || "Operations Lead Manager",
      department: manager.departments?.name || "General Operations",
      branch: manager.branches?.name || "Main Head Office",
      branchAddress: manager.branches?.address || "Headquarters Location",
      status: manager.status === "INACTIVE" ? "Inactive" : "Active",
      role: "Department / Branch Leadership",
      teamCount: manager.employees?.length || 0,
      profilePicture: manager.profilePicture,
      organization: {
        name: manager.organizations?.name || "Smart Attendance Organization",
        email: manager.organizations?.email,
        phone: manager.organizations?.phone,
      },
    };

    return NextResponse.json({
      success: true,
      data: verificationData,
    });
  } catch (error: any) {
    console.error("Error verifying manager ID:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify manager record" },
      { status: 500 }
    );
  }
}
