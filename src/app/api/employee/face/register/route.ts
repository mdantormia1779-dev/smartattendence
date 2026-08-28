import { NextResponse } from "next/server";
import { BiometricsService } from "@/server/services/biometrics.service";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();

    const empId = body.employeeId || session.employeeId || "EMP-0001";
    const vectorData = body.embedding || body.vectorData;
    const modelName = body.modelName || "ArcFace-MobileFaceNet-ONNX";
    const sampleCount = typeof body.sampleCount === "number" ? body.sampleCount : 5;
    const organizationId = session.organizationId || body.organizationId;

    const result = await BiometricsService.registerFace(
      empId,
      vectorData,
      modelName,
      sampleCount,
      organizationId
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
