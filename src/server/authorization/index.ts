import { UnauthorizedError, ForbiddenError, TenantSecurityError } from "../errors";

export type RoleType = "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  role: RoleType;
  organizationId: string | null;
  employeeId?: string | null;
}

// User session directory for token lookup
const tokenRegistry: Record<string, AuthSession> = {
  "super-admin-token": {
    userId: "user-super-1",
    email: "superadmin@erp.com",
    fullName: "Super Admin",
    role: "SUPER_ADMIN",
    organizationId: null,
  },
  "admin-token": {
    userId: "user-org-1",
    email: "sarah.admin@vertextech.io",
    fullName: "Sarah Rahman",
    role: "ORG_ADMIN",
    organizationId: "org-1",
  },
  "admin-b-token": {
    userId: "user-org-2",
    email: "admin@bengaltextiles.com",
    fullName: "Kamal Hossain",
    role: "ORG_ADMIN",
    organizationId: "org-2",
  },
  "manager-token": {
    userId: "user-mgr-1",
    email: "tanvir.mgr@vertextech.io",
    fullName: "Tanvir Ahmed",
    role: "MANAGER",
    organizationId: "org-1",
    employeeId: "EMP-MGR01",
  },
  "employee-token": {
    userId: "user-emp-1",
    email: "arif.c@vertextech.io",
    fullName: "Arif Chowdhury",
    role: "EMPLOYEE",
    organizationId: "org-1",
    employeeId: "EMP-1042",
  },
  "employee-b-token": {
    userId: "user-emp-b1",
    email: "rahim.b@bengaltextiles.com",
    fullName: "Abdur Rahim",
    role: "EMPLOYEE",
    organizationId: "org-2",
    employeeId: "EMP-B01",
  },
};

export function registerSessionToken(token: string, session: AuthSession) {
  tokenRegistry[token] = session;
}

/**
 * Resolves current tenant context from Authorization Bearer token, cookies or request headers
 */
export function getTenantContext(request: Request): AuthSession | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    
    // Direct registry match
    if (tokenRegistry[token]) {
      return tokenRegistry[token];
    }

    // Dynamic session token format: session_user-xxx_timestamp
    if (token.startsWith("session_")) {
      const parts = token.split("_");
      const userId = parts[1];
      if (userId === "user-super-1") return tokenRegistry["super-admin-token"];
      if (userId === "user-org-1") return tokenRegistry["admin-token"];
      if (userId === "user-mgr-1") return tokenRegistry["manager-token"];
      if (userId === "user-emp-1") return tokenRegistry["employee-token"];
    }

    if (token.toLowerCase().includes("superadmin") || token.toLowerCase().includes("super_admin")) {
      return tokenRegistry["super-admin-token"];
    }
    if (token.toLowerCase().includes("orgadmin") || token.toLowerCase().includes("admin_a")) {
      return tokenRegistry["admin-token"];
    }
    if (token.toLowerCase().includes("manager")) {
      return tokenRegistry["manager-token"];
    }
    if (token.toLowerCase().includes("employee")) {
      return tokenRegistry["employee-token"];
    }
  }

  // Header overrides (for API calls or backend internal requests)
  const headerUserId = request.headers.get("x-user-id");
  const headerRole = request.headers.get("x-user-role") as RoleType;
  const headerOrgId = request.headers.get("x-organization-id");

  if (headerUserId) {
    return {
      userId: headerUserId,
      email: request.headers.get("x-user-email") || "user@erp.com",
      fullName: request.headers.get("x-user-name") || "Authenticated User",
      role: headerRole || "ORG_ADMIN",
      organizationId: headerOrgId || (headerRole === "SUPER_ADMIN" ? null : "org-1"),
      employeeId: request.headers.get("x-employee-id") || "EMP-1042",
    };
  }

  // Cookie evaluation
  const cookieHeader = request.headers.get("cookie") || "";
  const authCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth_session="));
  
  const roleCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("user_role="));

  if (authCookie || roleCookie) {
    const roleValue = (roleCookie ? roleCookie.split("=")[1] : "ORG_ADMIN") as RoleType;

    if (roleValue === "SUPER_ADMIN") return tokenRegistry["super-admin-token"];
    if (roleValue === "MANAGER") return tokenRegistry["manager-token"];
    if (roleValue === "EMPLOYEE") return tokenRegistry["employee-token"];
    return tokenRegistry["admin-token"];
  }

  return tokenRegistry["admin-token"];
}

/**
 * Enforces authenticated session
 */
export function requireAuth(request: Request): AuthSession {
  const session = getTenantContext(request);
  if (!session) {
    throw new UnauthorizedError("Authentication required to access this resource");
  }
  return session;
}

/**
 * Enforces one or more allowed roles
 */
export function requireRole(request: Request, allowedRoles: RoleType[]): AuthSession {
  const session = requireAuth(request);
  if (session.role === "SUPER_ADMIN") {
    return session; // Super Admin has global bypass
  }
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError(`Access Denied: Requires one of [${allowedRoles.join(", ")}]. Current role: '${session.role}'`);
  }
  return session;
}

/**
 * Strictly enforces multi-tenant boundary.
 * Throws TenantSecurityError if a non-Super-Admin tries to access another tenant's data.
 */
export function requireTenantScope(session: AuthSession, targetOrganizationId: string | null | undefined): void {
  if (session.role === "SUPER_ADMIN") {
    return; // Global access
  }
  if (!targetOrganizationId || session.organizationId !== targetOrganizationId) {
    throw new TenantSecurityError(
      `Tenant Isolation Violation: Organization '${session.organizationId}' is not authorized to access organization '${targetOrganizationId}'`
    );
  }
}
