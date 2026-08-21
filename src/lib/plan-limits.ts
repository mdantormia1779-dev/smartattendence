/**
 * Subscription Plan Limit Enforcement
 *
 * Checks branch, manager, employee caps and feature unlocks against the tenant's active plan.
 */

export interface PlanConfig {
  name: string;
  maxBranches: number; // -1 for unlimited
  maxManagers: number; // -1 for unlimited
  maxEmployees: number; // -1 for unlimited
  hasFaceRecog: boolean;
  hasGpsGeofence: boolean;
  hasShiftMgmt: boolean;
  hasLeaveMgmt: boolean;
  hasPayroll: boolean;
  hasBiometrics: boolean;
  hasAnalytics: boolean;
  hasWhiteLabel: boolean;
}

export const PLAN_TIERS: Record<string, PlanConfig> = {
  FREE: {
    name: "Free",
    maxBranches: 1,
    maxManagers: 1,
    maxEmployees: 10,
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: true,
    hasLeaveMgmt: true,
    hasPayroll: false,
    hasBiometrics: false,
    hasAnalytics: false,
    hasWhiteLabel: false,
  },
  STARTER: {
    name: "Starter",
    maxBranches: 2,
    maxManagers: 3,
    maxEmployees: 30,
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: true,
    hasLeaveMgmt: true,
    hasPayroll: true,
    hasBiometrics: false,
    hasAnalytics: false,
    hasWhiteLabel: false,
  },
  BUSINESS: {
    name: "Business",
    maxBranches: 10,
    maxManagers: 20,
    maxEmployees: 250,
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: true,
    hasLeaveMgmt: true,
    hasPayroll: true,
    hasBiometrics: true,
    hasAnalytics: true,
    hasWhiteLabel: false,
  },
  ENTERPRISE: {
    name: "Enterprise",
    maxBranches: -1, // Unlimited
    maxManagers: -1, // Unlimited
    maxEmployees: -1, // Unlimited
    hasFaceRecog: true,
    hasGpsGeofence: true,
    hasShiftMgmt: true,
    hasLeaveMgmt: true,
    hasPayroll: true,
    hasBiometrics: true,
    hasAnalytics: true,
    hasWhiteLabel: true,
  },
};

export class PlanLimitExceededError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "PlanLimitExceededError";
    this.statusCode = 402; // Payment Required / Upgrade needed
  }
}

/**
 * Validates branch creation cap
 */
export function validateBranchLimit(planKey: string, currentCount: number): void {
  const plan = PLAN_TIERS[planKey.toUpperCase()] || PLAN_TIERS.STARTER;
  if (plan.maxBranches !== -1 && currentCount >= plan.maxBranches) {
    throw new PlanLimitExceededError(
      `Plan Limit Reached: Your current ${plan.name} plan allows a maximum of ${plan.maxBranches} branch(es). Please upgrade your subscription to add more branches.`
    );
  }
}

/**
 * Validates manager creation cap
 */
export function validateManagerLimit(planKey: string, currentCount: number): void {
  const plan = PLAN_TIERS[planKey.toUpperCase()] || PLAN_TIERS.STARTER;
  if (plan.maxManagers !== -1 && currentCount >= plan.maxManagers) {
    throw new PlanLimitExceededError(
      `Plan Limit Reached: Your current ${plan.name} plan allows a maximum of ${plan.maxManagers} manager(s). Please upgrade your subscription to assign more managers.`
    );
  }
}

/**
 * Validates employee creation cap
 */
export function validateEmployeeLimit(planKey: string, currentCount: number): void {
  const plan = PLAN_TIERS[planKey.toUpperCase()] || PLAN_TIERS.STARTER;
  if (plan.maxEmployees !== -1 && currentCount >= plan.maxEmployees) {
    throw new PlanLimitExceededError(
      `Plan Limit Reached: Your current ${plan.name} plan allows a maximum of ${plan.maxEmployees} employee(s). Please upgrade your subscription to add more staff.`
    );
  }
}

/**
 * Validates feature access (e.g. White-label on Enterprise only)
 */
export function validateFeatureAccess(planKey: string, feature: keyof PlanConfig): boolean {
  const plan = PLAN_TIERS[planKey.toUpperCase()] || PLAN_TIERS.STARTER;
  const isAllowed = Boolean(plan[feature]);
  if (!isAllowed) {
    throw new PlanLimitExceededError(
      `Feature Locked: '${String(feature)}' is not included in the ${plan.name} plan. Upgrade to unlock.`
    );
  }
  return true;
}
