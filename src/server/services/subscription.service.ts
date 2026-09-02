import { prisma } from "@/lib/prisma";
import { NotFoundError, PlanLimitExceededError } from "../errors";
import { SubscriptionPlanType } from "@prisma/client";

export interface TrialSettingsData {
  defaultTrialDays: number;
  trialPlanId: string;
  allowCardlessTrial: boolean;
  autoExtendOnRequest: boolean;
  maxExtensionDays: number;
}

let trialSettingsStore: TrialSettingsData = {
  defaultTrialDays: 30,
  trialPlanId: "plan-free",
  allowCardlessTrial: true,
  autoExtendOnRequest: false,
  maxExtensionDays: 7,
};

export interface SubscriptionPlanData {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  tier: "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE";
  price: number;
  monthlyPrice: number;
  yearlyPrice: number;
  billingCycle: string;
  maxBranches: number | null;
  maxManagers: number | null;
  maxEmployees: number | null;
  faceRecognition: boolean;
  gpsVerification: boolean;
  fingerprint: boolean;
  payroll: boolean;
  analytics: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  activeSubscribers: number;
  createdAt: string;
}

const DEFAULT_PLANS = [
  {
    id: "plan-free",
    name: "30-Day Free Trial",
    type: SubscriptionPlanType.FREE,
    price: 0,
    billingCycle: "30-Day Trial",
    maxBranches: 2,
    maxManagers: 3,
    maxEmployees: 30,
    faceRecognition: true,
    gpsVerification: true,
    fingerprint: true,
    payroll: true,
    analytics: true,
    apiAccess: false,
    whiteLabel: false,
    customDomain: false,
    prioritySupport: false,
  },
  {
    id: "plan-starter",
    name: "Starter Plan",
    type: SubscriptionPlanType.STARTER,
    price: 39,
    billingCycle: "monthly",
    maxBranches: 2,
    maxManagers: 3,
    maxEmployees: 50,
    faceRecognition: true,
    gpsVerification: true,
    fingerprint: false,
    payroll: false,
    analytics: true,
    apiAccess: false,
    whiteLabel: false,
    customDomain: false,
    prioritySupport: false,
  },
  {
    id: "plan-business",
    name: "Business Plan",
    type: SubscriptionPlanType.BUSINESS,
    price: 99,
    billingCycle: "monthly",
    maxBranches: 10,
    maxManagers: 20,
    maxEmployees: 300,
    faceRecognition: true,
    gpsVerification: true,
    fingerprint: true,
    payroll: true,
    analytics: true,
    apiAccess: true,
    whiteLabel: false,
    customDomain: false,
    prioritySupport: true,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise Plan",
    type: SubscriptionPlanType.ENTERPRISE,
    price: 299,
    billingCycle: "monthly",
    maxBranches: null,
    maxManagers: null,
    maxEmployees: null,
    faceRecognition: true,
    gpsVerification: true,
    fingerprint: true,
    payroll: true,
    analytics: true,
    apiAccess: true,
    whiteLabel: true,
    customDomain: true,
    prioritySupport: true,
  },
];

const VALID_PLAN_TYPES: SubscriptionPlanType[] = [
  SubscriptionPlanType.FREE,
  SubscriptionPlanType.STARTER,
  SubscriptionPlanType.BUSINESS,
  SubscriptionPlanType.ENTERPRISE,
];

function isSubscriptionPlanType(val: string): val is SubscriptionPlanType {
  return VALID_PLAN_TYPES.includes(val?.toUpperCase() as SubscriptionPlanType);
}

function buildPlanWhereClause(id: string) {
  if (!id) return { id: "unknown-plan" };
  const cleanId = id.trim();
  const upper = cleanId.toUpperCase();
  
  let matchedType: SubscriptionPlanType | null = null;
  if (isSubscriptionPlanType(upper)) {
    matchedType = upper;
  } else if (upper.includes("FREE")) {
    matchedType = SubscriptionPlanType.FREE;
  } else if (upper.includes("STARTER")) {
    matchedType = SubscriptionPlanType.STARTER;
  } else if (upper.includes("BUSINESS")) {
    matchedType = SubscriptionPlanType.BUSINESS;
  } else if (upper.includes("ENTERPRISE")) {
    matchedType = SubscriptionPlanType.ENTERPRISE;
  }

  if (matchedType) {
    return {
      OR: [
        { id: cleanId },
        { type: matchedType },
      ],
    };
  }
  return { id: cleanId };
}

async function resolveOrganizationId(inputOrgId?: string | null): Promise<string> {
  if (inputOrgId && inputOrgId !== "org-1" && inputOrgId !== "default") {
    const directMatch = await prisma.organizations.findUnique({
      where: { id: inputOrgId },
      select: { id: true },
    }).catch(() => null);
    if (directMatch) return directMatch.id;
  }

  const firstOrg = await prisma.organizations.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  }).catch(() => null);

  if (firstOrg) return firstOrg.id;

  return inputOrgId || "org-1";
}

function mapToPlanData(p: any): SubscriptionPlanData {
  const priceNum = Number(p.price) || 0;
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    tier: p.type as "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE",
    price: priceNum,
    monthlyPrice: priceNum,
    yearlyPrice: priceNum * 10,
    billingCycle: p.billingCycle || "monthly",
    maxBranches: p.maxBranches ?? null,
    maxManagers: p.maxManagers ?? null,
    maxEmployees: p.maxEmployees ?? null,
    faceRecognition: !!p.faceRecognition,
    gpsVerification: !!p.gpsVerification,
    fingerprint: !!p.fingerprint,
    payroll: !!p.payroll,
    analytics: !!p.analytics,
    apiAccess: !!p.apiAccess,
    whiteLabel: !!p.whiteLabel,
    customDomain: !!p.customDomain,
    prioritySupport: !!p.prioritySupport,
    activeSubscribers: p._count?.subscriptions ?? p.subscriptions?.length ?? 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

export class SubscriptionService {
  /**
   * Trial settings management
   */
  static async getTrialSettings(): Promise<TrialSettingsData> {
    return trialSettingsStore;
  }

  static async updateTrialSettings(data: Partial<TrialSettingsData>): Promise<TrialSettingsData> {
    trialSettingsStore = { ...trialSettingsStore, ...data };
    return trialSettingsStore;
  }

  /**
   * Ensure default plans exist in database and return all plans with active subscriber count
   */
  static async getPlans(): Promise<SubscriptionPlanData[]> {
    try {
      let plans = await prisma.subscription_plans.findMany({
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
        orderBy: {
          price: "asc",
        },
      });

      // Auto-seed if table is empty
      if (plans.length === 0) {
        for (const p of DEFAULT_PLANS) {
          await prisma.subscription_plans.upsert({
            where: { type: p.type },
            create: {
              ...p,
              updatedAt: new Date(),
            },
            update: {},
          }).catch(() => {});
        }

        plans = await prisma.subscription_plans.findMany({
          include: {
            _count: {
              select: {
                subscriptions: true,
              },
            },
          },
          orderBy: {
            price: "asc",
          },
        }).catch(() => []);
      }

      if (plans && plans.length > 0) {
        return plans.map(mapToPlanData);
      }
    } catch (err) {
      console.warn("[SubscriptionService] Database connection slow or unavailable, returning default plans fallback:", err);
    }

    return DEFAULT_PLANS.map(mapToPlanData);
  }

  static async getPlanById(id: string): Promise<SubscriptionPlanData> {
    const plan = await prisma.subscription_plans.findFirst({
      where: buildPlanWhereClause(id),
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) throw new NotFoundError("Subscription Plan");
    return mapToPlanData(plan);
  }

  static async getPlanByTier(tier: SubscriptionPlanType): Promise<SubscriptionPlanData> {
    const plan = await prisma.subscription_plans.findUnique({
      where: { type: tier },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) throw new NotFoundError(`Subscription Plan for tier ${tier}`);
    return mapToPlanData(plan);
  }

  static async createPlan(data: {
    name: string;
    type?: SubscriptionPlanType | string;
    price: number;
    billingCycle?: string;
    maxBranches?: number | null;
    maxManagers?: number | null;
    maxEmployees?: number | null;
    faceRecognition?: boolean;
    gpsVerification?: boolean;
    fingerprint?: boolean;
    payroll?: boolean;
    analytics?: boolean;
    apiAccess?: boolean;
    whiteLabel?: boolean;
    customDomain?: boolean;
    prioritySupport?: boolean;
  }): Promise<SubscriptionPlanData> {
    const rawType = (data.type || "STARTER").toUpperCase();
    let validatedType: SubscriptionPlanType = SubscriptionPlanType.STARTER;
    if (rawType === "FREE") validatedType = SubscriptionPlanType.FREE;
    else if (rawType === "BUSINESS") validatedType = SubscriptionPlanType.BUSINESS;
    else if (rawType === "ENTERPRISE") validatedType = SubscriptionPlanType.ENTERPRISE;

    const existing = await prisma.subscription_plans.findUnique({
      where: { type: validatedType },
    });

    if (existing) {
      return this.updatePlan(existing.id, { ...data, type: validatedType });
    }

    const created = await prisma.subscription_plans.create({
      data: {
        id: `plan-${validatedType.toLowerCase()}-${Date.now()}`,
        name: data.name,
        type: validatedType,
        price: data.price,
        billingCycle: data.billingCycle || "monthly",
        maxBranches: data.maxBranches,
        maxManagers: data.maxManagers,
        maxEmployees: data.maxEmployees,
        faceRecognition: data.faceRecognition ?? false,
        gpsVerification: data.gpsVerification ?? false,
        fingerprint: data.fingerprint ?? false,
        payroll: data.payroll ?? false,
        analytics: data.analytics ?? false,
        apiAccess: data.apiAccess ?? false,
        whiteLabel: data.whiteLabel ?? false,
        customDomain: data.customDomain ?? false,
        prioritySupport: data.prioritySupport ?? false,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return mapToPlanData(created);
  }

  static async updatePlan(id: string, data: Partial<SubscriptionPlanData>): Promise<SubscriptionPlanData> {
    const plan = await prisma.subscription_plans.findFirst({
      where: buildPlanWhereClause(id),
    });

    if (!plan) throw new NotFoundError("Subscription Plan");

    const updated = await prisma.subscription_plans.update({
      where: { id: plan.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.monthlyPrice !== undefined ? { price: data.monthlyPrice } : {}),
        ...(data.billingCycle ? { billingCycle: data.billingCycle } : {}),
        ...(data.maxBranches !== undefined ? { maxBranches: data.maxBranches } : {}),
        ...(data.maxManagers !== undefined ? { maxManagers: data.maxManagers } : {}),
        ...(data.maxEmployees !== undefined ? { maxEmployees: data.maxEmployees } : {}),
        ...(data.faceRecognition !== undefined ? { faceRecognition: data.faceRecognition } : {}),
        ...(data.gpsVerification !== undefined ? { gpsVerification: data.gpsVerification } : {}),
        ...(data.fingerprint !== undefined ? { fingerprint: data.fingerprint } : {}),
        ...(data.payroll !== undefined ? { payroll: data.payroll } : {}),
        ...(data.analytics !== undefined ? { analytics: data.analytics } : {}),
        ...(data.apiAccess !== undefined ? { apiAccess: data.apiAccess } : {}),
        ...(data.whiteLabel !== undefined ? { whiteLabel: data.whiteLabel } : {}),
        ...(data.customDomain !== undefined ? { customDomain: data.customDomain } : {}),
        ...(data.prioritySupport !== undefined ? { prioritySupport: data.prioritySupport } : {}),
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return mapToPlanData(updated);
  }

  static async deletePlan(id: string): Promise<{ deleted: boolean; id: string }> {
    const plan = await prisma.subscription_plans.findFirst({
      where: buildPlanWhereClause(id),
    });

    if (!plan) throw new NotFoundError("Subscription Plan");

    await prisma.subscriptions.deleteMany({
      where: { planId: plan.id },
    }).catch(() => {});

    await prisma.subscription_plans.delete({
      where: { id: plan.id },
    });

    return { deleted: true, id: plan.id };
  }

  /**
   * Get an Organization's current active subscription plan, usage, and quota limits
   */
  static async getOrganizationPlan(organizationId: string) {
    const validOrgId = await resolveOrganizationId(organizationId);

    // 1. Find active or trial subscription
    const sub = await prisma.subscriptions.findFirst({
      where: {
        organizationId: validOrgId,
        status: { in: ["ACTIVE", "TRIAL"] },
      },
      include: {
        subscription_plans: true,
      },
    }).catch(() => null);

    let activePlan: SubscriptionPlanData;

    if (sub?.subscription_plans) {
      activePlan = mapToPlanData(sub.subscription_plans);
    } else {
      // Default to FREE Plan from DB or fallback
      const freePlanDb = await prisma.subscription_plans.findFirst({
        where: { type: SubscriptionPlanType.FREE },
      }).catch(() => null);

      if (freePlanDb) {
        activePlan = mapToPlanData(freePlanDb);
      } else {
        activePlan = mapToPlanData(DEFAULT_PLANS[0]);
      }
    }

    // 2. Count current organization usage
    const [employeesCount, managersCount, branchesCount] = await Promise.all([
      prisma.employees.count({ where: { organizationId: validOrgId } }).catch(() => 0),
      prisma.managers.count({ where: { organizationId: validOrgId } }).catch(() => 0),
      prisma.branches.count({ where: { organizationId: validOrgId } }).catch(() => 0),
    ]);

    const isTrial = sub?.status === "TRIAL" || activePlan.type === SubscriptionPlanType.FREE;
    const now = new Date();
    const startDate = sub?.startDate ? new Date(sub.startDate) : new Date();
    const elapsedDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let daysRemaining = 30;
    if (sub?.endDate) {
      const end = new Date(sub.endDate);
      daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      daysRemaining = Math.max(0, 30 - (elapsedDays % 30));
    }

    const isExpired = sub?.status === "EXPIRED" || (isTrial && daysRemaining === 0);
    const resolvedEndDate = sub?.endDate
      ? sub.endDate.toISOString()
      : new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000).toISOString();

    const isEnterprise =
      activePlan.type === SubscriptionPlanType.ENTERPRISE ||
      (activePlan as any).tier === "ENTERPRISE" ||
      activePlan.name?.toUpperCase().includes("ENTERPRISE");

    if (isEnterprise) {
      activePlan.maxManagers = null;
      activePlan.maxBranches = null;
      activePlan.maxEmployees = null;
    }

    return {
      plan: activePlan,
      status: isExpired ? "EXPIRED" : (sub?.status || (isTrial ? "TRIAL" : "ACTIVE")),
      isTrial,
      daysRemaining,
      trialDaysRemaining: isTrial ? daysRemaining : null,
      isExpired,
      isTrialExpired: isTrial && isExpired,
      startDate: sub?.startDate?.toISOString() || new Date().toISOString(),
      endDate: resolvedEndDate,
      usage: {
        employees: employeesCount,
        managers: managersCount,
        branches: branchesCount,
      },
      limits: {
        maxEmployees: isEnterprise ? null : activePlan.maxEmployees,
        maxManagers: isEnterprise ? null : activePlan.maxManagers,
        maxBranches: isEnterprise ? null : activePlan.maxBranches,
        faceRecognition: activePlan.faceRecognition,
        gpsVerification: activePlan.gpsVerification,
        fingerprint: activePlan.fingerprint,
        payroll: activePlan.payroll,
        analytics: activePlan.analytics,
        apiAccess: activePlan.apiAccess,
        whiteLabel: activePlan.whiteLabel,
        customDomain: activePlan.customDomain,
        prioritySupport: activePlan.prioritySupport,
      },
    };
  }

  /**
   * Enforce employee creation limit against current subscription
   */
  static async assertCanAddEmployee(organizationId: string) {
    if (!organizationId) return;
    const planInfo = await this.getOrganizationPlan(organizationId);
    const isEnterprise =
      planInfo.plan.type === SubscriptionPlanType.ENTERPRISE ||
      (planInfo.plan as any).tier === "ENTERPRISE" ||
      planInfo.plan.name?.toUpperCase().includes("ENTERPRISE");

    if (isEnterprise) return; // Unlimited staff on Enterprise

    const { maxEmployees } = planInfo.limits;
    const currentCount = planInfo.usage.employees;

    if (maxEmployees !== null && maxEmployees !== undefined && maxEmployees !== -1 && currentCount >= maxEmployees) {
      throw new PlanLimitExceededError(
        `Employee limit reached (${currentCount}/${maxEmployees}). Your current ${planInfo.plan.name} allows up to ${maxEmployees} employees. Please upgrade your subscription plan in billing settings.`
      );
    }
  }

  /**
   * Enforce manager creation limit against current subscription
   */
  static async assertCanAddManager(organizationId: string) {
    if (!organizationId) return;
    const planInfo = await this.getOrganizationPlan(organizationId);
    const isEnterprise =
      planInfo.plan.type === SubscriptionPlanType.ENTERPRISE ||
      (planInfo.plan as any).tier === "ENTERPRISE" ||
      planInfo.plan.name?.toUpperCase().includes("ENTERPRISE");

    if (isEnterprise) return; // Unlimited branch managers on Enterprise

    const { maxManagers } = planInfo.limits;
    const currentCount = planInfo.usage.managers;

    if (maxManagers !== null && maxManagers !== undefined && maxManagers !== -1 && currentCount >= maxManagers) {
      throw new PlanLimitExceededError(
        `Manager limit reached (${currentCount}/${maxManagers}). Your current ${planInfo.plan.name} allows up to ${maxManagers} manager(s). Please upgrade your subscription plan to assign additional managers.`
      );
    }
  }

  /**
   * Enforce branch creation limit against current subscription
   */
  static async assertCanAddBranch(organizationId: string) {
    if (!organizationId) return;
    const planInfo = await this.getOrganizationPlan(organizationId);
    const isEnterprise =
      planInfo.plan.type === SubscriptionPlanType.ENTERPRISE ||
      (planInfo.plan as any).tier === "ENTERPRISE" ||
      planInfo.plan.name?.toUpperCase().includes("ENTERPRISE");

    if (isEnterprise) return; // Unlimited branches on Enterprise

    const { maxBranches } = planInfo.limits;
    const currentCount = planInfo.usage.branches;

    if (maxBranches !== null && maxBranches !== undefined && maxBranches !== -1 && currentCount >= maxBranches) {
      throw new PlanLimitExceededError(
        `Branch location limit reached (${currentCount}/${maxBranches}). Your current ${planInfo.plan.name} allows up to ${maxBranches} branch location(s). Please upgrade your subscription plan to add more branches.`
      );
    }
  }

  /**
   * Enforce feature gate assertion
   */
  static async assertFeatureEnabled(
    organizationId: string, 
    feature: "faceRecognition" | "gpsVerification" | "fingerprint" | "payroll" | "analytics" | "apiAccess" | "whiteLabel" | "customDomain" | "prioritySupport"
  ) {
    if (!organizationId) return;
    const planInfo = await this.getOrganizationPlan(organizationId);
    if (!planInfo.limits[feature]) {
      throw new PlanLimitExceededError(
        `The feature '${feature}' is not included in your ${planInfo.plan.name} subscription plan. Please upgrade your subscription to unlock this feature.`
      );
    }
  }
}
