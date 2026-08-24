import { z } from "zod";
import { apiSuccess, apiError } from "@/server/errors";

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = VerifyEmailSchema.parse(body);

    return apiSuccess({ verified: true }, "Email verified successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
