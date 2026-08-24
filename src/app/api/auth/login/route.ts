import { NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { LoginSchema, SignupSchema } from "@/server/validators";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = LoginSchema.parse(body);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await AuthService.login(validated.email, validated.password, ip, userAgent);

    const response = NextResponse.json({
      success: true,
      data: result,
    });

    // Set secure HTTP-only auth cookies
    response.cookies.set("auth_session", result.token, {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    response.cookies.set("user_role", result.user.role, {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
