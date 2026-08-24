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
  defaultTrialDays: 14,
  trialPlanId: "plan-starter",
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
    name: "Free Tier",
    type: SubscriptionPlanType.FREE,
    price: 0,
    billingCycle: "monthly",
    maxBranches: 1,
    maxManagers: 1,
    maxEmployees: 10,
    faceRecognition: true,
    gpsVerification: true,
    fingerprint: false,
    payroll: false,
    analytics: false,
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
  const upper = id?.trim().toUpperCase();
  if (isSubscriptionPlanType(upper)) {
    return {
      OR: [
        { id },
        { type: upper },
      ],
    };
  }
  return { id };
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
}
