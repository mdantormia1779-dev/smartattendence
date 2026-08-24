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
  minimumWithdrawal: number;     // e.g. $50
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
  minimumWithdrawal: 50.0,
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

// In-Memory Database store for demo & production API fallback
let globalProgramConfig: ReferralProgramConfig = { ...DEFAULT_REFERRAL_PROGRAM };

let referralAccounts: ReferralAccountData[] = [
  {
    id: "ref-acc-1",
    userId: "user-super-1",
    userName: "Md Antor",
    userEmail: "antor@saas.com",
    referralCode: "ANTOR2026",
    referralLink: "https://smartattendance.io/signup?ref=ANTOR2026",
    referralType: "AFFILIATE",
    commissionRate: 20.0,
    totalClicks: 1240,
    totalRegistrations: 86,
    totalPaidCustomers: 32,
    totalRevenue: 4800.0,
    pendingCommission: 320.0,
    availableBalance: 580.0,
    paidCommission: 1240.0,
    status: "ACTIVE",
    createdAt: "2026-01-15",
  },
  {
    id: "ref-acc-2",
    userId: "user-org-1",
    userName: "Sarah Jenkins (Vertex Tech)",
    userEmail: "sarah.admin@vertextech.io",
    organizationId: "org-1",
    referralCode: "VERTEX2026",
    referralLink: "https://smartattendance.io/signup?ref=VERTEX2026",
    referralType: "ORG_ADMIN",
    commissionRate: 20.0,
    totalClicks: 320,
    totalRegistrations: 18,
    totalPaidCustomers: 6,
    totalRevenue: 1200.0,
    pendingCommission: 90.0,
    availableBalance: 150.0,
    paidCommission: 0.0,
    status: "ACTIVE",
    createdAt: "2026-03-10",
  },
  {
    id: "ref-acc-3",
    userId: "user-emp-1",
    userName: "Arif Chowdhury",
    userEmail: "arif.c@vertextech.io",
    organizationId: "org-1",
    referralCode: "ARIF-EMP1042",
    referralLink: "https://smartattendance.io/signup?ref=ARIF-EMP1042",
    referralType: "EMPLOYEE",
    commissionRate: 15.0,
    totalClicks: 145,
    totalRegistrations: 8,
    totalPaidCustomers: 3,
    totalRevenue: 450.0,
    pendingCommission: 45.0,
    availableBalance: 67.5,
    paidCommission: 0.0,
    status: "ACTIVE",
    createdAt: "2026-04-05",
  },
];

let commissionsList: CommissionEntry[] = [
  {
    id: "com-101",
    referralAccountId: "ref-acc-1",
    referralCode: "ANTOR2026",
    organizationName: "Bengal Textiles Ltd.",
    planName: "Enterprise Plan",
    billingCycle: "Monthly",
    baseAmount: 319.0,
    commissionRate: 20.0,
    commissionAmount: 63.8,
    status: "AVAILABLE",
    availableAt: "2026-07-02",
    createdAt: "2026-06-02",
  },
  {
    id: "com-102",
    referralAccountId: "ref-acc-1",
    referralCode: "ANTOR2026",
    organizationName: "CareMed Hospital",
    planName: "Business Plan",
    billingCycle: "Monthly",
    baseAmount: 149.0,
    commissionRate: 20.0,
    commissionAmount: 29.8,
    status: "AVAILABLE",
    availableAt: "2026-08-01",
    createdAt: "2026-07-01",
  },
  {
    id: "com-103",
    referralAccountId: "ref-acc-1",
    referralCode: "ANTOR2026",
    organizationName: "Nova IT Hub",
    planName: "Business Plan",
    billingCycle: "Monthly",
    baseAmount: 149.0,
    commissionRate: 20.0,
    commissionAmount: 29.8,
    status: "PENDING",
    availableAt: "2026-09-15",
    createdAt: "2026-08-15",
  },
  {
    id: "com-104",
    referralAccountId: "ref-acc-2",
    referralCode: "VERTEX2026",
    organizationName: "Apex Logistics Ltd.",
    planName: "Starter Plan",
    billingCycle: "Monthly",
    baseAmount: 39.0,
    commissionRate: 20.0,
    commissionAmount: 7.8,
    status: "AVAILABLE",
    availableAt: "2026-08-10",
    createdAt: "2026-07-10",
  },
  {
    id: "com-105",
    referralAccountId: "ref-acc-3",
    referralCode: "ARIF-EMP1042",
    organizationName: "CloudTech Software",
    planName: "Business Plan",
    billingCycle: "Monthly",
    baseAmount: 149.0,
    commissionRate: 15.0,
    commissionAmount: 22.35,
    status: "AVAILABLE",
    availableAt: "2026-08-05",
    createdAt: "2026-07-05",
  },
];

let withdrawalRequests: WithdrawalRequest[] = [
  {
    id: "wth-1",
    referralAccountId: "ref-acc-1",
    affiliateName: "Md Antor",
    affiliateEmail: "antor@saas.com",
    amount: 500.0,
    currency: "USD",
    paymentMethod: "Bank Transfer",
    paymentDetails: "City Bank BD - A/C 110293849102",
    status: "PAID",
    requestedAt: "2026-07-10",
    processedAt: "2026-07-11",
  },
  {
    id: "wth-2",
    referralAccountId: "ref-acc-1",
    affiliateName: "Md Antor",
    affiliateEmail: "antor@saas.com",
    amount: 250.0,
    currency: "USD",
    paymentMethod: "bKash",
    paymentDetails: "+880 1711-223344 (Personal)",
    status: "PENDING",
    requestedAt: "2026-08-18",
  },
  {
    id: "wth-3",
    referralAccountId: "ref-acc-3",
    affiliateName: "Arif Chowdhury",
    affiliateEmail: "arif.c@vertextech.io",
    amount: 60.0,
    currency: "USD",
    paymentMethod: "bKash",
    paymentDetails: "+880 1712-100201 (Personal)",
    status: "PENDING",
    requestedAt: "2026-08-20",
  },
];

let fraudAlerts: FraudAlert[] = [
  {
    id: "frd-1",
    referralCode: "ANTOR2026",
    affiliateName: "Md Antor",
    eventType: "SAME_IP_SIGNUP",
    severity: "LOW",
    details: "Visitor and registering org matched subnet (103.14.24.xx). Passed fraud evaluation.",
    createdAt: "2026-08-10 14:22:00",
  },
];

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
  let existing = referralAccounts.find((a) => a.userId === user.id);
  if (existing) return existing;

  const cleanName = user.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const code = `${cleanName || "REF"}${randomSuffix}`;

  let refType: ReferralAccountData["referralType"] = "AFFILIATE";
  if (user.role === "ORG_ADMIN") refType = "ORG_ADMIN";
  else if (user.role === "MANAGER") refType = "MANAGER";
  else if (user.role === "EMPLOYEE") refType = "EMPLOYEE";
  else if (user.role === "CUSTOMER") refType = "CUSTOMER";

  const newAcc: ReferralAccountData = {
    id: `ref-acc-${Date.now()}`,
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
    status: "PENDING",
    availableAt: availableDate.toISOString().split("T")[0],
    createdAt: new Date().toISOString().split("T")[0],
  };

  commissionsList.unshift(newCommission);

  acc.totalPaidCustomers += 1;
  acc.totalRevenue += input.paymentAmount;
  acc.pendingCommission = Number((acc.pendingCommission + commissionAmt).toFixed(2));

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
      error: `Minimum withdrawal amount is $${globalProgramConfig.minimumWithdrawal}. Requested: $${input.amount}`,
    };
  }

  if (input.amount > acc.availableBalance) {
    return {
      success: false,
      error: `Insufficient available balance. You have $${acc.availableBalance} available.`,
    };
  }

  acc.availableBalance = Number((acc.availableBalance - input.amount).toFixed(2));

  const newWithdrawal: WithdrawalRequest = {
    id: `wth-${Date.now()}`,
    referralAccountId: acc.id,
    affiliateName: acc.userName,
    affiliateEmail: acc.userEmail,
    amount: input.amount,
    currency: "USD",
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
  options?: { adminNotes?: string; rejectionReason?: string } | string
): { success: boolean; withdrawal?: WithdrawalRequest; error?: string } {
  const w = withdrawalRequests.find((item) => item.id === withdrawalId);
  if (!w) return { success: false, error: "Withdrawal not found" };

  const acc = referralAccounts.find((a) => a.id === w.referralAccountId);
  const rejectionReason = typeof options === "string" ? options : options?.rejectionReason;
  const adminNotes = typeof options === "object" ? options?.adminNotes : undefined;

  if (decision === "PAID") {
    w.status = "PAID";
    w.processedAt = new Date().toISOString().split("T")[0];
    if (adminNotes) w.adminNotes = adminNotes;
    if (acc) {
      acc.paidCommission = Number((acc.paidCommission + w.amount).toFixed(2));
    }
  } else if (decision === "REJECTED") {
    w.status = "REJECTED";
    w.rejectionReason = rejectionReason || "Invalid payout information";
    if (adminNotes) w.adminNotes = adminNotes;
    if (acc) {
      acc.availableBalance = Number((acc.availableBalance + w.amount).toFixed(2));
    }
  } else if (decision === "APPROVED") {
    w.status = "APPROVED";
    if (adminNotes) w.adminNotes = adminNotes;
  }

  return { success: true, withdrawal: w };
}

export const processPayoutDecision = (args: { withdrawalId: string; decision: "APPROVED" | "PAID" | "REJECTED"; adminNotes?: string; rejectionReason?: string }) => {
  return processWithdrawalPayout(args.withdrawalId, args.decision, { adminNotes: args.adminNotes, rejectionReason: args.rejectionReason });
};

export function getReferralProgramConfig() {
  return globalProgramConfig;
}

export function updateReferralProgramConfig(updated: Partial<ReferralProgramConfig>) {
  globalProgramConfig = { ...globalProgramConfig, ...updated };
  return globalProgramConfig;
}

export function getAllReferralAccounts() {
  return referralAccounts;
}

export function getCommissions(referralAccountId?: string) {
  if (!referralAccountId) return commissionsList;
  return commissionsList.filter((c) => c.referralAccountId === referralAccountId);
}

export function getWithdrawals(referralAccountId?: string) {
  if (!referralAccountId) return withdrawalRequests;
  return withdrawalRequests.filter((w) => w.referralAccountId === referralAccountId);
}

export function getFraudAlerts() {
  return fraudAlerts;
}

export function getAdminReferralOverview() {
  const totalAffiliates = referralAccounts.length;
  const totalRevenue = referralAccounts.reduce((s, a) => s + a.totalRevenue, 0);
  const totalPaid = referralAccounts.reduce((s, a) => s + a.paidCommission, 0);
  const pendingPayoutsList = withdrawalRequests.filter((w) => w.status === "PENDING");
  const pendingPayoutsTotal = pendingPayoutsList.reduce((s, w) => s + w.amount, 0);

  return {
    totalAffiliates,
    totalRevenue,
    totalPaid,
    pendingPayoutsTotal,
    pendingPayoutsCount: pendingPayoutsList.length,
    programConfig: globalProgramConfig,
    affiliates: referralAccounts,
    recentCommissions: commissionsList,
    pendingPayouts: pendingPayoutsList,
    fraudAlerts,
  };
}
