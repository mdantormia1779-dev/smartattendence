import { NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { LoginSchema, SignupSchema } from "@/server/validators";
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
    const body = await request.json();
    const validated = LoginSchema.parse(body);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await AuthService.login(validated.email, validated.password, ip, userAgent);

    const response = NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

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
    return NextResponse.json(err.body, { 
      status: err.statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
}
