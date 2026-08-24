import { generateSubscriptionCommission } from "@/lib/referral-engine";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { logAuditEvent } from "@/lib/audit-logger";

export interface PaymentTransactionData {
  id: string;
  organizationId: string;
  organizationName: string;
  planName: string;
  amount: number;
  billingCycle: "Monthly" | "Yearly";
  transactionId: string;
  senderNumber?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";
  approvedAt?: string | null;
  approvedBy?: string | null;
  referralCode?: string | null;
  createdAt: string;
}

let paymentsStore: PaymentTransactionData[] = [
  {
    id: "pay-101",
    organizationId: "org-1",
    organizationName: "Vertex Technologies Ltd.",
    planName: "Business Plan",
    amount: 149.0,
    billingCycle: "Monthly",
    transactionId: "TXN-99882211",
    senderNumber: "+880 1711-223344",
    status: "APPROVED",
    approvedAt: "2026-08-01",
    approvedBy: "Super Admin",
    referralCode: "ANTOR2026",
    createdAt: "2026-08-01",
  },
  {
    id: "pay-102",
    organizationId: "org-2",
    organizationName: "Bengal Textiles Ltd.",
    planName: "Enterprise Plan",
    amount: 319.0,
    billingCycle: "Monthly",
    transactionId: "TXN-77665544",
    senderNumber: "+880 1819-556677",
    status: "APPROVED",
    approvedAt: "2026-08-02",
    approvedBy: "Super Admin",
    referralCode: "ANTOR2026",
    createdAt: "2026-08-02",
  },
];

export class PaymentService {
  static async getPayments(organizationId?: string) {
    if (organizationId) {
      return paymentsStore.filter((p) => p.organizationId === organizationId);
    }
    return paymentsStore;
  }

  static async createPayment(data: {
    organizationId: string;
    organizationName: string;
    planName: string;
    amount: number;
    billingCycle: "Monthly" | "Yearly";
    transactionId: string;
    senderNumber?: string;
    referralCode?: string | null;
  }) {
    const existing = paymentsStore.find((p) => p.transactionId === data.transactionId);
    if (existing) {
      throw new ConflictError(`Transaction with ID '${data.transactionId}' already recorded (Idempotency Guard)`);
    }

    const newPay: PaymentTransactionData = {
      id: `pay-${Date.now()}`,
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      planName: data.planName,
      amount: data.amount,
      billingCycle: data.billingCycle,
      transactionId: data.transactionId,
      senderNumber: data.senderNumber,
      status: "PENDING",
      referralCode: data.referralCode,
      createdAt: new Date().toISOString().split("T")[0],
    };

    paymentsStore.unshift(newPay);
    return newPay;
  }

  static async updatePaymentStatus(id: string, decision: "APPROVED" | "REJECTED" | "REFUNDED", approvedBy: string) {
    const payment = paymentsStore.find((p) => p.id === id);
    if (!payment) throw new NotFoundError("Payment Record");

    // Idempotency check: don't double approve
    if (payment.status === decision) {
      return payment;
    }

    payment.status = decision;
    if (decision === "APPROVED") {
      payment.approvedAt = new Date().toISOString().split("T")[0];
      payment.approvedBy = approvedBy;

      // Automatically generate referral commission if referred
      if (payment.referralCode) {
        generateSubscriptionCommission({
          referralCode: payment.referralCode,
          orgName: payment.organizationName,
          orgEmail: "contact@org.com",
          planName: payment.planName,
          paymentAmount: payment.amount,
          billingCycle: payment.billingCycle,
        });
      }

      logAuditEvent({
        organizationId: payment.organizationId,
        userName: approvedBy,
        userRole: "SUPER_ADMIN",
        action: "PAYMENT_APPROVED",
        module: "Subscriptions",
        details: `Approved subscription payment of $${payment.amount} for ${payment.organizationName} (${payment.planName})`,
      });
    }

    return payment;
  }
}
