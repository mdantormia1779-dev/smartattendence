import { prisma } from "@/lib/prisma";
import { generateSubscriptionCommission } from "@/lib/referral-engine";
import { NotFoundError, ConflictError } from "../errors";
import { logAuditEvent } from "@/lib/audit-logger";

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

      return {
        id: p.id,
        organizationId: p.organizationId,
        organizationName: p.organizations?.name || "Organization",
        planName: p.subscriptions?.subscription_plans?.name || "Standard Plan",
        amount: Number(p.amount) || 0,
        currency: p.currency || "BDT",
        billingCycle: (p.subscriptions?.subscription_plans?.billingCycle === "yearly" ? "Yearly" : "Monthly") as "Monthly" | "Yearly",
        transactionId: p.id.startsWith("TXN-") ? p.id : `TXN-${p.id.substring(0, 8).toUpperCase()}`,
        senderNumber: "+880 1700-000000",
        provider: p.provider || "bKash",
        status: mappedStatus,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString().split("T")[0] : String(p.createdAt),
      };
    });
  }

  /**
   * Create payment record directly in database
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

    const createdPayment = await prisma.payments.create({
      data: {
        id: paymentId,
        organizationId: targetOrgId,
        amount: data.amount,
        currency: "BDT",
        provider: data.provider || "bKash",
        status: "PENDING",
        couponCode: data.referralCode || null,
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
      referralCode: data.referralCode,
      createdAt: createdPayment.createdAt.toISOString().split("T")[0],
    };
  }

  /**
   * Update payment status directly in database
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
      await prisma.subscriptions.updateMany({
        where: { organizationId: payment.organizationId },
        data: { status: "ACTIVE" },
      });

      if (payment.couponCode) {
        generateSubscriptionCommission({
          referralCode: payment.couponCode,
          orgName: payment.organizations?.name || "Organization",
          orgEmail: payment.organizations?.email || "contact@org.com",
          planName: payment.subscriptions?.subscription_plans?.name || "Subscription Plan",
          paymentAmount: Number(payment.amount),
          billingCycle: "Monthly",
        });
      }

      logAuditEvent({
        organizationId: payment.organizationId,
        userName: approvedBy,
        userRole: "SUPER_ADMIN",
        action: "PAYMENT_APPROVED",
        module: "Subscriptions",
        details: `Approved subscription payment of $${payment.amount} for ${payment.organizations?.name || "Organization"}`,
      });
    }

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      organizationName: updated.organizations?.name || "Organization",
      planName: updated.subscriptions?.subscription_plans?.name || "Subscription Plan",
      amount: Number(updated.amount),
      currency: updated.currency || "BDT",
      billingCycle: (updated.subscriptions?.subscription_plans?.billingCycle === "yearly" ? "Yearly" : "Monthly") as "Monthly" | "Yearly",
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
