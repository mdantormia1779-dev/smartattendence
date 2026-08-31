import { NextResponse } from "next/server";
import { BiometricsService } from "@/server/services/biometrics.service";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const headerEmail = request.headers.get("x-user-email");
    const headerUserId = request.headers.get("x-user-id");
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get("employeeId") || headerUserId || headerEmail || session.email || session.employeeId || "EMP-0001";

    const result = await BiometricsService.getFaceStatus(empId);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}

