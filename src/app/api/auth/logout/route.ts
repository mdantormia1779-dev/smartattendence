import { NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const response = apiSuccess({ loggedOut: true }, "Successfully logged out");
    response.cookies.delete("auth_session");
    response.cookies.delete("user_role");
    return response;
  } catch (error: any) {
    return apiError(error);
  }
}
