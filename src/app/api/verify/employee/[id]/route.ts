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
        { success: false, error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const employee: any = await prisma.employees.findFirst({
      where: {
        OR: [
          { id: id },
          { employeeCode: id },
          { employeeCode: id.toUpperCase() },
        ],
      },
      include: {
        organizations: true,
        branches: true,
        departments: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee record not found or invalid QR code" },
        { status: 404 }
      );
    }

    // Sanitized public verification payload
    const verificationData = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation || "Staff Member",
      department: employee.departments?.name || "General Operations",
      branch: employee.branches?.name || "Head Office",
      branchAddress: employee.branches?.address || "Main Office Location",
      gender: employee.gender || "Male",
      bloodGroup: employee.bloodGroup || "B+",
      status: employee.status === "ACTIVE" ? "Active" : "On Leave",
      employmentType: employee.employmentType === "FULL_TIME" ? "Full-Time" : "Contract",
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split("T")[0] : null,
      profilePicture: employee.profilePicture,
      organization: {
        name: employee.organizations?.name || "Smart Attendance Organization",
        email: employee.organizations?.email,
        phone: employee.organizations?.phone,
      },
    };

    return NextResponse.json({
      success: true,
      data: verificationData,
    });
  } catch (error: any) {
    console.error("Error verifying employee ID:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify employee record" },
      { status: 500 }
    );
  }
}
