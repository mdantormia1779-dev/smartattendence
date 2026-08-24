import { NextResponse } from "next/server";
import { BiometricsService } from "@/server/services/biometrics.service";
import { RegisterFaceSchema } from "@/server/validators";
import { requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();
    const validated = RegisterFaceSchema.parse(body);

    const empId = validated.employeeId || session.employeeId || "EMP-1042";
    const result = await BiometricsService.registerFace(empId, validated.vectorData, validated.antiSpoofScore);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
