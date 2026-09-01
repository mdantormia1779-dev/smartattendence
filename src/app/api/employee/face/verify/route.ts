import { NextResponse } from "next/server";
import { BiometricsService } from "@/server/services/biometrics.service";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

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

    const empId = body.employeeId || session.employeeId || "EMP-0001";
    const probeVector = body.probeEmbedding || body.probeVector || body.vectorData;
    const livenessPassed = Boolean(body.livenessPassed);
    const threshold = typeof body.threshold === "number" ? body.threshold : 0.68;
    const organizationId = session.organizationId || body.organizationId;

    const result = await BiometricsService.verifyFace(
      empId,
      probeVector,
      livenessPassed,
      organizationId,
      threshold
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
