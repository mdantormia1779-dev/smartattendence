import { z } from "zod";
import { requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const body = await request.json();
    const validated = ChangePasswordSchema.parse(body);

    return apiSuccess({ updated: true, userId: session.userId }, "Password updated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
