import { OrganizationService } from "@/server/services/organization.service";
import { AuthService } from "@/server/services/auth.service";
import { CreateOrganizationSchema } from "@/server/validators";
import { requireRole, requireAuth } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forPayment = searchParams.get("for") === "payment" || searchParams.get("public") === "true";

    if (forPayment) {
      const allOrgs = await OrganizationService.getAllOrganizations();
      const publicList = allOrgs.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        email: o.email,
        totalEmployees: o.totalEmployees,
        totalBranches: o.totalBranches,
        planTier: o.planTier,
        subscriptionStatus: o.subscriptionStatus,
      }));
      return apiSuccess(publicList, "Payment organizations retrieved successfully", undefined, 200, {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      });
    }

    const session = requireAuth(request);

    if (session.role === "SUPER_ADMIN") {
      const orgs = await OrganizationService.getAllOrganizations();
      return apiSuccess(orgs, "Organizations retrieved successfully", undefined, 200, {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      });
    }

    if (session.organizationId) {
      const org = await OrganizationService.getOrganizationById(session.organizationId);
      return apiSuccess([org], "Organization retrieved successfully", undefined, 200, {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      });
    }

    return apiSuccess([], "No organizations accessible", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();
    const validated = CreateOrganizationSchema.parse(body);

    const newOrg = await OrganizationService.createOrganization(validated);

    if (validated.adminEmail && validated.adminPassword) {
      await AuthService.createOrgAdminUser({
        fullName: validated.adminName || `${validated.name} Admin`,
        email: validated.adminEmail,
        password: validated.adminPassword,
        organizationId: newOrg.id,
      });
    }

    return apiSuccess(newOrg, "Organization created successfully", undefined, 201, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
