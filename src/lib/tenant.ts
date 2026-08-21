/**
 * Multi-Tenant Isolation & Repository Guards
 *
 * Guarantees that no tenant can read, modify, or delete another tenant's data.
 * Injects and validates organizationId at the repository layer.
 */

export interface TenantContext {
  organizationId: string;
  userId: string;
  userRole: "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";
}

export class TenantSecurityError extends Error {
  statusCode: number;
  constructor(message: string = "Cross-tenant access violation: Access Denied", statusCode: number = 403) {
    super(message);
    this.name = "TenantSecurityError";
    this.statusCode = statusCode;
  }
}

/**
 * Asserts that a target entity belongs to the requesting tenant context.
 * Super Admins are granted global access; all other roles MUST match organizationId.
 */
export function assertTenantAccess(
  context: TenantContext | null | undefined,
  targetOrganizationId: string | null | undefined
): void {
  if (!context) {
    throw new TenantSecurityError("Unauthorized: Missing authentication session", 401);
  }

  // Super Admin has platform-wide authority
  if (context.userRole === "SUPER_ADMIN") {
    return;
  }

  if (!context.organizationId || !targetOrganizationId || context.organizationId !== targetOrganizationId) {
    throw new TenantSecurityError(
      `Tenant Isolation Violation: User belonging to org '${context.organizationId}' attempted to access data of org '${targetOrganizationId}'`,
      403
    );
  }
}

/**
 * Enforces tenant scope onto a Prisma query filter object
 */
export function withTenantScope<T extends Record<string, any>>(
  context: TenantContext,
  queryFilter: T
): T & { organizationId?: string } {
  if (context.userRole === "SUPER_ADMIN") {
    return queryFilter;
  }

  return {
    ...queryFilter,
    organizationId: context.organizationId,
  };
}

/**
 * Validates Manager branch & team authorization
 */
export function assertManagerTeamAccess(
  managerAssignedBranches: string[],
  targetBranch: string
): void {
  if (!managerAssignedBranches.includes(targetBranch) && !managerAssignedBranches.includes("All")) {
    throw new TenantSecurityError("Access Denied: You do not manage this branch or team", 403);
  }
}
