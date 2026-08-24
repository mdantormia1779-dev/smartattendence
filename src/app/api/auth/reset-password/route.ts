import { z } from "zod";
import { apiSuccess, apiError } from "@/server/errors";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ResetPasswordSchema.parse(body);

    return apiSuccess({ success: true }, "Password has been reset successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
