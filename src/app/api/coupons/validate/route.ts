import { CouponService } from "@/server/services/coupon.service";
import { apiSuccess, apiError, ValidationError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code) {
      throw new ValidationError("Coupon code is required");
    }

    const orderAmount = Number(amount) || 0;
    const result = await CouponService.validateCoupon(code, orderAmount);

    return apiSuccess(result, "Coupon applied successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
