import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { 
  AffiliateStatus, 
  AffiliateCommissionType, 
  AffiliateCommissionStatus, 
  AffiliatePayoutMethod, 
  AffiliatePayoutStatus 
} from "@prisma/client";

export interface AffiliateProfileData {
  id: string;
  userId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  nidNumber?: string | null;
  nidDocumentUrl?: string | null;
  referralCode?: string | null;
  status: AffiliateStatus;
  balance: number;
  totalEarned: number;
  paymentMethod: AffiliatePayoutMethod;
  paymentDetails?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateSettingsData {
  oneTimeBonus: number;
  recurringPercentage: number;
  minimumPayoutThreshold: number;
  cookieDays: number;
  autoApprovePayouts: boolean;
}

export class AffiliateService {
  /**
   * Get or initialize global affiliate program settings
   */
  static async getSettings(): Promise<AffiliateSettingsData> {
    let settings = await prisma.affiliate_settings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await prisma.affiliate_settings.create({
        data: {
          id: "global",
          oneTimeBonus: 500.0,
          recurringPercentage: 20.0,
          minimumPayoutThreshold: 500.0,
          cookieDays: 30,
          autoApprovePayouts: false,
        },
      });
    } else if (Number(settings.recurringPercentage) < 20) {
      settings = await prisma.affiliate_settings.update({
        where: { id: "global" },
        data: { recurringPercentage: 20.0 },
      });
    }

    return {
      oneTimeBonus: Number(settings.oneTimeBonus),
      recurringPercentage: Number(settings.recurringPercentage),
      minimumPayoutThreshold: Number(settings.minimumPayoutThreshold),
      cookieDays: settings.cookieDays,
      autoApprovePayouts: settings.autoApprovePayouts,
    };
  }

  /**
   * Update global affiliate settings
   */
  static async updateSettings(updates: Partial<AffiliateSettingsData>): Promise<AffiliateSettingsData> {
    const updated = await prisma.affiliate_settings.upsert({
      where: { id: "global" },
      update: {
        ...(updates.oneTimeBonus !== undefined && { oneTimeBonus: updates.oneTimeBonus }),
        ...(updates.recurringPercentage !== undefined && { recurringPercentage: updates.recurringPercentage }),
        ...(updates.minimumPayoutThreshold !== undefined && { minimumPayoutThreshold: updates.minimumPayoutThreshold }),
        ...(updates.cookieDays !== undefined && { cookieDays: updates.cookieDays }),
        ...(updates.autoApprovePayouts !== undefined && { autoApprovePayouts: updates.autoApprovePayouts }),
      },
      create: {
        id: "global",
        oneTimeBonus: updates.oneTimeBonus ?? 500.0,
        recurringPercentage: updates.recurringPercentage ?? 10.0,
        minimumPayoutThreshold: updates.minimumPayoutThreshold ?? 500.0,
        cookieDays: updates.cookieDays ?? 30,
        autoApprovePayouts: updates.autoApprovePayouts ?? false,
      },
    });

    return {
      oneTimeBonus: Number(updated.oneTimeBonus),
      recurringPercentage: Number(updated.recurringPercentage),
      minimumPayoutThreshold: Number(updated.minimumPayoutThreshold),
      cookieDays: updated.cookieDays,
      autoApprovePayouts: updated.autoApprovePayouts,
    };
  }

  /**
   * Public affiliate partner application
   */
  static async apply(data: {
    fullName: string;
    email: string;
    phone: string;
    nidNumber?: string;
    nidDocumentUrl?: string;
    paymentMethod: AffiliatePayoutMethod;
    paymentDetails: string;
    userId?: string;
  }): Promise<AffiliateProfileData> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existing = await prisma.affiliate_profiles.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.status === AffiliateStatus.PENDING) {
        throw new ConflictError("You have already submitted an affiliate application. Your account is currently under review by our compliance team.");
      } else if (existing.status === AffiliateStatus.APPROVED) {
        throw new ConflictError("An approved affiliate partner account already exists with this email. Please log in directly.");
      } else if (existing.status === AffiliateStatus.SUSPENDED) {
        throw new ConflictError("This affiliate account has been suspended. Please contact support.");
      }
    }

    const created = await prisma.affiliate_profiles.create({
      data: {
        id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: data.userId || null,
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        phone: data.phone.trim(),
        nidNumber: data.nidNumber?.trim() || null,
        nidDocumentUrl: data.nidDocumentUrl?.trim() || null,
        paymentMethod: data.paymentMethod || AffiliatePayoutMethod.BKASH,
        paymentDetails: data.paymentDetails.trim(),
        status: AffiliateStatus.PENDING,
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      fullName: created.fullName,
      email: created.email,
      phone: created.phone,
      nidNumber: created.nidNumber,
      nidDocumentUrl: created.nidDocumentUrl,
      referralCode: created.referralCode,
      status: created.status,
      balance: Number(created.balance),
      totalEarned: Number(created.totalEarned),
      paymentMethod: created.paymentMethod,
      paymentDetails: created.paymentDetails,
      rejectionReason: created.rejectionReason,
      createdAt: created.createdAt.toISOString().split("T")[0],
      updatedAt: created.updatedAt.toISOString().split("T")[0],
    };
  }

  /**
   * Get affiliate dashboard portal data by identifier (email, ID, or referral code)
   */
  static async getAffiliatePortalData(identifier: string) {
    const cleanId = identifier.trim();
    const profile = await prisma.affiliate_profiles.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { email: cleanId.toLowerCase() },
          { referralCode: cleanId.toUpperCase() },
        ],
      },
      include: {
        referrals: {
          orderBy: { createdAt: "desc" },
          include: {
            organization: true,
          },
        },
        commissions: {
          orderBy: { createdAt: "desc" },
          include: {
            referral: {
              include: {
                organization: true,
              },
            },
          },
        },
        payouts: {
          orderBy: { requestedAt: "desc" },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Affiliate Partner");
    }

    const settings = await this.getSettings();

    const activeSubscriptions = profile.referrals.filter((r) => r.status === "ACTIVE").length;
    const totalRevenueGenerated = profile.referrals.reduce((sum, r) => sum + Number(r.totalRevenue), 0);

    return {
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        nidNumber: profile.nidNumber,
        nidDocumentUrl: profile.nidDocumentUrl,
        referralCode: profile.referralCode,
        referralLink: profile.referralCode ? `https://smartattendance.io/signup?ref=${profile.referralCode}` : null,
        status: profile.status,
        balance: Number(profile.balance),
        totalEarned: Number(profile.totalEarned),
        paymentMethod: profile.paymentMethod,
        paymentDetails: profile.paymentDetails,
        rejectionReason: profile.rejectionReason,
        createdAt: profile.createdAt.toISOString().split("T")[0],
      },
      stats: {
        balance: Number(profile.balance),
        totalEarned: Number(profile.totalEarned),
        totalReferrals: profile.referrals.length,
        activeSubscriptions,
        totalRevenueGenerated,
        minimumPayoutThreshold: settings.minimumPayoutThreshold,
        oneTimeBonusRate: settings.oneTimeBonus,
        recurringPercentageRate: settings.recurringPercentage,
      },
      referrals: profile.referrals.map((r) => ({
        id: r.id,
        organizationName: r.organization?.name || r.referredEmail || "Client Organization",
        referredEmail: r.referredEmail || r.organization?.email || "N/A",
        status: r.status,
        firstPaymentCommissionPaid: r.firstPaymentCommissionPaid,
        totalRevenue: Number(r.totalRevenue),
        joinedDate: r.createdAt.toISOString().split("T")[0],
      })),
      commissions: profile.commissions.map((c) => ({
        id: c.id,
        organizationName: c.referral?.organization?.name || "Subscription Billing",
        amount: Number(c.amount),
        ratePercentage: c.ratePercentage ? Number(c.ratePercentage) : null,
        commissionType: c.commissionType,
        status: c.status,
        notes: c.notes || (c.commissionType === AffiliateCommissionType.ONE_TIME ? "One-Time First Payment Bonus" : "Monthly Recurring Passive Commission"),
        date: c.createdAt.toISOString().split("T")[0],
      })),
      payouts: profile.payouts.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        payoutMethod: p.payoutMethod,
        accountDetails: p.accountDetails,
        status: p.status,
        transactionId: p.transactionId,
        rejectionReason: p.rejectionReason,
        requestedAt: p.requestedAt.toISOString().split("T")[0],
        processedAt: p.processedAt ? p.processedAt.toISOString().split("T")[0] : null,
      })),
    };
  }

  /**
   * Track / Attribute a newly registered organization or client to an affiliate
   */
  static async trackReferral(referralCode: string, organizationId?: string, referredEmail?: string) {
    if (!referralCode) return null;

    const affiliate = await prisma.affiliate_profiles.findFirst({
      where: {
        referralCode: referralCode.trim().toUpperCase(),
        status: AffiliateStatus.APPROVED,
      },
    });

    if (!affiliate) return null;

    // Check if referral relation already exists
    const existing = await prisma.affiliate_referrals.findFirst({
      where: {
        affiliateId: affiliate.id,
        OR: [
          ...(organizationId ? [{ organizationId }] : []),
          ...(referredEmail ? [{ referredEmail: referredEmail.toLowerCase() }] : []),
        ],
      },
    });

    if (existing) {
      if (organizationId && !existing.organizationId) {
        await prisma.affiliate_referrals.update({
          where: { id: existing.id },
          data: { organizationId },
        });
      }
      return existing;
    }

    return await prisma.affiliate_referrals.create({
      data: {
        id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        affiliateId: affiliate.id,
        organizationId: organizationId || null,
        referredEmail: referredEmail?.toLowerCase() || null,
        status: "ACTIVE",
        firstPaymentCommissionPaid: false,
        totalRevenue: 0,
      },
    });
  }

  /**
   * Automated Commission Calculation & Distribution Engine (One-Time + Recurring 20% Passive)
   */
  static async processPaymentCommission(params: {
    paymentId: string;
    organizationId: string;
    amount: number;
    referralCode?: string | null;
  }) {
    if (params.amount <= 0 || !params.organizationId) return null;

    // 1. Find if this organization is bound to an active affiliate referral
    let referral = await prisma.affiliate_referrals.findFirst({
      where: {
        organizationId: params.organizationId,
        status: "ACTIVE",
      },
      include: {
        affiliate: true,
      },
    });

    // 2. If not already bound, bind by referral/promo code if provided
    if (!referral && params.referralCode) {
      const affiliate = await prisma.affiliate_profiles.findFirst({
        where: {
          referralCode: params.referralCode.trim().toUpperCase(),
          status: AffiliateStatus.APPROVED,
        },
      });

      if (affiliate) {
        referral = await prisma.affiliate_referrals.create({
          data: {
            id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            affiliateId: affiliate.id,
            organizationId: params.organizationId,
            status: "ACTIVE",
            firstPaymentCommissionPaid: false,
            totalRevenue: 0,
          },
          include: {
            affiliate: true,
          },
        });
      }
    }

    if (!referral || referral.affiliate.status !== AffiliateStatus.APPROVED) {
      return null;
    }

    const settings = await this.getSettings();
    const createdCommissions = [];
    let totalCreditedAmount = 0;

    // 1. One-Time First Payment Commission
    if (!referral.firstPaymentCommissionPaid && settings.oneTimeBonus > 0) {
      const oneTimeAmount = settings.oneTimeBonus;
      const oneTimeComm = await prisma.affiliate_commissions.create({
        data: {
          id: `comm-one-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          affiliateId: referral.affiliateId,
          referralId: referral.id,
          amount: oneTimeAmount,
          commissionType: AffiliateCommissionType.ONE_TIME,
          sourcePaymentId: params.paymentId,
          status: AffiliateCommissionStatus.CREDITED,
          notes: `Instant One-Time Onboarding Bonus (First Paid Invoice)`,
        },
      });

      createdCommissions.push(oneTimeComm);
      totalCreditedAmount += oneTimeAmount;

      await prisma.affiliate_referrals.update({
        where: { id: referral.id },
        data: {
          firstPaymentCommissionPaid: true,
        },
      });
    }

    // 2. Recurring Passive Percentage Commission
    if (settings.recurringPercentage > 0) {
      const recurringAmount = Math.round(((params.amount * settings.recurringPercentage) / 100) * 100) / 100;
      if (recurringAmount > 0) {
        const recurringComm = await prisma.affiliate_commissions.create({
          data: {
            id: `comm-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            affiliateId: referral.affiliateId,
            referralId: referral.id,
            amount: recurringAmount,
            ratePercentage: settings.recurringPercentage,
            commissionType: AffiliateCommissionType.RECURRING_PERCENTAGE,
            sourcePaymentId: params.paymentId,
            status: AffiliateCommissionStatus.CREDITED,
            notes: `Passive Monthly Recurring Share (${settings.recurringPercentage}% of invoice)`,
          },
        });

        createdCommissions.push(recurringComm);
        totalCreditedAmount += recurringAmount;
      }
    }

    // Atomically credit balance & totalEarned to affiliate profile and increment referral revenue
    if (totalCreditedAmount > 0) {
      await prisma.$transaction([
        prisma.affiliate_profiles.update({
          where: { id: referral.affiliateId },
          data: {
            balance: { increment: totalCreditedAmount },
            totalEarned: { increment: totalCreditedAmount },
          },
        }),
        prisma.affiliate_referrals.update({
          where: { id: referral.id },
          data: {
            totalRevenue: { increment: params.amount },
          },
        }),
      ]);
    }

    return {
      affiliateId: referral.affiliateId,
      totalCredited: totalCreditedAmount,
      commissions: createdCommissions,
    };
  }

  /**
   * Affiliate requests a withdrawal / payout
   */
  static async requestPayout(data: {
    affiliateId: string;
    amount: number;
    payoutMethod: AffiliatePayoutMethod;
    accountDetails: string;
  }) {
    const profile = await prisma.affiliate_profiles.findUnique({
      where: { id: data.affiliateId },
    });

    if (!profile) throw new NotFoundError("Affiliate Profile");
    if (profile.status !== AffiliateStatus.APPROVED) {
      throw new ValidationError("Only approved active affiliates can request payouts.");
    }

    const settings = await this.getSettings();
    if (data.amount < settings.minimumPayoutThreshold) {
      throw new ValidationError(`Minimum withdrawal request is ${settings.minimumPayoutThreshold} BDT.`);
    }

    const currentBalance = Number(profile.balance);
    if (currentBalance < data.amount) {
      throw new ValidationError(`Insufficient balance. Your current available balance is ${currentBalance.toFixed(2)} BDT.`);
    }

    // Deduct balance and create payout request in transaction
    const [payout, updatedProfile] = await prisma.$transaction([
      prisma.affiliate_payouts.create({
        data: {
          id: `payout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          affiliateId: profile.id,
          amount: data.amount,
          payoutMethod: data.payoutMethod,
          accountDetails: data.accountDetails.trim(),
          status: AffiliatePayoutStatus.REQUESTED,
        },
      }),
      prisma.affiliate_profiles.update({
        where: { id: profile.id },
        data: {
          balance: { decrement: data.amount },
        },
      }),
    ]);

    return {
      payoutId: payout.id,
      amount: Number(payout.amount),
      remainingBalance: Number(updatedProfile.balance),
      status: payout.status,
      requestedAt: payout.requestedAt.toISOString().split("T")[0],
    };
  }

  /**
   * Super Admin - List all affiliates with optional status & search filter
   */
  static async adminGetAffiliates(query?: { status?: string; search?: string }) {
    const where: any = {};

    if (query?.status && query.status !== "ALL") {
      where.status = query.status as AffiliateStatus;
    }

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { fullName: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
        { referralCode: { contains: s, mode: "insensitive" } },
      ];
    }

    const items = await prisma.affiliate_profiles.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            referrals: true,
            commissions: true,
            payouts: true,
          },
        },
        referrals: {
          select: {
            totalRevenue: true,
            status: true,
          },
        },
      },
    });

    return items.map((p) => {
      const totalRevenue = p.referrals.reduce((sum, r) => sum + Number(r.totalRevenue), 0);
      const activeReferrals = p.referrals.filter((r) => r.status === "ACTIVE").length;

      return {
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        nidNumber: p.nidNumber,
        nidDocumentUrl: p.nidDocumentUrl,
        referralCode: p.referralCode,
        status: p.status,
        balance: Number(p.balance),
        totalEarned: Number(p.totalEarned),
        paymentMethod: p.paymentMethod,
        paymentDetails: p.paymentDetails,
        rejectionReason: p.rejectionReason,
        totalReferrals: p._count.referrals,
        activeReferrals,
        totalRevenueGenerated: totalRevenue,
        createdAt: p.createdAt.toISOString().split("T")[0],
      };
    });
  }

  /**
   * Super Admin - Approve affiliate application and generate unique referral link
   */
  static async adminApproveAffiliate(id: string, customCode?: string) {
    const profile = await prisma.affiliate_profiles.findUnique({
      where: { id },
    });

    if (!profile) throw new NotFoundError("Affiliate Application");

    let finalCode = customCode?.trim().toUpperCase();
    if (!finalCode) {
      const prefix = profile.fullName.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "AFF";
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      finalCode = `${prefix}${randomPart}`;
    }

    // Check code collision
    const existingCode = await prisma.affiliate_profiles.findUnique({
      where: { referralCode: finalCode },
    });
    if (existingCode && existingCode.id !== profile.id) {
      finalCode = `AFF${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const updated = await prisma.affiliate_profiles.update({
      where: { id },
      data: {
        status: AffiliateStatus.APPROVED,
        referralCode: finalCode,
        rejectionReason: null,
      },
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      referralCode: updated.referralCode,
      referralLink: `https://smartattendance.io/signup?ref=${updated.referralCode}`,
      status: updated.status,
    };
  }

  /**
   * Super Admin - Reject affiliate application
   */
  static async adminRejectAffiliate(id: string, reason: string) {
    const profile = await prisma.affiliate_profiles.findUnique({
      where: { id },
    });

    if (!profile) throw new NotFoundError("Affiliate Application");

    const updated = await prisma.affiliate_profiles.update({
      where: { id },
      data: {
        status: AffiliateStatus.REJECTED,
        rejectionReason: reason.trim() || "NID / Verification details could not be validated.",
      },
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      status: updated.status,
      rejectionReason: updated.rejectionReason,
    };
  }

  /**
   * Super Admin - List all payout / withdrawal requests
   */
  static async adminGetPayouts(query?: { status?: string }) {
    const where: any = {};
    if (query?.status && query.status !== "ALL") {
      where.status = query.status as AffiliatePayoutStatus;
    }

    const payouts = await prisma.affiliate_payouts.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      include: {
        affiliate: true,
      },
    });

    return payouts.map((p) => ({
      id: p.id,
      affiliateId: p.affiliateId,
      affiliateName: p.affiliate.fullName,
      affiliateEmail: p.affiliate.email,
      affiliatePhone: p.affiliate.phone,
      amount: Number(p.amount),
      payoutMethod: p.payoutMethod,
      accountDetails: p.accountDetails,
      status: p.status,
      transactionId: p.transactionId,
      rejectionReason: p.rejectionReason,
      requestedAt: p.requestedAt.toISOString().split("T")[0],
      processedAt: p.processedAt ? p.processedAt.toISOString().split("T")[0] : null,
    }));
  }

  /**
   * Super Admin - Process payout request (Complete with TrxID or Reject & Refund balance)
   */
  static async adminProcessPayout(
    payoutId: string,
    decision: "COMPLETED" | "REJECTED",
    transactionId?: string,
    rejectionReason?: string
  ) {
    const payout = await prisma.affiliate_payouts.findUnique({
      where: { id: payoutId },
      include: { affiliate: true },
    });

    if (!payout) throw new NotFoundError("Payout Request");
    if (payout.status !== AffiliatePayoutStatus.REQUESTED && payout.status !== AffiliatePayoutStatus.PROCESSING) {
      throw new ValidationError(`Payout request is already ${payout.status.toLowerCase()}.`);
    }

    if (decision === "COMPLETED") {
      const updated = await prisma.affiliate_payouts.update({
        where: { id: payoutId },
        data: {
          status: AffiliatePayoutStatus.COMPLETED,
          transactionId: transactionId?.trim() || `TRX-${Date.now()}`,
          processedAt: new Date(),
        },
      });

      return {
        id: updated.id,
        status: updated.status,
        transactionId: updated.transactionId,
        processedAt: updated.processedAt?.toISOString(),
      };
    } else {
      // Rejection: refund the deducted balance back to affiliate's account
      const [updatedPayout, updatedProfile] = await prisma.$transaction([
        prisma.affiliate_payouts.update({
          where: { id: payoutId },
          data: {
            status: AffiliatePayoutStatus.REJECTED,
            rejectionReason: rejectionReason?.trim() || "Invalid account details or failed disbursement",
            processedAt: new Date(),
          },
        }),
        prisma.affiliate_profiles.update({
          where: { id: payout.affiliateId },
          data: {
            balance: { increment: payout.amount },
          },
        }),
      ]);

      return {
        id: updatedPayout.id,
        status: updatedPayout.status,
        rejectionReason: updatedPayout.rejectionReason,
        refundedBalance: Number(updatedProfile.balance),
      };
    }
  }
}
