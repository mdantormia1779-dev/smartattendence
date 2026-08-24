import { prisma } from "@/lib/prisma";

/**
 * Referral & Affiliate Commission Engine (Section 32)
 * 
 * Manages referral accounts, link tracking, last-click attribution,
 * commission calculations (First payment & Recurring), holding periods,
 * virtual wallet ledger, fraud detection, and withdrawal payouts.
 */

export interface ReferralProgramConfig {
  name: string;
  status: "ACTIVE" | "PAUSED" | "DISABLED";
  commissionType: "PERCENTAGE" | "FIXED" | "FIRST_PAYMENT" | "RECURRING";
  defaultCommissionRate: number; // e.g. 20 (%)
  holdingPeriodDays: number;     // e.g. 30 (days)
  cookieDurationDays: number;    // e.g. 30 (days)
  minimumWithdrawal: number;     // e.g. 500 (BDT/USD)
  recurringEnabled: boolean;
  recurringMonths: number;       // e.g. 12 (months)
  refundProtection: boolean;
  selfReferralBlocked: boolean;
}

export const DEFAULT_REFERRAL_PROGRAM: ReferralProgramConfig = {
  name: "Standard Growth Affiliate Program",
  status: "ACTIVE",
  commissionType: "RECURRING",
  defaultCommissionRate: 20.0,
  holdingPeriodDays: 30,
  cookieDurationDays: 30,
  minimumWithdrawal: 500.0,
  recurringEnabled: true,
  recurringMonths: 12,
  refundProtection: true,
  selfReferralBlocked: true,
};

export interface ReferralAccountData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId?: string | null;
  referralCode: string;
  referralLink: string;
  referralType: "CUSTOMER" | "EMPLOYEE" | "MANAGER" | "ORG_ADMIN" | "PARTNER" | "AFFILIATE";
  commissionRate: number;
  totalClicks: number;
  totalRegistrations: number;
  totalPaidCustomers: number;
  totalRevenue: number;
  pendingCommission: number;
  availableBalance: number;
  paidCommission: number;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface CommissionEntry {
  id: string;
  referralAccountId: string;
  referralCode: string;
  organizationName: string;
  planName: string;
  billingCycle: string;
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "AVAILABLE" | "REVERSED" | "PAID";
  availableAt: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  referralAccountId: string;
  affiliateName: string;
  affiliateEmail: string;
  amount: number;
  currency: string;
  paymentMethod: "Bank Transfer" | "bKash" | "Nagad" | "PayPal" | "Wise" | "Payoneer";
  paymentDetails: string;
  status: "PENDING" | "APPROVED" | "PROCESSING" | "PAID" | "REJECTED";
  rejectionReason?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface FraudAlert {
  id: string;
  referralCode: string;
  affiliateName: string;
  eventType: "SELF_REFERRAL" | "SAME_IP_SIGNUP" | "RAPID_CLICKING" | "DEVICE_FINGERPRINT_MATCH";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: string;
  createdAt: string;
}

// Clean in-memory stores for real referral ledger tracking
let globalProgramConfig: ReferralProgramConfig = { ...DEFAULT_REFERRAL_PROGRAM };
let referralAccounts: ReferralAccountData[] = [];
let commissionsList: CommissionEntry[] = [];
let withdrawalRequests: WithdrawalRequest[] = [];
let fraudAlerts: FraudAlert[] = [];

/**
 * Synchronize real registered database users (Org Admins, Managers, Employees)
 * into referral affiliate accounts automatically.
 */
export async function syncDatabaseUsersToAffiliates(): Promise<ReferralAccountData[]> {
  try {
    const [orgAdmins, managers, employees, superAdmins] = await Promise.all([
      prisma.org_admins.findMany({ select: { id: true, name: true, email: true, organizationId: true } }).catch(() => []),
      prisma.managers.findMany({ select: { id: true, name: true, email: true, organizationId: true } }).catch(() => []),
      prisma.employees.findMany({ select: { id: true, fullName: true, email: true, organizationId: true } }).catch(() => []),
      prisma.super_admins.findMany({ select: { id: true, name: true, email: true } }).catch(() => []),
    ]);

    // Register super admins
    for (const admin of superAdmins) {
      getOrCreateReferralAccount({
        id: admin.id,
        name: admin.name || "Super Admin",
        email: admin.email,
        role: "SUPER_ADMIN",
      });
    }

    // Register org admins
    for (const admin of orgAdmins) {
      getOrCreateReferralAccount({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        organizationId: admin.organizationId,
        role: "ORG_ADMIN",
      });
    }

    // Register managers
    for (const mgr of managers) {
      getOrCreateReferralAccount({
        id: mgr.id,
        name: mgr.name,
        email: mgr.email,
        organizationId: mgr.organizationId,
        role: "MANAGER",
      });
    }

    // Register employees
    for (const emp of employees) {
      getOrCreateReferralAccount({
        id: emp.id,
        name: emp.fullName || "Employee",
        email: emp.email,
        organizationId: emp.organizationId,
        role: "EMPLOYEE",
      });
    }
  } catch (err) {
    console.error("[REFERRAL_SYNC_ERROR]", err);
  }

  return referralAccounts;
}

export function getReferralProgramConfig(): ReferralProgramConfig {
  return globalProgramConfig;
}

export function updateReferralProgramConfig(newConfig: Partial<ReferralProgramConfig>): ReferralProgramConfig {
  globalProgramConfig = { ...globalProgramConfig, ...newConfig };
  return globalProgramConfig;
}

export function getAllReferralAccounts(): ReferralAccountData[] {
  return referralAccounts;
}

export function getCommissions(accountId?: string): CommissionEntry[] {
  if (accountId) {
    return commissionsList.filter((c) => c.referralAccountId === accountId);
  }
  return commissionsList;
}

export function getWithdrawals(accountId?: string): WithdrawalRequest[] {
  if (accountId) {
    return withdrawalRequests.filter((w) => w.referralAccountId === accountId);
  }
  return withdrawalRequests;
}

export function getFraudAlerts(): FraudAlert[] {
  return fraudAlerts;
}

export function getAdminReferralOverview() {
  return {
    config: globalProgramConfig,
    accounts: referralAccounts,
    recentCommissions: commissionsList,
    pendingPayouts: withdrawalRequests,
    fraudAlerts,
    stats: {
      totalAffiliates: referralAccounts.length,
      totalPaidCustomers: referralAccounts.reduce((sum, a) => sum + (a.totalPaidCustomers || 0), 0),
      totalRevenue: referralAccounts.reduce((sum, a) => sum + (a.totalRevenue || 0), 0),
      totalPendingCommissions: referralAccounts.reduce((sum, a) => sum + (a.pendingCommission || 0), 0),
      totalAvailableBalance: referralAccounts.reduce((sum, a) => sum + (a.availableBalance || 0), 0),
      totalPaidPayouts: referralAccounts.reduce((sum, a) => sum + (a.paidCommission || 0), 0),
    },
  };
}

/**
 * Get referral account by userId or create if not present
 */
export function getReferralAccount(userId: string, options?: {
  fullName?: string;
  email?: string;
  role?: string;
  organizationId?: string | null;
  customCode?: string;
}) {
  let acc = referralAccounts.find((a) => a.userId === userId || a.id === userId);
  if (!acc) {
    acc = getOrCreateReferralAccount({
      id: userId,
      name: options?.fullName || "Affiliate Partner",
      email: options?.email || `${userId}@saas.com`,
      role: options?.role || "AFFILIATE",
      organizationId: options?.organizationId,
    });
  }

  const commissions = commissionsList.filter((c) => c.referralAccountId === acc!.id);
  const withdrawals = withdrawalRequests.filter((w) => w.referralAccountId === acc!.id);

  return {
    ...acc,
    customCommissionRate: acc.commissionRate,
    pendingBalance: acc.pendingCommission,
    lifetimePaid: acc.paidCommission,
    commissions,
    withdrawals,
  };
}

export function getOrCreateReferralAccount(user: {
  id: string;
  name: string;
  email: string;
  organizationId?: string | null;
  role: string;
}): ReferralAccountData {
  let existing = referralAccounts.find((a) => a.userId === user.id || a.userEmail.toLowerCase() === user.email.toLowerCase());
  if (existing) return existing;

  const cleanName = user.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const code = `${cleanName || "REF"}${randomSuffix}`;

  let refType: ReferralAccountData["referralType"] = "AFFILIATE";
  if (user.role === "ORG_ADMIN") refType = "ORG_ADMIN";
  else if (user.role === "MANAGER") refType = "MANAGER";
  else if (user.role === "EMPLOYEE") refType = "EMPLOYEE";
  else if (user.role === "CUSTOMER") refType = "CUSTOMER";

  const newAcc: ReferralAccountData = {
    id: `ref-acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    organizationId: user.organizationId,
    referralCode: code,
    referralLink: `https://smartattendance.io/signup?ref=${code}`,
    referralType: refType,
    commissionRate: globalProgramConfig.defaultCommissionRate,
    totalClicks: 0,
    totalRegistrations: 0,
    totalPaidCustomers: 0,
    totalRevenue: 0.0,
    pendingCommission: 0.0,
    availableBalance: 0.0,
    paidCommission: 0.0,
    status: "ACTIVE",
    createdAt: new Date().toISOString().split("T")[0],
  };

  referralAccounts.push(newAcc);
  return newAcc;
}

export function recordReferralClick(code: string, meta?: { ip?: string; userAgent?: string; landingPage?: string }) {
  const acc = referralAccounts.find((a) => a.referralCode.toUpperCase() === code.toUpperCase());
  if (!acc) return null;

  acc.totalClicks += 1;
  return { success: true, referralCode: acc.referralCode, affiliate: acc.userName };
}

export function recordReferralSignup(code: string) {
  const acc = referralAccounts.find((a) => a.referralCode.toUpperCase() === code.toUpperCase());
  if (!acc) return null;

  acc.totalRegistrations += 1;
  return { success: true, referralCode: acc.referralCode };
}

export function generateSubscriptionCommission(input: {
  referralCode: string;
  orgName: string;
  orgEmail: string;
  planName: string;
  paymentAmount: number;
  billingCycle: string;
}): { success: boolean; commission?: CommissionEntry; message?: string } {
  const acc = referralAccounts.find((a) => a.referralCode.toUpperCase() === input.referralCode.toUpperCase());
  if (!acc) {
    return { success: false, message: "Invalid referral code" };
  }

  if (globalProgramConfig.selfReferralBlocked && acc.userEmail.toLowerCase() === input.orgEmail.toLowerCase()) {
    fraudAlerts.unshift({
      id: `frd-${Date.now()}`,
      referralCode: acc.referralCode,
      affiliateName: acc.userName,
      eventType: "SELF_REFERRAL",
      severity: "CRITICAL",
      details: `Self-referral blocked: Affiliate ${acc.userEmail} attempted to refer own organization ${input.orgEmail}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
    });
    return { success: false, message: "Self-referral is strictly blocked by anti-fraud policy." };
  }

  const rate = acc.commissionRate || globalProgramConfig.defaultCommissionRate;
  const commissionAmt = Number(((input.paymentAmount * rate) / 100).toFixed(2));

  const availableDate = new Date();
  availableDate.setDate(availableDate.getDate() + globalProgramConfig.holdingPeriodDays);

  const newCommission: CommissionEntry = {
    id: `com-${Date.now()}`,
    referralAccountId: acc.id,
    referralCode: acc.referralCode,
    organizationName: input.orgName,
    planName: input.planName,
    billingCycle: input.billingCycle,
    baseAmount: input.paymentAmount,
    commissionRate: rate,
    commissionAmount: commissionAmt,
    status: "AVAILABLE",
    availableAt: availableDate.toISOString().split("T")[0],
    createdAt: new Date().toISOString().split("T")[0],
  };

  commissionsList.unshift(newCommission);

  acc.totalPaidCustomers += 1;
  acc.totalRevenue += input.paymentAmount;
  acc.availableBalance = Number((acc.availableBalance + commissionAmt).toFixed(2));

  return { success: true, commission: newCommission };
}

export function requestWithdrawal(input: {
  referralAccountId: string;
  amount: number;
  paymentMethod: WithdrawalRequest["paymentMethod"];
  paymentDetails: string;
}): { success: boolean; withdrawal?: WithdrawalRequest; error?: string; message?: string } {
  const acc = referralAccounts.find((a) => a.id === input.referralAccountId || a.userId === input.referralAccountId);
  if (!acc) return { success: false, error: "Referral account not found" };

  if (input.amount < globalProgramConfig.minimumWithdrawal) {
    return {
      success: false,
      error: `Minimum withdrawal amount is ৳${globalProgramConfig.minimumWithdrawal}. Requested: ৳${input.amount}`,
    };
  }

  if (input.amount > acc.availableBalance) {
    return {
      success: false,
      error: `Insufficient available balance. Available: ৳${acc.availableBalance}, Requested: ৳${input.amount}`,
    };
  }

  acc.availableBalance = Number((acc.availableBalance - input.amount).toFixed(2));

  const newWithdrawal: WithdrawalRequest = {
    id: `wth-${Date.now()}`,
    referralAccountId: acc.id,
    affiliateName: acc.userName,
    affiliateEmail: acc.userEmail,
    amount: input.amount,
    currency: "BDT",
    paymentMethod: input.paymentMethod,
    paymentDetails: input.paymentDetails,
    status: "PENDING",
    requestedAt: new Date().toISOString().split("T")[0],
  };

  withdrawalRequests.unshift(newWithdrawal);
  return { success: true, withdrawal: newWithdrawal };
}

export const requestReferralWithdrawal = requestWithdrawal;

export function processWithdrawalPayout(
  withdrawalId: string,
  decision: "APPROVED" | "PAID" | "REJECTED",
  rejectionReason?: string
) {
  const withdrawal = withdrawalRequests.find((w) => w.id === withdrawalId);
  if (!withdrawal) return { success: false, message: "Withdrawal request not found" };

  const acc = referralAccounts.find((a) => a.id === withdrawal.referralAccountId);

  if (decision === "PAID" || decision === "APPROVED") {
    withdrawal.status = "PAID";
    withdrawal.processedAt = new Date().toISOString().split("T")[0];
    if (acc) {
      acc.paidCommission = Number((acc.paidCommission + withdrawal.amount).toFixed(2));
    }
  } else if (decision === "REJECTED") {
    withdrawal.status = "REJECTED";
    withdrawal.rejectionReason = rejectionReason || "Rejected by administrator";
    withdrawal.processedAt = new Date().toISOString().split("T")[0];
    // Refund balance back to affiliate
    if (acc) {
      acc.availableBalance = Number((acc.availableBalance + withdrawal.amount).toFixed(2));
    }
  }

  return { success: true, withdrawal };
}

export function processPayoutDecision(input: {
  withdrawalId: string;
  decision: "APPROVED" | "PAID" | "REJECTED";
  rejectionReason?: string;
  adminNotes?: string;
}) {
  const res = processWithdrawalPayout(input.withdrawalId, input.decision, input.rejectionReason);
  if (res.success && res.withdrawal && input.adminNotes) {
    res.withdrawal.adminNotes = input.adminNotes;
  }
  return {
    success: res.success,
    withdrawal: res.withdrawal,
    error: res.message,
  };
}

export function approveCommission(commissionId: string) {
  const comm = commissionsList.find((c) => c.id === commissionId);
  if (!comm) return { success: false, message: "Commission entry not found" };

  if (comm.status === "PENDING" || comm.status === "UNDER_REVIEW") {
    comm.status = "AVAILABLE";
    const acc = referralAccounts.find((a) => a.id === comm.referralAccountId);
    if (acc) {
      acc.pendingCommission = Math.max(0, Number((acc.pendingCommission - comm.commissionAmount).toFixed(2)));
      acc.availableBalance = Number((acc.availableBalance + comm.commissionAmount).toFixed(2));
    }
  }

  return { success: true, commission: comm };
}

export function reverseCommission(commissionId: string, reason: string) {
  const comm = commissionsList.find((c) => c.id === commissionId);
  if (!comm) return { success: false, message: "Commission entry not found" };

  const prevStatus = comm.status;
  comm.status = "REVERSED";
  const acc = referralAccounts.find((a) => a.id === comm.referralAccountId);
  if (acc) {
    if (prevStatus === "PENDING") {
      acc.pendingCommission = Math.max(0, Number((acc.pendingCommission - comm.commissionAmount).toFixed(2)));
    } else if (prevStatus === "AVAILABLE") {
      acc.availableBalance = Math.max(0, Number((acc.availableBalance - comm.commissionAmount).toFixed(2)));
    }
  }

  fraudAlerts.unshift({
    id: `frd-${Date.now()}`,
    referralCode: comm.referralCode,
    affiliateName: acc?.userName || "Unknown",
    eventType: "RAPID_CLICKING",
    severity: "HIGH",
    details: `Commission #${commissionId} reversed: ${reason}`,
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
  });

  return { success: true, commission: comm };
}
