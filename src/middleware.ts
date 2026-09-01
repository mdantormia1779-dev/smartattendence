import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-to-Route Mapping Rules
const ROLE_ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin": "SUPER_ADMIN",
  "/organizationadmin": "ORG_ADMIN",
  "/manager": "MANAGER",
  "/employee": "EMPLOYEE",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS Preflight for Mobile App & External Clients
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email, x-user-id, x-employee-id, x-organization-id",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const response = NextResponse.next();

  // CORS headers for APIs
  if (pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email, x-user-id, x-employee-id, x-organization-id");
  }

  // 1. Set Enterprise Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Skip static assets, APIs, and public pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.includes(".")
  ) {
    return response;
  }

  // 2. Check Auth & Role Session Cookie / Token
  const authSessionCookie = request.cookies.get("auth_session")?.value;
  const userRoleCookie = request.cookies.get("user_role")?.value || "ORG_ADMIN"; // Dev default if not set

  // In production, verify JWT and redirect to login if missing
  const isProtectedPath = Object.keys(ROLE_ROUTE_PERMISSIONS).some(prefix => pathname.startsWith(prefix));

  if (isProtectedPath) {
    // Check required role for prefix
    for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(prefix)) {
        // Enforce RBAC: If role doesn't match and not Super Admin, block or redirect
        if (userRoleCookie !== requiredRole && userRoleCookie !== "SUPER_ADMIN") {
          // If accessing an unauthorized portal, redirect to user's proper role dashboard or login
          console.warn(`[RBAC_BLOCK] User with role '${userRoleCookie}' blocked from '${pathname}' (Requires '${requiredRole}')`);
          
          // Redirect to appropriate home based on user's active role
          let targetPath = "/login";
          if (userRoleCookie === "ORG_ADMIN") targetPath = "/organizationadmin";
          else if (userRoleCookie === "MANAGER") targetPath = "/manager";
          else if (userRoleCookie === "EMPLOYEE") targetPath = "/employee";

          return NextResponse.redirect(new URL(targetPath, request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/organizationadmin/:path*",
    "/manager/:path*",
    "/employee/:path*",
  ],
};
