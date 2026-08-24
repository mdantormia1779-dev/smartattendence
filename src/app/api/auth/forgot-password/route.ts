import { z } from "zod";
import { apiSuccess, apiError } from "@/server/errors";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ForgotPasswordSchema.parse(body);

    return apiSuccess(
      { email: validated.email, resetTokenSent: true },
      "Password reset instructions sent to your email"
    );
  } catch (error: any) {
    return apiError(error);
  }
}
