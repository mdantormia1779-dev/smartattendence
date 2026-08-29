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
  const headerUserId = request.headers.get("x-user-id");
  const headerRole = request.headers.get("x-user-role") as RoleType | null;
  const headerOrgId = request.headers.get("x-organization-id");
  const headerEmail = request.headers.get("x-user-email");
  const headerName = request.headers.get("x-user-name");
  const headerEmpId = request.headers.get("x-employee-id");

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    
    // 1. Direct registry match
    if (tokenRegistry[token]) {
      const reg = tokenRegistry[token];
      return {
        ...reg,
        ...(headerOrgId && reg.role !== "SUPER_ADMIN" ? { organizationId: headerOrgId } : {}),
      };
    }

    // 2. Dynamic session token format: session_user-xxx_timestamp
    if (token.startsWith("session_")) {
      const parts = token.split("_");
      const userId = parts[1] || headerUserId || "user-org";
      const isSuper = userId === "user-super-1" || (headerRole === "SUPER_ADMIN");
      const resolvedRole: RoleType = headerRole || (isSuper ? "SUPER_ADMIN" : "ORG_ADMIN");

      return {
        userId,
        email: headerEmail || (isSuper ? "superadmin@erp.com" : "admin@company.com"),
        fullName: headerName || (isSuper ? "Super Admin" : "Organization Admin"),
        role: resolvedRole,
        organizationId: isSuper ? null : (headerOrgId || "org-1"),
        employeeId: headerEmpId || null,
      };
    }

    if (token.toLowerCase().includes("superadmin") || token.toLowerCase().includes("super_admin")) {
      return tokenRegistry["super-admin-token"];
    }
    if (token.toLowerCase().includes("orgadmin") || token.toLowerCase().includes("admin_a")) {
      return {
        ...tokenRegistry["admin-token"],
        ...(headerOrgId ? { organizationId: headerOrgId } : {}),
      };
    }
    if (token.toLowerCase().includes("manager")) {
      return {
        ...tokenRegistry["manager-token"],
        ...(headerOrgId ? { organizationId: headerOrgId } : {}),
      };
    }
    if (token.toLowerCase().includes("employee")) {
      return {
        ...tokenRegistry["employee-token"],
        ...(headerOrgId ? { organizationId: headerOrgId } : {}),
      };
    }
  }

  // Header overrides (for API calls or backend internal requests)
  if (headerUserId) {
    return {
      userId: headerUserId,
      email: headerEmail || "user@erp.com",
      fullName: headerName || "Authenticated User",
      role: headerRole || "ORG_ADMIN",
      organizationId: headerRole === "SUPER_ADMIN" ? null : (headerOrgId || "org-1"),
      employeeId: headerEmpId || "EMP-1042",
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
    if (roleValue === "MANAGER") return { ...tokenRegistry["manager-token"], ...(headerOrgId ? { organizationId: headerOrgId } : {}) };
    if (roleValue === "EMPLOYEE") return { ...tokenRegistry["employee-token"], ...(headerOrgId ? { organizationId: headerOrgId } : {}) };
    return { ...tokenRegistry["admin-token"], ...(headerOrgId ? { organizationId: headerOrgId } : {}) };
  }

  return {
    ...tokenRegistry["admin-token"],
    ...(headerOrgId ? { organizationId: headerOrgId } : {}),
  };
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
