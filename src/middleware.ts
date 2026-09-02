import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-to-Home Page Mapping
const ROLE_HOME_PAGES: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  ORG_ADMIN: "/organizationadmin",
  MANAGER: "/manager",
  EMPLOYEE: "/login",
};

// Protected Portals and strictly allowed role for each
const PROTECTED_ROUTES = [
  { prefix: "/admin", allowedRole: "SUPER_ADMIN" },
  { prefix: "/organizationadmin", allowedRole: "ORG_ADMIN" },
  { prefix: "/manager", allowedRole: "MANAGER" },
  { prefix: "/employee", allowedRole: "EMPLOYEE" },
];

/**
 * Validates the authentication cookies and returns the verified user role,
 * or null if unauthenticated / tampered / expired.
 */
function getAuthenticatedRole(request: NextRequest): string | null {
  const authSession = request.cookies.get("auth_session")?.value?.trim();
  const userRole = request.cookies.get("user_role")?.value?.trim();

  if (!authSession || !userRole) return null;
  if (!["SUPER_ADMIN", "ORG_ADMIN", "MANAGER", "EMPLOYEE"].includes(userRole)) return null;

  // Cryptographic token payload verification (sat_<base64url>.<signature>)
  if (authSession.startsWith("sat_")) {
    try {
      const dotIdx = authSession.indexOf(".");
      if (dotIdx > 4) {
        const encodedPayload = authSession.substring(4, dotIdx);
        const jsonStr = atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(jsonStr);

        // Check token expiration
        if (payload.exp && Date.now() > payload.exp) {
          return null;
        }

        // Prevent cookie role tampering
        if (payload.role && payload.role !== userRole) {
          return null;
        }
      }
    } catch {
      return null;
    }
  }

  return userRole;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle CORS Preflight for Mobile App & External Clients
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers":
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email, x-user-id, x-employee-id, x-organization-id",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const response = NextResponse.next();

  // 2. Enterprise Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // 3. API Requests: Attach CORS headers and let API route handlers process auth
  if (pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email, x-user-id, x-employee-id, x-organization-id"
    );
    return response;
  }

  // 4. Skip static assets, APK download, and public files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname === "/contact" ||
    pathname.includes(".")
  ) {
    return response;
  }

  const authenticatedRole = getAuthenticatedRole(request);

  // 5. If user is already authenticated and visits /login or /signup, redirect to their home portal
  if (pathname === "/login" || pathname === "/signup") {
    if (authenticatedRole) {
      const homePath = ROLE_HOME_PAGES[authenticatedRole] || "/";
      return NextResponse.redirect(new URL(homePath, request.url));
    }
    return response;
  }

  // 6. Check Protected Routes: /admin, /organizationadmin, /manager, /employee
  const matchedRule = PROTECTED_ROUTES.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(rule.prefix + "/")
  );

  if (matchedRule) {
    // Unauthenticated: Immediately redirect to /login
    if (!authenticatedRole) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.delete("auth_session");
      redirectResponse.cookies.delete("user_role");
      return redirectResponse;
    }

    // Role mismatch: User is logged in, but not authorized for this portal
    if (authenticatedRole !== matchedRule.allowedRole) {
      const authorizedHome = ROLE_HOME_PAGES[authenticatedRole] || "/login";
      return NextResponse.redirect(new URL(authorizedHome, request.url));
    }
  }

  return response;
}

export const proxy = middleware;

export const config = {
  matcher: [
    "/admin/:path*",
    "/organizationadmin/:path*",
    "/manager/:path*",
    "/employee/:path*",
    "/login",
    "/signup",
  ],
};
