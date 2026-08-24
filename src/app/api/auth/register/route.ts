import { NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { SignupSchema } from "@/server/validators";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = SignupSchema.parse(body);

    const result = await AuthService.registerTenant(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
