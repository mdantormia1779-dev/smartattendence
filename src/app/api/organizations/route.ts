import { NextResponse } from "next/server";
import { OrganizationService } from "@/server/services/organization.service";
import { AuthService } from "@/server/services/auth.service";
import { CreateOrganizationSchema } from "@/server/validators";
import { requireRole, requireAuth } from "@/server/authorization";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);

    if (session.role === "SUPER_ADMIN") {
      const orgs = await OrganizationService.getAllOrganizations();
      return NextResponse.json({ success: true, data: orgs });
    }

    if (session.organizationId) {
      const org = await OrganizationService.getOrganizationById(session.organizationId);
      return NextResponse.json({ success: true, data: [org] });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
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

    return NextResponse.json({ success: true, data: newOrg }, { status: 201 });
  } catch (error: any) {
    const err = handleApiError(error);
    return NextResponse.json(err.body, { status: err.statusCode });
  }
}
