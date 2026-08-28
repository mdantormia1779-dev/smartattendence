import { prisma } from "@/lib/prisma";
import { generateSubscriptionCommission } from "@/lib/referral-engine";
import { NotFoundError, ConflictError } from "../errors";
import { logAuditEvent } from "@/lib/audit-logger";
import { SubscriptionPlanType } from "@prisma/client";

export interface PaymentTransactionData {
  id: string;
  organizationId: string;
  organizationName: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: "Monthly" | "Yearly";
  transactionId: string;
  senderNumber?: string;
  provider?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";
  approvedAt?: string | null;
  approvedBy?: string | null;
  referralCode?: string | null;
  createdAt: string;
}

export class PaymentService {
  /**
   * Helper: Resolves matching SubscriptionPlanType from planName or amount
   */
  private static resolvePlanType(planName?: string | null, amount?: number): SubscriptionPlanType {
    const p = (planName || "").toUpperCase();
    if (p.includes("ENTERPRISE")) return SubscriptionPlanType.ENTERPRISE;
    if (p.includes("BUSINESS")) return SubscriptionPlanType.BUSINESS;
    if (p.includes("STARTER")) return SubscriptionPlanType.STARTER;
    if (p.includes("FREE") || p.includes("TRIAL")) return SubscriptionPlanType.FREE;

    if (amount !== undefined) {
      if (amount >= 20000) return SubscriptionPlanType.ENTERPRISE;
      if (amount >= 8000) return SubscriptionPlanType.BUSINESS;
      return SubscriptionPlanType.STARTER;
    }

    return SubscriptionPlanType.BUSINESS;
  }

  /**
   * Directly query database for payment records
   */
  static async getPayments(organizationId?: string): Promise<PaymentTransactionData[]> {
    const dbPayments = await prisma.payments.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        organizations: true,
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return dbPayments.map((p) => {
      let mappedStatus: "PENDING" | "APPROVED" | "REJECTED" = "PENDING";
      const upperStatus = (p.status || "").toUpperCase();
      if (upperStatus === "APPROVED" || upperStatus === "PAID" || upperStatus === "COMPLETED" || upperStatus === "SUCCESS") {
        mappedStatus = "APPROVED";
      } else if (upperStatus === "REJECTED" || upperStatus === "FAILED") {
        mappedStatus = "REJECTED";
      }

      // Resolve plan name from relations, invoiceUrl, or amount
      let resolvedPlanName = p.subscriptions?.subscription_plans?.name || p.invoiceUrl;
      if (!resolvedPlanName || resolvedPlanName === "Standard Plan" || resolvedPlanName === "Subscription Plan") {
        const inferredType = this.resolvePlanType(p.invoiceUrl, Number(p.amount));
        resolvedPlanName = inferredType === SubscriptionPlanType.ENTERPRISE 
          ? "Enterprise Plan" 
          : inferredType === SubscriptionPlanType.BUSINESS 
          ? "Business Plan" 
          : "Starter Plan";
      }

      const isYearly = Number(p.amount) >= 30000;

      return {
        id: p.id,
        organizationId: p.organizationId,
        organizationName: p.organizations?.name || "Organization",
        planName: resolvedPlanName,
        amount: Number(p.amount) || 0,
        currency: p.currency || "BDT",
        billingCycle: (isYearly ? "Yearly" : "Monthly") as "Monthly" | "Yearly",
        transactionId: p.id.startsWith("TXN-") ? p.id : `TXN-${p.id.substring(0, 8).toUpperCase()}`,
        senderNumber: "+880 1700-000000",
        provider: p.provider || "bKash",
        status: mappedStatus,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString().split("T")[0] : String(p.createdAt),
      };
    });
  }

  /**
   * Create payment record directly in database and link to organization subscription plan
   */
  static async createPayment(data: {
    organizationId?: string;
    organizationName: string;
    planName: string;
    amount: number;
    billingCycle: "Monthly" | "Yearly";
    transactionId: string;
    senderNumber?: string;
    provider?: string;
    couponCode?: string | null;
    referralCode?: string | null;
  }): Promise<PaymentTransactionData> {
    const paymentId = data.transactionId?.trim() || `pay-${Date.now()}`;

    // Verify idempotency directly against DB
    const existing = await prisma.payments.findUnique({
      where: { id: paymentId },
    });
    if (existing) {
      throw new ConflictError(`Transaction with ID '${paymentId}' already recorded (Idempotency Guard)`);
    }

    let targetOrgId = data.organizationId;
    if (!targetOrgId) {
      const foundOrg = await prisma.organizations.findFirst({
        where: { name: data.organizationName },
      });
      if (foundOrg) {
        targetOrgId = foundOrg.id;
      } else {
        const firstOrg = await prisma.organizations.findFirst();
        if (firstOrg) {
          targetOrgId = firstOrg.id;
        } else {
          // Create minimal tenant record if none exists
          const newOrg = await prisma.organizations.create({
            data: {
              id: `org-${Date.now()}`,
              name: data.organizationName,
              slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              email: "contact@org.com",
              updatedAt: new Date(),
            },
          });
          targetOrgId = newOrg.id;
        }
      }
    }

    // Resolve target Subscription Plan
    const planType = this.resolvePlanType(data.planName, data.amount);
    let targetPlan = await prisma.subscription_plans.findUnique({
      where: { type: planType },
    });

    if (!targetPlan) {
      targetPlan = await prisma.subscription_plans.findFirst();
    }

    // Ensure organization subscription record is linked
    let sub = await prisma.subscriptions.findUnique({
      where: { organizationId: targetOrgId },
    });

    if (!sub && targetPlan) {
      sub = await prisma.subscriptions.create({
        data: {
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          organizationId: targetOrgId,
          planId: targetPlan.id,
          status: "TRIAL",
          startDate: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    const appliedPromo = (data.couponCode || data.referralCode)?.trim().toUpperCase() || null;

    const createdPayment = await prisma.payments.create({
      data: {
        id: paymentId,
        organizationId: targetOrgId,
        subscriptionId: sub?.id || null,
        amount: data.amount,
        currency: "BDT",
        provider: data.provider || "bKash",
        status: "PENDING",
        invoiceUrl: data.planName, // Store intended plan name
        couponCode: appliedPromo,
        createdAt: new Date(),
      },
      include: {
        organizations: true,
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
      },
    });

    // Increment coupon redemption count if applicable
    if (appliedPromo) {
      await prisma.coupons
        .updateMany({
          where: { code: appliedPromo },
          data: {
            usedCount: { increment: 1 },
          },
        })
        .catch(() => {});
    }

    return {
      id: createdPayment.id,
      organizationId: createdPayment.organizationId,
      organizationName: createdPayment.organizations?.name || data.organizationName,
      planName: data.planName,
      amount: Number(createdPayment.amount),
      currency: createdPayment.currency || "BDT",
      billingCycle: data.billingCycle,
      transactionId: createdPayment.id,
      senderNumber: data.senderNumber || "+880 1700-000000",
      provider: createdPayment.provider || "bKash",
      status: "PENDING",
      referralCode: appliedPromo,
      createdAt: createdPayment.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Update payment status directly in database & automatically upgrade/activate organization subscription plan
   */
  static async updatePaymentStatus(
    id: string,
    decision: "APPROVED" | "REJECTED" | "REFUNDED",
    approvedBy: string
  ): Promise<PaymentTransactionData> {
    const payment = await prisma.payments.findUnique({
      where: { id },
      include: {
        organizations: true,
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
      },
    });

    if (!payment) throw new NotFoundError("Payment Record");

    const updated = await prisma.payments.update({
      where: { id: payment.id },
      data: {
        status: decision,
      },
      include: {
        organizations: true,
        subscriptions: {
          include: {
            subscription_plans: true,
          },
        },
      },
    });

    if (decision === "APPROVED" && payment.organizationId) {
      // 1. Automatically determine purchased plan type
      const targetPlanType = this.resolvePlanType(
        payment.invoiceUrl || payment.subscriptions?.subscription_plans?.name,
        Number(payment.amount)
      );

      let matchedPlan = await prisma.subscription_plans.findUnique({
        where: { type: targetPlanType },
      });

      if (!matchedPlan) {
        matchedPlan = await prisma.subscription_plans.findFirst({
          where: { type: { not: SubscriptionPlanType.FREE } },
          orderBy: { price: "desc" },
        });
      }

      // 2. Calculate subscription duration (Yearly >= 30,000 BDT = 365 days; else 30 days)
      const durationDays = Number(payment.amount) >= 30000 ? 365 : 30;
      const targetEndDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      // 3. Atomically upsert & upgrade organization subscription plan
      if (matchedPlan) {
        await prisma.subscriptions.upsert({
          where: { organizationId: payment.organizationId },
          update: {
            planId: matchedPlan.id,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: targetEndDate,
            autoRenew: true,
            updatedAt: new Date(),
          },
          create: {
            id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            organizationId: payment.organizationId,
            planId: matchedPlan.id,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: targetEndDate,
            autoRenew: true,
            updatedAt: new Date(),
          },
        });

        // 4. Update organization status to ACTIVE
        await prisma.organizations.update({
          where: { id: payment.organizationId },
          data: {
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        });
      }

      // 5. Trigger Automated Affiliate Commission
      try {
        const { AffiliateService } = await import("./affiliate.service");
        await AffiliateService.processPaymentCommission({
          paymentId: payment.id,
          organizationId: payment.organizationId,
          amount: Number(payment.amount),
          referralCode: payment.couponCode,
        });
      } catch (affErr) {
        console.error("Failed to process affiliate commission:", affErr);
      }

      if (payment.couponCode) {
        generateSubscriptionCommission({
          referralCode: payment.couponCode,
          orgName: payment.organizations?.name || "Organization",
          orgEmail: payment.organizations?.email || "contact@org.com",
          planName: matchedPlan?.name || "Subscription Plan",
          paymentAmount: Number(payment.amount),
          billingCycle: durationDays === 365 ? "Yearly" : "Monthly",
        });
      }

      logAuditEvent({
        organizationId: payment.organizationId,
        userName: approvedBy,
        userRole: "SUPER_ADMIN",
        action: "PAYMENT_APPROVED",
        module: "Subscriptions",
        details: `Approved payment of ৳${payment.amount} for ${payment.organizations?.name || "Organization"}. Upgraded plan to ${matchedPlan?.name || "Premium Plan"}.`,
      });
    }

    // Resolve final display plan name
    const finalPlanName = this.resolvePlanType(
      payment.invoiceUrl || updated.subscriptions?.subscription_plans?.name,
      Number(updated.amount)
    ) === SubscriptionPlanType.ENTERPRISE 
      ? "Enterprise Plan" 
      : this.resolvePlanType(payment.invoiceUrl, Number(updated.amount)) === SubscriptionPlanType.BUSINESS 
      ? "Business Plan" 
      : "Starter Plan";

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      organizationName: updated.organizations?.name || "Organization",
      planName: finalPlanName,
      amount: Number(updated.amount),
      currency: updated.currency || "BDT",
      billingCycle: (Number(updated.amount) >= 30000 ? "Yearly" : "Monthly") as "Monthly" | "Yearly",
      transactionId: updated.id,
      senderNumber: "+880 1700-000000",
      provider: updated.provider || "bKash",
      status: decision,
      approvedAt: decision === "APPROVED" ? new Date().toISOString().split("T")[0] : null,
      approvedBy: decision === "APPROVED" ? approvedBy : null,
      referralCode: updated.couponCode,
      createdAt: updated.createdAt.toISOString().split("T")[0],
    };
  }
}
