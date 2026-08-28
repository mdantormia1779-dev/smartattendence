import { NextResponse } from "next/server";
import { BiometricsService } from "@/server/services/biometrics.service";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function DELETE(request: Request) {
  try {
    const session = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get("employeeId") || session.employeeId || "EMP-0001";

    const result = await BiometricsService.deleteFace(empId);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
