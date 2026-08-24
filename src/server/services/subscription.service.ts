import { NotFoundError, PlanLimitExceededError } from "../errors";

export interface SubscriptionPlanData {
  id: string;
  name: string;
  tier: "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE";
  monthlyPrice: number;
  yearlyPrice: number;
  maxBranches: number;
  maxManagers: number;
  maxEmployees: number;
  hasFaceRecog: boolean;
  hasGpsGeofence: boolean;
  hasShiftMgmt: boolean;
  hasLeaveMgmt: boolean;
  hasPayroll: boolean;
  hasBiometrics: boolean;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasWhiteLabel: boolean;
  hasCustomDomain: boolean;
  isActive: boolean;
}

let plansStore: SubscriptionPlanData[] = [
  {
    id: "plan-free",
    name: "Free Plan",
    tier: "FREE",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxBranches: 1,
    maxManagers: 1,
    maxEmployees: 10,
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: false,
    hasLeaveMgmt: true,
    hasPayroll: false,
    hasBiometrics: false,
    hasAnalytics: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    hasCustomDomain: false,
    isActive: true,
  },
  {
    id: "plan-starter",
    name: "Starter Plan",
    tier: "STARTER",
    monthlyPrice: 39,
    yearlyPrice: 390,
    maxBranches: 2,
    maxManagers: 3,
    maxEmployees: 50,
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: true,
    hasLeaveMgmt: true,
    hasPayroll: false,
    hasBiometrics: false,
    hasAnalytics: true,
    hasApiAccess: false,
    hasWhiteLabel: false,
    hasCustomDomain: false,
    isActive: true,
  },
  {
    id: "plan-biz-1",
    name: "Business Plan",
    tier: "BUSINESS",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    maxBranches: 10,
    maxManagers: 20,
    maxEmployees: 300,
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: true,
    hasLeaveMgmt: true,
    hasPayroll: true,
    hasBiometrics: true,
    hasAnalytics: true,
    hasApiAccess: true,
    hasWhiteLabel: false,
    hasCustomDomain: false,
    isActive: true,
  },
  {
    id: "plan-ent-1",
    name: "Enterprise Plan",
    tier: "ENTERPRISE",
    monthlyPrice: 319,
    yearlyPrice: 3190,
    maxBranches: -1, // Unlimited
    maxManagers: -1,
    maxEmployees: -1,
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: true,
    hasLeaveMgmt: true,
    hasPayroll: true,
    hasBiometrics: true,
    hasAnalytics: true,
    hasApiAccess: true,
    hasWhiteLabel: true,
    hasCustomDomain: true,
    isActive: true,
  },
];

let trialSettingsStore = {
  isEnabled: true,
  durationDays: 14,
  gracePeriodDays: 3,
  requiresPaymentCard: false,
  autoExtendOnRequest: false,
};

export class SubscriptionService {
  static async getPlans() {
    return plansStore;
  }

  static async getPlanById(id: string) {
    const plan = plansStore.find((p) => p.id === id);
    if (!plan) throw new NotFoundError("Subscription Plan");
    return plan;
  }

  static async getTrialSettings() {
    return trialSettingsStore;
  }

  static async updateTrialSettings(updates: Partial<typeof trialSettingsStore>) {
    trialSettingsStore = { ...trialSettingsStore, ...updates };
    return trialSettingsStore;
  }

  static async validatePlanLimits(org: { planTier: string; totalBranches: number; totalEmployees: number }, action: "ADD_BRANCH" | "ADD_EMPLOYEE") {
    const plan = plansStore.find((p) => p.tier === org.planTier) || plansStore[1];

    if (action === "ADD_BRANCH" && plan.maxBranches !== -1 && org.totalBranches >= plan.maxBranches) {
      throw new PlanLimitExceededError(
        `Branch limit reached: Your ${plan.name} allows a maximum of ${plan.maxBranches} branches. Please upgrade your plan.`
      );
    }

    if (action === "ADD_EMPLOYEE" && plan.maxEmployees !== -1 && org.totalEmployees >= plan.maxEmployees) {
      throw new PlanLimitExceededError(
        `Employee limit reached: Your ${plan.name} allows a maximum of ${plan.maxEmployees} staff members. Please upgrade your plan.`
      );
    }

    return true;
  }
}
