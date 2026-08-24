import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "../errors";

export interface CouponData {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  value: string;
  maxUses: number | null;
  usageLimit: string;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  expiryDate: string;
  isActive: boolean;
  status: "Active" | "Expired";
  createdAt: string;
}

function mapToCouponData(c: any): CouponData {
  const isExpired = new Date(c.validUntil).getTime() < Date.now();
  const isActive = c.isActive && !isExpired;
  const isPercentage = c.discountType?.toLowerCase() === "percentage";
  const numValue = Number(c.discountValue) || 0;

  return {
    id: c.id,
    code: c.code,
    discountType: isPercentage ? "percentage" : "fixed",
    discountValue: numValue,
    value: isPercentage ? `${numValue}%` : `৳${numValue.toLocaleString()}`,
    maxUses: c.maxUses ?? null,
    usageLimit: c.maxUses ? String(c.maxUses) : "Unlimited",
    usedCount: c.usedCount ?? 0,
    validFrom: c.validFrom instanceof Date ? c.validFrom.toISOString().split("T")[0] : String(c.validFrom),
    validUntil: c.validUntil instanceof Date ? c.validUntil.toISOString().split("T")[0] : String(c.validUntil),
    expiryDate: c.validUntil instanceof Date ? c.validUntil.toISOString().split("T")[0] : String(c.validUntil),
    isActive: !!c.isActive,
    status: isActive ? "Active" : "Expired",
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  };
}

export class CouponService {
  /**
   * Directly fetch all coupons from database
   */
  static async getAllCoupons(): Promise<CouponData[]> {
    const coupons = await prisma.coupons.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return coupons.map(mapToCouponData);
  }

  /**
   * Fetch a single coupon by ID
   */
  static async getCouponById(id: string): Promise<CouponData> {
    const coupon = await prisma.coupons.findUnique({
      where: { id },
    });

    if (!coupon) throw new NotFoundError("Coupon");
    return mapToCouponData(coupon);
  }

  /**
   * Fetch a single coupon by code
   */
  static async getCouponByCode(code: string): Promise<CouponData> {
    const coupon = await prisma.coupons.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) throw new NotFoundError(`Coupon with code '${code}'`);
    return mapToCouponData(coupon);
  }

  /**
   * Create a new coupon directly in database
   */
  static async createCoupon(data: {
    code: string;
    discountType: "percentage" | "fixed" | string;
    discountValue?: number | string;
    value?: number | string;
    expiryDate?: string;
    validUntil?: string;
    validFrom?: string;
    usageLimit?: number | string;
    maxUses?: number | string;
    isActive?: boolean;
  }): Promise<CouponData> {
    const normalizedCode = data.code.trim().toUpperCase();
    if (!normalizedCode) {
      throw new ValidationError("Coupon code cannot be empty");
    }

    const existing = await prisma.coupons.findUnique({
      where: { code: normalizedCode },
    });
    if (existing) {
      throw new ConflictError(`Coupon with code '${normalizedCode}' already exists`);
    }

    const rawVal = data.discountValue ?? data.value ?? 0;
    const cleanNumVal = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.]/g, "")) || 0;

    const rawLimit = data.maxUses ?? data.usageLimit;
    const cleanMaxUses = rawLimit && rawLimit !== "Unlimited" ? parseInt(String(rawLimit), 10) : null;

    const untilDate = data.expiryDate || data.validUntil
      ? new Date(data.expiryDate || data.validUntil!)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const fromDate = data.validFrom ? new Date(data.validFrom) : new Date();

    const created = await prisma.coupons.create({
      data: {
        id: `coup-${Date.now()}`,
        code: normalizedCode,
        discountType: data.discountType === "fixed" ? "fixed" : "percentage",
        discountValue: cleanNumVal,
        maxUses: cleanMaxUses,
        usedCount: 0,
        validFrom: fromDate,
        validUntil: untilDate,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
      },
    });

    return mapToCouponData(created);
  }

  /**
   * Update coupon by ID directly in database
   */
  static async updateCoupon(
    id: string,
    data: {
      code?: string;
      discountType?: "percentage" | "fixed" | string;
      discountValue?: number | string;
      value?: number | string;
      expiryDate?: string;
      validUntil?: string;
      usageLimit?: number | string;
      maxUses?: number | string;
      isActive?: boolean;
    }
  ): Promise<CouponData> {
    const existing = await prisma.coupons.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundError("Coupon");

    let normalizedCode = existing.code;
    if (data.code && data.code.trim().toUpperCase() !== existing.code) {
      normalizedCode = data.code.trim().toUpperCase();
      const codeConflict = await prisma.coupons.findUnique({
        where: { code: normalizedCode },
      });
      if (codeConflict && codeConflict.id !== id) {
        throw new ConflictError(`Coupon code '${normalizedCode}' is already taken`);
      }
    }

    const updatePayload: any = {
      code: normalizedCode,
    };

    if (data.discountType !== undefined) {
      updatePayload.discountType = data.discountType === "fixed" ? "fixed" : "percentage";
    }

    if (data.discountValue !== undefined || data.value !== undefined) {
      const rawVal = data.discountValue ?? data.value;
      updatePayload.discountValue =
        typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.]/g, "")) || 0;
    }

    if (data.expiryDate || data.validUntil) {
      updatePayload.validUntil = new Date(data.expiryDate || data.validUntil!);
    }

    if (data.maxUses !== undefined || data.usageLimit !== undefined) {
      const rawLimit = data.maxUses ?? data.usageLimit;
      updatePayload.maxUses =
        rawLimit && rawLimit !== "Unlimited" ? parseInt(String(rawLimit), 10) : null;
    }

    if (data.isActive !== undefined) {
      updatePayload.isActive = data.isActive;
    }

    const updated = await prisma.coupons.update({
      where: { id },
      data: updatePayload,
    });

    return mapToCouponData(updated);
  }

  /**
   * Delete coupon by ID directly from database
   */
  static async deleteCoupon(id: string): Promise<{ deleted: boolean; id: string }> {
    const existing = await prisma.coupons.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundError("Coupon");

    await prisma.coupons.delete({
      where: { id },
    });

    return { deleted: true, id };
  }

  /**
   * Validate coupon and calculate discount against order amount
   */
  static async validateCoupon(
    code: string,
    orderAmount: number = 0
  ): Promise<{
    valid: boolean;
    coupon: CouponData;
    discountAmount: number;
    finalAmount: number;
  }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon.isActive) {
      throw new ValidationError("This coupon has been disabled by admin");
    }

    if (coupon.status === "Expired") {
      throw new ValidationError("This coupon has expired");
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new ValidationError("This coupon has reached its maximum usage limit");
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return {
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
    };
  }
}
